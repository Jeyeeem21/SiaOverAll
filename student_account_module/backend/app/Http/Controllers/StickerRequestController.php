<?php

namespace App\Http\Controllers;

use App\Models\StickerRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StickerRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $student = $request->user()->student;

        abort_unless($student, 403, 'A student profile is required.');

        return response()->json([
            'data' => StickerRequest::whereBelongsTo($student)->latest()->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $student = $request->user()->student;

        abort_unless($student, 403, 'A student profile is required.');

        $validated = $request->validate([
            'plate_number' => ['required', 'string', 'max:255'],
            'vehicle_type' => ['required', 'in:car,motorcycle,suv,van,other'],
            'vehicle_model' => ['nullable', 'string', 'max:255'],
            'vehicle_color' => ['nullable', 'string', 'max:255'],
            'license' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'official_receipt' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'certificate_of_registration' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        $stickerRequest = StickerRequest::create([
            'student_id' => $student->id,
            'plate_number' => $validated['plate_number'],
            'vehicle_type' => $validated['vehicle_type'],
            'vehicle_model' => $validated['vehicle_model'] ?? null,
            'vehicle_color' => $validated['vehicle_color'] ?? null,
            'license_path' => $validated['license']->store('sticker-requests/licenses'),
            'official_receipt_path' => $validated['official_receipt']->store('sticker-requests/receipts'),
            'certificate_of_registration_path' => $validated['certificate_of_registration']->store('sticker-requests/certificates'),
        ]);

        return response()->json([
            'message' => 'Sticker request submitted successfully.',
            'data' => $stickerRequest,
        ], 201);
    }

    public function destroy(Request $request, StickerRequest $stickerRequest): JsonResponse
    {
        $student = $request->user()->student;

        abort_unless($student && $stickerRequest->student_id === $student->id, 404);

        Storage::delete([
            $stickerRequest->license_path,
            $stickerRequest->official_receipt_path,
            $stickerRequest->certificate_of_registration_path,
        ]);

        $stickerRequest->delete();

        return response()->json(['message' => 'Sticker request deleted successfully.']);
    }

    public function document(Request $request, StickerRequest $stickerRequest, string $document)
    {
        $student = $request->user()->student;
        abort_unless($student && $stickerRequest->student_id === $student->id, 404);

        $paths = [
            'license' => $stickerRequest->license_path,
            'official_receipt' => $stickerRequest->official_receipt_path,
            'certificate_of_registration' => $stickerRequest->certificate_of_registration_path,
        ];

        abort_unless(array_key_exists($document, $paths) && Storage::exists($paths[$document]), 404);

        return Storage::response($paths[$document]);
    }
}
