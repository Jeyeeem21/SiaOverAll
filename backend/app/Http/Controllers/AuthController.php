<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Auth\Events\Registered;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    /**
     * Register a new student user.
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'student_number' => 'required|string|unique:students',
            'college' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'contact_number' => 'required|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Create user and student in a transaction
        return \DB::transaction(function () use ($request) {
            // Create user
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'student',
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

            // Create token
            $token = $user->createToken('student-account-token')->plainTextToken;

            return response()->json([
                'user' => $user->load('student'),
                'token' => $token,
            ], 201);
        });
    }

    /**
     * Login user and return token.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Check if student is suspended
        if ($user->student && $user->student->status === 'suspended') {
            return response()->json(['message' => 'Account suspended'], 403);
        }

        $token = $user->createToken('student-account-token')->plainTextToken;

        return response()->json([
            'user' => $user->load('student.verifications'),
            'token' => $token,
        ]);
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
        return response()->json($request->user()->load('student.verifications'));
    }
}
