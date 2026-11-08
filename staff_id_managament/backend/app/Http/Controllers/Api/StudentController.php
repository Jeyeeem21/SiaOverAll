<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Http\Resources\StudentResource;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class StudentController extends Controller
{
    public function store(StoreStudentRequest $request): StudentResource|JsonResponse
    {
        if ($response = $this->ensureStudentRecordsAccess($request)) {
            return $response;
        }

        $data = $request->validated();

        // Handle photo upload
        if ($request->hasFile('photo')) {
            $data['photo_path'] = $request->file('photo')->store('student-photos', 'public');
        }

        $student = Student::create($data);

        return (new StudentResource($student))
            ->response()
            ->setStatusCode(201);
    }

    public function index(Request $request): AnonymousResourceCollection|JsonResponse
    {
        if ($response = $this->ensureStudentRecordsAccess($request)) {
            return $response;
        }

        $students = Student::query()
            ->with('user') // Eager load user relationship for name and email
            ->when($request->filled('search'), function ($query) use ($request): void {
                $search = mb_strtolower(trim((string) $request->input('search')));

                foreach (preg_split('/\\s+/', $search, -1, PREG_SPLIT_NO_EMPTY) as $term) {
                    $query->where(function ($studentQuery) use ($term): void {
                        $studentQuery->whereRaw('LOWER(student_number) LIKE ?', ["%{$term}%"])
                            ->orWhereRaw('LOWER(reference_no) LIKE ?', ["%{$term}%"])
                            ->orWhereHas('user', function ($userQuery) use ($term) {
                                $userQuery->whereRaw('LOWER(full_name) LIKE ?', ["%{$term}%"])
                                    ->orWhereRaw('LOWER(email) LIKE ?', ["%{$term}%"]);
                            });
                    });
                }
            })
            ->when($request->filled('program'), fn ($query) => $query->where('department', $request->string('program')->toString()))
            ->when($request->filled('department'), fn ($query) => $query->where('department', $request->string('department')->toString()))
            ->when($request->filled('verification_status'), fn ($query) => $query->where('status', $request->string('verification_status')->toString()))
            ->orderByRaw('(SELECT full_name FROM users WHERE users.id = account_students.user_id)')
            ->paginate(15)
            ->withQueryString();

        return StudentResource::collection($students)->additional([
            'filter_options' => [
                'programs' => Student::query()->distinct()->pluck('department')->filter()->values(),
                'departments' => Student::query()->distinct()->pluck('department')->filter()->values(),
                'year_levels' => Student::query()->distinct()->pluck('year_level')->filter()->values(),
            ],
            'summary' => [
                'total_students' => Student::count(),
                'verified_students' => Student::where('status', 'verified')->count(),
                'pending_verification' => Student::where('status', 'pending')->count(),
            ],
        ]);
    }

    public function show(Request $request, Student $student): StudentResource|JsonResponse
    {
        if ($response = $this->ensureStudentRecordsAccess($request)) {
            return $response;
        }

        $student->load('user'); // Eager load user relationship

        return new StudentResource($student);
    }

    public function update(UpdateStudentRequest $request, Student $student): StudentResource|JsonResponse
    {
        if ($response = $this->ensureStudentRecordsAccess($request)) {
            return $response;
        }

        $validated = $request->validated();
        
        // Debug logging
        \Log::info('Update student request', [
            'student_id' => $student->id,
            'validated_data' => $validated
        ]);
        
        // Map form fields to account_students columns
        $studentData = [];
        
        if (isset($validated['student_id_number'])) {
            $studentData['student_number'] = $validated['student_id_number'];
        }
        if (isset($validated['student_number'])) {
            $studentData['student_number'] = $validated['student_number'];
        }
        if (isset($validated['department'])) {
            $studentData['department'] = $validated['department'];
        }
        if (isset($validated['program'])) {
            $studentData['department'] = $validated['program']; // Map program to department
        }
        if (isset($validated['college'])) {
            $studentData['college'] = $validated['college'];
        }
        if (isset($validated['year_level'])) {
            $studentData['year_level'] = $validated['year_level'];
        }
        if (isset($validated['section'])) {
            $studentData['section'] = $validated['section'];
        }
        if (isset($validated['contact_number'])) {
            $studentData['contact_number'] = $validated['contact_number'];
        }
        if (isset($validated['birthdate'])) {
            $studentData['birthdate'] = $validated['birthdate'];
        }
        if (isset($validated['address'])) {
            $studentData['address'] = $validated['address'];
        }
        if (isset($validated['emergency_contact_name'])) {
            $studentData['emergency_contact_name'] = $validated['emergency_contact_name'];
        }
        if (isset($validated['emergency_contact_number'])) {
            $studentData['emergency_contact_number'] = $validated['emergency_contact_number'];
        }
        if (isset($validated['verification_status'])) {
            $studentData['status'] = $validated['verification_status']; // Map to status column
        }

        // Handle photo upload
        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($student->photo_path) {
                \Storage::disk('public')->delete($student->photo_path);
            }
            $studentData['photo_path'] = $request->file('photo')->store('student-photos', 'public');
        }

        // Handle signature upload
        if ($request->hasFile('signature')) {
            // Delete old signature if exists
            if ($student->signature_path) {
                \Storage::disk('public')->delete($student->signature_path);
            }
            $studentData['signature_path'] = $request->file('signature')->store('student-signatures', 'public');
        }

        // Update account_students table
        if (!empty($studentData)) {
            \Log::info('Updating account_students', ['data' => $studentData]);
            $student->update($studentData);
        }

        // Update users table if user-related fields are provided
        if ($student->user) {
            $userData = [];
            
            // Build full_name from first_name, middle_name, last_name
            $nameParts = [];
            if (isset($validated['first_name'])) {
                $nameParts[] = $validated['first_name'];
            }
            if (isset($validated['middle_name']) && !empty($validated['middle_name'])) {
                $nameParts[] = $validated['middle_name'];
            }
            if (isset($validated['last_name'])) {
                $nameParts[] = $validated['last_name'];
            }
            
            if (!empty($nameParts)) {
                $userData['full_name'] = implode(' ', $nameParts);
            }
            
            if (isset($validated['email'])) {
                $userData['email'] = $validated['email'];
            }
            
            // Update user record if there's data to update
            if (!empty($userData)) {
                $student->user->update($userData);
            }
        }

        // Reload with user relationship
        $student->load('user');

        return new StudentResource($student);
    }

    public function destroy(Request $request, Student $student): JsonResponse
    {
        if ($response = $this->ensureStudentRecordsAccess($request)) {
            return $response;
        }

        // Delete photo if exists
        if ($student->photo_path) {
            \Storage::disk('public')->delete($student->photo_path);
        }

        // Delete signature if exists
        if ($student->signature_path) {
            \Storage::disk('public')->delete($student->signature_path);
        }

        // Delete registrar signature if exists
        if ($student->registrar_signature_path) {
            \Storage::disk('public')->delete($student->registrar_signature_path);
        }

        $student->delete();

        return response()->json([
            'message' => 'Student record deactivated successfully.',
        ]);
    }

    private function ensureStudentRecordsAccess(Request $request): ?JsonResponse
    {
        // Temporarily allow access without authentication for testing
        // TODO: Re-enable authentication in production
        if (!$request->user()) {
            // Allow access even without authentication for now
            return null;
        }

        if (in_array($request->user()?->role, ['Admin', 'Staff'], true)) {
            return null;
        }

        return response()->json([
            'message' => 'You are not authorized to access student records.',
        ], 403);
    }

    // ==================== PUBLIC ENDPOINTS FOR CROSS-MODULE ACCESS ====================

    /**
     * Search for student by student number (public endpoint for Student Portal)
     */
    public function searchByStudentNumber(Request $request): JsonResponse
    {
        $studentNumber = $request->input('student_number');

        if (!$studentNumber) {
            return response()->json([
                'message' => 'Student number is required.'
            ], 422);
        }

        $student = Student::where('student_number', $studentNumber)
            ->with('user')
            ->first();

        if (!$student) {
            return response()->json([
                'message' => 'Student not found with this student number.'
            ], 404);
        }

        // Safely get data with fallbacks
        $fullName = 'Unknown';
        $email = null;
        
        if ($student->user) {
            $fullName = $student->user->full_name ?? 'Unknown';
            $email = $student->user->email ?? null;
        }

        return response()->json([
            'student' => [
                'id' => $student->id,
                'student_number' => $student->student_number,
                'full_name' => $fullName,
                'email' => $email,
                'program' => $student->department ?? 'N/A',
                'year_level' => $student->year_level ?? 'N/A',
                'section' => $student->section ?? 'N/A',
                'has_photo' => !is_null($student->photo_path),
            ]
        ]);
    }

    /**
     * Update student signature (public endpoint for Student Portal)
     */
    public function updateSignature(Request $request, string $studentNumber): JsonResponse
    {
        $request->validate([
            'signature' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $student = Student::where('student_number', $studentNumber)->first();

        if (!$student) {
            return response()->json([
                'message' => 'Student not found.'
            ], 404);
        }

        // Delete old signature if exists
        if ($student->signature_path) {
            \Storage::disk('public')->delete($student->signature_path);
        }

        // Store new signature
        $signaturePath = $request->file('signature')->store('student-signatures', 'public');
        $student->signature_path = $signaturePath;
        $student->save();

        return response()->json([
            'message' => 'Signature updated successfully',
            'signature_path' => $signaturePath,
        ]);
    }

    /**
     * Upload signature for authenticated staff
     */
    public function uploadSignature(Student $student, Request $request): JsonResponse
    {
        \Log::info('Signature upload request received', [
            'student_id' => $student->id,
            'has_file' => $request->hasFile('signature')
        ]);

        $request->validate([
            'signature' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        // Delete old signature if exists
        if ($student->signature_path) {
            \Log::info('Deleting old signature', ['path' => $student->signature_path]);
            \Storage::disk('public')->delete($student->signature_path);
        }

        // Store new signature
        $signaturePath = $request->file('signature')->store('student-signatures', 'public');
        $student->signature_path = $signaturePath;
        $student->save();

        \Log::info('Signature uploaded successfully', [
            'student_id' => $student->id,
            'signature_path' => $signaturePath
        ]);

        // Refresh student to get accessor values
        $student = $student->fresh();

        return response()->json([
            'message' => 'Signature uploaded successfully',
            'data' => [
                'signature_path' => $signaturePath,
                'signature_url' => $student->signature_url,
            ]
        ], 200);
    }

    /**
     * Delete student signature
     */
    public function deleteSignature(Student $student, Request $request): JsonResponse
    {
        if (!$student->signature_path) {
            return response()->json([
                'message' => 'No signature to delete.'
            ], 404);
        }

        // Delete the signature file
        \Storage::disk('public')->delete($student->signature_path);

        // Update student record
        $student->signature_path = null;
        $student->save();

        return response()->json([
            'message' => 'Signature deleted successfully',
        ]);
    }
}
