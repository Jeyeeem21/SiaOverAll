<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStudentDocumentRequest;
use App\Models\Student;
use App\Models\StudentDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class StudentDocumentController extends Controller
{
    /**
     * List all documents for a student
     */
    public function index(Student $student): JsonResponse
    {
        $documents = $student->documents()
            ->with('uploader')
            ->latest()
            ->get();

        return response()->json([
            'data' => $documents,
        ]);
    }

    /**
     * Upload a new document for a student
     */
    public function store(Student $student, StoreStudentDocumentRequest $request): JsonResponse
    {
        // Authorization check
        if (!$this->canManageDocuments($request)) {
            return response()->json([
                'message' => 'You are not authorized to upload student documents.'
            ], 403);
        }

        $file = $request->file('document');
        $validated = $request->validated();

        // Generate unique filename
        $filename = sprintf(
            'student_%s_%s_%s.%s',
            $student->id,
            $validated['document_type'],
            time(),
            $file->extension()
        );

        // Store document in private disk (not publicly accessible)
        $path = $file->storeAs(
            'student-documents/' . $student->id,
            $filename,
            'private'
        );

        // Create document record
        $document = $student->documents()->create([
            'document_type' => $validated['document_type'],
            'document_name' => $validated['document_name'] ?? $file->getClientOriginalName(),
            'file_path' => $path,
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'notes' => $validated['notes'] ?? null,
            'uploaded_by' => $request->user()?->id,
        ]);

        return response()->json([
            'message' => 'Document uploaded successfully',
            'data' => $document->load('uploader'),
        ], 201);
    }

    /**
     * Get document details
     */
    public function show(Student $student, StudentDocument $document): JsonResponse
    {
        // Verify document belongs to student
        if ($document->student_id !== $student->id) {
            return response()->json([
                'message' => 'Document not found for this student.'
            ], 404);
        }

        return response()->json([
            'data' => $document->load('uploader'),
        ]);
    }

    /**
     * Download document file
     */
    public function download(Student $student, StudentDocument $document)
    {
        // Verify document belongs to student
        if ($document->student_id !== $student->id) {
            abort(404, 'Document not found for this student.');
        }

        // Authorization check
        if (!$this->canViewDocuments(request())) {
            abort(403, 'You are not authorized to download student documents.');
        }

        $disk = Storage::disk('private');
        
        if (!$disk->exists($document->file_path)) {
            abort(404, 'Document file not found.');
        }

        return $disk->download($document->file_path, $document->original_filename);
    }

    /**
     * Delete a document
     */
    public function destroy(Student $student, StudentDocument $document, Request $request): JsonResponse
    {
        // Verify document belongs to student
        if ($document->student_id !== $student->id) {
            return response()->json([
                'message' => 'Document not found for this student.'
            ], 404);
        }

        // Authorization check
        if (!$this->canManageDocuments($request)) {
            return response()->json([
                'message' => 'You are not authorized to delete student documents.'
            ], 403);
        }

        // Delete the file
        Storage::disk('private')->delete($document->file_path);

        // Delete the database record
        $document->delete();

        return response()->json([
            'message' => 'Document deleted successfully',
        ], 200);
    }

    /**
     * Check if user can manage documents
     */
    private function canManageDocuments(Request $request): bool
    {
        // Temporarily allow all for testing
        // TODO: Re-enable in production
        if (!$request->user()) {
            return true; // Allow for testing
        }

        return in_array($request->user()?->role, ['Admin', 'Staff'], true);
    }

    /**
     * Check if user can view documents
     */
    private function canViewDocuments(Request $request): bool
    {
        // Temporarily allow all for testing
        // TODO: Re-enable in production
        if (!$request->user()) {
            return true; // Allow for testing
        }

        return in_array($request->user()?->role, ['Admin', 'Staff'], true);
    }
}
