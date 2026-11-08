<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Student;
use App\Services\MainSystemService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Auth\Events\Registered;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    protected $mainSystemService;

    public function __construct(MainSystemService $mainSystemService)
    {
        $this->mainSystemService = $mainSystemService;
    }
    /**
     * Register a new student user.
     */
    public function register(Request $request)
    {
        // Accept the legacy frontend field while clients update to
        // contact_number, which is the field used by this module's schema.
        if (! $request->filled('contact_number') && $request->filled('phone')) {
            $request->merge(['contact_number' => $request->input('phone')]);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            // Student Account records live in account_students. The shared
            // students table uses a different schema and has no
            // student_number column.
            'student_number' => 'required|string|unique:account_students,student_number',
            'college' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'contact_number' => 'required|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Create user and student in a transaction
        return \DB::transaction(function () use ($request) {
            // Create user locally
            $user = User::create([
                // The integrated users table stores the person's name in
                // full_name (not name).
                'full_name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                // The integrated users.role enum represents student accounts
                // as Customer.
                'role' => 'Customer',
            ]);

            // Create student reference number (STU-YYYY-XXXXXX)
            $referenceNo = 'STU-' . date('Y') . '-' . str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);

            // Create student
            $student = Student::create([
                'user_id' => $user->id,
                'reference_no' => $referenceNo,
                'student_number' => $request->student_number,
                'college' => $request->college,
                'department' => $request->department,
                'contact_number' => $request->contact_number,
                'status' => 'pending',
            ]);

            event(new Registered($user));

            // Sync to main system (non-blocking - continue even if this fails)
            try {
                $syncResult = $this->mainSystemService->createStudentUser([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => $request->password, // Plain text password for main system
                    'contact_number' => $request->contact_number,
                ]);

                if (!$syncResult['success']) {
                    Log::warning('Student registration succeeded locally but failed to sync to main system', [
                        'email' => $request->email,
                        'sync_result' => $syncResult,
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Exception during main system sync', [
                    'email' => $request->email,
                    'error' => $e->getMessage(),
                ]);
                // Don't fail the registration if sync fails
            }

            // Create token for immediate login
            $token = $user->createToken('student-account-token')->plainTextToken;

            return response()->json([
                'user' => $user->load('student'),
                'token' => $token,
                'message' => 'Registration successful! You can now login to the main system.',
            ], 201);
        });
    }

    /**
     * Check email availability before the user submits registration.
     */
    public function checkEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'available' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        return response()->json([
            'available' => ! User::where('email', $request->input('email'))->exists(),
        ]);
    }

    /**
     * Check student-number availability before registration is submitted.
     */
    public function checkStudentNumber(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'student_number' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'available' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        return response()->json([
            'available' => ! Student::where('student_number', $request->input('student_number'))->exists(),
        ]);
    }

    /**
     * Exchange a verified Main System student token for a Student Account
     * token. Sanctum personal tokens are application-scoped, so this avoids
     * treating a Main System token as a local Student Account token.
     */
    public function exchangeSsoToken(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        $mainSystemUrl = rtrim(env('MAIN_SYSTEM_API_URL', 'http://main-backend:8000/api'), '/');

        try {
            Log::info('SSO Token Exchange: Starting', [
                'main_system_url' => $mainSystemUrl,
                'token_preview' => substr($request->input('token'), 0, 20) . '...'
            ]);

            // Verify the token with Main System
            $response = \Illuminate\Support\Facades\Http::timeout(10)
                ->withToken($request->input('token'))
                ->get("{$mainSystemUrl}/user");

            if (! $response->successful()) {
                Log::warning('SSO Token Exchange: Main System rejected token', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return response()->json(['message' => 'Main System session is invalid. Please sign in again.'], 401);
            }

            $mainUser = $response->json();
            Log::info('SSO Token Exchange: Main System verified user', [
                'email' => $mainUser['email'] ?? 'unknown',
                'role' => $mainUser['role'] ?? 'unknown'
            ]);

            // Verify it's a student (Customer role)
            if (($mainUser['role'] ?? null) !== 'customer') {
                Log::warning('SSO Token Exchange: Not a student account', [
                    'role' => $mainUser['role'] ?? 'unknown'
                ]);
                return response()->json(['message' => 'This sign-in is not a student account.'], 403);
            }

            // Find student in local database
            $user = User::where('email', $mainUser['email'] ?? null)
                ->whereHas('student')
                ->first();

            if (! $user) {
                Log::warning('SSO Token Exchange: Student not found locally', [
                    'email' => $mainUser['email'] ?? 'unknown'
                ]);
                return response()->json(['message' => 'Student Account profile was not found. Please register first.'], 404);
            }

            // Revoke any existing Student Account tokens for this user to prevent token conflicts
            $user->tokens()->delete();

            // Create new Student Account token
            $token = $user->createToken('student-account-sso')->plainTextToken;

            Log::info('SSO Token Exchange: Success', [
                'user_id' => $user->id,
                'email' => $user->email
            ]);

            return response()->json([
                'user' => $user->load('student'),
                'token' => $token,
            ]);
        } catch (\Exception $e) {
            Log::error('SSO Token Exchange: Exception', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json(['message' => 'Student sign-in is temporarily unavailable. Please try again.'], 503);
        }
    }

    /**
     * Login user - now proxies to main system for authentication
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        try {
            // Authenticate against main system
            $mainSystemUrl = env('MAIN_SYSTEM_API_URL', 'http://main-backend:8000/api');
            
            $response = \Illuminate\Support\Facades\Http::timeout(10)
                ->post("{$mainSystemUrl}/login", [
                    'email' => $request->email,
                    'password' => $request->password,
                ]);

            if (!$response->successful()) {
                return response()->json([
                    'message' => 'Invalid credentials'
                ], 401);
            }

            $mainSystemData = $response->json();
            
            // Check if user is a student and exists locally
            $user = User::where('email', $request->email)->first();
            
            if (!$user) {
                return response()->json([
                    'message' => 'Student account not found. Please register first.'
                ], 404);
            }

            // Check if student is suspended
            if ($user->student && $user->student->status === 'suspended') {
                return response()->json([
                    'message' => 'Account suspended'
                ], 403);
            }

            // The Student Account frontend must receive a token issued by
            // this application; a Main System token is not a local session.
            $token = $user->createToken('student-account-token')->plainTextToken;

            return response()->json([
                'user' => $user->load('student.verifications'),
                'token' => $token,
            ]);

        } catch (\Exception $e) {
            Log::error('Login failed', [
                'email' => $request->email,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Authentication service unavailable. Please try again later.'
            ], 503);
        }
    }

    /**
     * Logout user (revoke token).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }

    /**
     * Get authenticated user.
     */
    public function me(Request $request)
    {
        $user = $request->user()->load('student.verifications');
        $student = $user->student;

        return response()->json([
            'id' => $user->id,
            'name' => $user->full_name,
            'full_name' => $user->full_name,
            'email' => $user->email,
            'avatar' => $user->avatar,
            'avatar_url' => $user->avatar ? url('storage/' . $user->avatar) : null,
            'student_number' => $student?->student_number,
            'reference_no' => $student?->reference_no,
            'college' => $student?->college,
            'department' => $student?->department,
            'year_level' => $student?->year_level,
            'section' => $student?->section,
            'birthdate' => $student?->birthdate,
            'address' => $student?->address,
            'emergency_contact_name' => $student?->emergency_contact_name,
            'emergency_contact_number' => $student?->emergency_contact_number,
            'photo_path' => $student?->photo_path,
            'signature_path' => $student?->signature_path,
            'contact_number' => $student?->contact_number,
            'phone' => $student?->contact_number,
            'student_status' => $student?->status,
            'created_at' => $user->created_at,
            'student' => $student,
        ]);
    }
}
