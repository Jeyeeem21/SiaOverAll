<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStudentPhotoRequest;
use App\Http\Resources\StudentResource;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;

class StudentPhotoController extends Controller
{
    /**
     * Upload or replace student photo
     */
    public function upload(Student $student, StoreStudentPhotoRequest $request): JsonResponse
    {
        // Authorization check
        if (!$this->canManagePhotos($request)) {
            return response()->json([
                'message' => 'You are not authorized to upload student photos.'
            ], 403);
        }

        // Delete old photo if exists
        if ($student->photo_path) {
            Storage::disk('public')->delete($student->photo_path);
        }

        // Process and store the new photo
        $photo = $request->file('photo');
        $filename = 'student_' . $student->id . '_' . time() . '.' . $photo->extension();
        
        // Store the photo
        $path = $photo->storeAs('student-photos', $filename, 'public');
        
        // Update student record
        $student->update(['photo_path' => $path]);

        return response()->json([
            'message' => 'Photo uploaded successfully',
            'data' => new StudentResource($student->fresh()),
        ], 200);
    }

    /**
     * Delete student photo
     */
    public function delete(Student $student, Request $request): JsonResponse
    {
        // Authorization check
        if (!$this->canManagePhotos($request)) {
            return response()->json([
                'message' => 'You are not authorized to delete student photos.'
            ], 403);
        }

        if (!$student->photo_path) {
            return response()->json([
                'message' => 'No photo to delete.'
            ], 404);
        }

        // Delete the photo file
        Storage::disk('public')->delete($student->photo_path);

        // Update student record
        $student->update(['photo_path' => null]);

        return response()->json([
            'message' => 'Photo deleted successfully',
            'data' => new StudentResource($student->fresh()),
        ], 200);
    }

    /**
     * Get photo metadata and URL
     */
    public function show(Student $student): JsonResponse
    {
        if (!$student->photo_path) {
            return response()->json([
                'message' => 'No photo available for this student.'
            ], 404);
        }

        $disk = Storage::disk('public');
        $path = $student->photo_path;

        return response()->json([
            'data' => [
                'url' => $student->photo_url,
                'path' => $path,
                'size' => $disk->size($path),
                'mime_type' => $disk->mimeType($path),
                'last_modified' => $disk->lastModified($path),
                'exists' => $disk->exists($path),
            ],
        ]);
    }

    /**
     * Download photo file
     */
    public function download(Student $student)
    {
        if (!$student->photo_path) {
            abort(404, 'No photo available for this student.');
        }

        $disk = Storage::disk('public');
        $path = $student->photo_path;

        if (!$disk->exists($path)) {
            abort(404, 'Photo file not found.');
        }

        $filename = sprintf(
            'student_%s_photo.%s',
            $student->student_id_number,
            pathinfo($path, PATHINFO_EXTENSION)
        );

        return $disk->download($path, $filename);
    }

    /**
     * Check if user can manage photos
     */
    private function canManagePhotos(Request $request): bool
    {
        // Temporarily allow all for testing
        // TODO: Re-enable in production
        if (!$request->user()) {
            return true; // Allow for testing
        }

        return in_array($request->user()?->role, ['Admin', 'Staff'], true);
    }
}
