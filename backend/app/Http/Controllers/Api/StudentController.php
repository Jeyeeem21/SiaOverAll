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
            ->when($request->filled('search'), function ($query) use ($request): void {
                $search = mb_strtolower(trim((string) $request->input('search')));

                foreach (preg_split('/\\s+/', $search, -1, PREG_SPLIT_NO_EMPTY) as $term) {
                    $query->where(function ($studentQuery) use ($term): void {
                        $studentQuery->whereRaw('LOWER(student_id_number) LIKE ?', ["%{$term}%"])
                            ->orWhereRaw('LOWER(first_name) LIKE ?', ["%{$term}%"])
                            ->orWhereRaw('LOWER(middle_name) LIKE ?', ["%{$term}%"])
                            ->orWhereRaw('LOWER(last_name) LIKE ?', ["%{$term}%"]);
                    });
                }
            })
            ->when($request->filled('program'), fn ($query) => $query->where('program', $request->string('program')->toString()))
            ->when($request->filled('year_level'), fn ($query) => $query->where('year_level', $request->string('year_level')->toString()))
            ->when($request->filled('department'), fn ($query) => $query->where('department', $request->string('department')->toString()))
            ->when($request->filled('verification_status'), fn ($query) => $query->where('verification_status', $request->string('verification_status')->toString()))
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate(15)
            ->withQueryString();

        return StudentResource::collection($students)->additional([
            'filter_options' => [
                'programs' => Student::query()->select('program')->distinct()->orderBy('program')->pluck('program'),
                'year_levels' => Student::query()->select('year_level')->distinct()->orderBy('year_level')->pluck('year_level'),
                'departments' => Student::query()->select('department')->distinct()->orderBy('department')->pluck('department'),
            ],
            'summary' => [
                'total_students' => Student::count(),
                'verified_students' => Student::where('verification_status', 'verified')->count(),
                'pending_verification' => Student::where('verification_status', 'pending')->count(),
            ],
        ]);
    }

    public function show(Request $request, Student $student): StudentResource|JsonResponse
    {
        if ($response = $this->ensureStudentRecordsAccess($request)) {
            return $response;
        }

        return new StudentResource($student);
    }

    public function update(UpdateStudentRequest $request, Student $student): StudentResource|JsonResponse
    {
        if ($response = $this->ensureStudentRecordsAccess($request)) {
            return $response;
        }

        $data = $request->validated();

        // Handle photo upload
        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($student->photo_path) {
                \Storage::disk('public')->delete($student->photo_path);
            }
            $data['photo_path'] = $request->file('photo')->store('student-photos', 'public');
        }

        // Handle signature upload
        if ($request->hasFile('signature')) {
            // Delete old signature if exists
            if ($student->signature_path) {
                \Storage::disk('public')->delete($student->signature_path);
            }
            $data['signature_path'] = $request->file('signature')->store('student-signatures', 'public');
        }

        // Handle registrar signature upload
        if ($request->hasFile('registrar_signature')) {
            // Delete old registrar signature if exists
            if ($student->registrar_signature_path) {
                \Storage::disk('public')->delete($student->registrar_signature_path);
            }
            $data['registrar_signature_path'] = $request->file('registrar_signature')->store('registrar-signatures', 'public');
        }

        $student->update($data);

        return new StudentResource($student->fresh());
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
}
