<?php

namespace App\Http\Controllers;

use App\Models\Sticker;
use App\Models\StickerRequest;
use App\Models\StickerRequestHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class StaffStickerController extends Controller
{
    /**
     * Get all sticker requests (staff view)
     */
    public function index(Request $request): JsonResponse
    {
        $query = StickerRequest::with(['student.user', 'reviewer', 'sticker'])
            ->orderBy('created_at', 'desc');

        // Filter by status if provided
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $requests = $query->get()->map(function ($req) {
            return [
                'id' => $req->id,
                'student_name' => $req->student?->user?->full_name ?? 'Unknown',
                'student_id' => $req->student->student_number ?? 'N/A',
                'student_email' => $req->student?->user?->email ?? 'N/A',
                'plate_number' => $req->plate_number,
                'vehicle_type' => $req->vehicle_type,
                'vehicle_model' => $req->vehicle_model,
                'vehicle_color' => $req->vehicle_color,
                'status' => $req->status,
                'remarks' => $req->remarks,
                'reviewed_by' => $req->reviewer?->full_name,
                'reviewed_at' => $req->reviewed_at?->toDateTimeString(),
                'submitted_date' => $req->created_at->toDateString(),
                'has_sticker' => $req->sticker !== null,
                'sticker_serial' => $req->sticker?->serial_number,
            ];
        });

        return response()->json([
            'data' => $requests,
            'stats' => [
                'total' => StickerRequest::count(),
                'pending' => StickerRequest::where('status', 'pending')->count(),
                'approved' => StickerRequest::where('status', 'approved')->count(),
                'rejected' => StickerRequest::where('status', 'rejected')->count(),
                'completed' => StickerRequest::where('status', 'completed')->count(),
            ],
        ]);
    }

    /**
     * Get single sticker request with details
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $stickerRequest = StickerRequest::with(['student.user', 'reviewer', 'sticker', 'histories.changedBy'])
            ->findOrFail($id);

        return response()->json([
            'data' => [
                'id' => $stickerRequest->id,
                'student' => [
                    'name' => $stickerRequest->student?->user?->full_name ?? 'Unknown',
                    'student_number' => $stickerRequest->student->student_number ?? 'N/A',
                    'email' => $stickerRequest->student?->user?->email ?? 'N/A',
                ],
                'plate_number' => $stickerRequest->plate_number,
                'vehicle_type' => $stickerRequest->vehicle_type,
                'vehicle_model' => $stickerRequest->vehicle_model,
                'vehicle_color' => $stickerRequest->vehicle_color,
                'status' => $stickerRequest->status,
                'remarks' => $stickerRequest->remarks,
                'reviewed_by' => $stickerRequest->reviewer?->full_name,
                'reviewed_at' => $stickerRequest->reviewed_at?->toDateTimeString(),
                'created_at' => $stickerRequest->created_at->toDateTimeString(),
                'documents' => [
                    'license' => Storage::exists($stickerRequest->license_path),
                    'official_receipt' => Storage::exists($stickerRequest->official_receipt_path),
                    'certificate_of_registration' => Storage::exists($stickerRequest->certificate_of_registration_path),
                ],
                'sticker' => $stickerRequest->sticker ? [
                    'serial_number' => $stickerRequest->sticker->serial_number,
                    'vehicle_code' => $stickerRequest->sticker->vehicle_code,
                    'price' => $stickerRequest->sticker->price,
                    'valid_month' => $stickerRequest->sticker->valid_month,
                    'valid_year' => $stickerRequest->sticker->valid_year,
                    'generated_at' => $stickerRequest->sticker->created_at->toDateTimeString(),
                ] : null,
                'histories' => $stickerRequest->histories->map(fn($h) => [
                    'old_status' => $h->old_status,
                    'new_status' => $h->new_status,
                    'remarks' => $h->remarks,
                    'changed_by' => $h->changedBy?->full_name ?? 'Unknown',
                    'changed_at' => $h->changed_at->toDateTimeString(),
                ]),
            ],
        ]);
    }

    /**
     * View document
     */
    public function viewDocument(int $id, string $document)
    {
        $stickerRequest = StickerRequest::findOrFail($id);

        $paths = [
            'license' => $stickerRequest->license_path,
            'official_receipt' => $stickerRequest->official_receipt_path,
            'certificate_of_registration' => $stickerRequest->certificate_of_registration_path,
        ];

        abort_unless(array_key_exists($document, $paths) && Storage::exists($paths[$document]), 404);

        return Storage::response($paths[$document]);
    }

    /**
     * Approve sticker request
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);

        $stickerRequest = StickerRequest::findOrFail($id);

        if ($stickerRequest->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending requests can be approved.',
            ], 422);
        }

        DB::transaction(function () use ($stickerRequest, $validated, $request) {
            $oldStatus = $stickerRequest->status;

            $stickerRequest->update([
                'status' => 'approved',
                'remarks' => $validated['remarks'] ?? null,
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
            ]);

            // Create history record
            StickerRequestHistory::create([
                'sticker_request_id' => $stickerRequest->id,
                'old_status' => $oldStatus,
                'new_status' => 'approved',
                'remarks' => $validated['remarks'] ?? null,
                'changed_by' => $request->user()->id,
                'changed_at' => now(),
            ]);
        });

        return response()->json([
            'message' => 'Sticker request approved successfully.',
            'data' => $stickerRequest->fresh(['student.user', 'reviewer']),
        ]);
    }

    /**
     * Decline sticker request
     */
    public function decline(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $stickerRequest = StickerRequest::findOrFail($id);

        if ($stickerRequest->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending requests can be declined.',
            ], 422);
        }

        DB::transaction(function () use ($stickerRequest, $validated, $request) {
            $oldStatus = $stickerRequest->status;

            $stickerRequest->update([
                'status' => 'rejected',
                'remarks' => $validated['reason'],
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
            ]);

            // Create history record
            StickerRequestHistory::create([
                'sticker_request_id' => $stickerRequest->id,
                'old_status' => $oldStatus,
                'new_status' => 'rejected',
                'remarks' => $validated['reason'],
                'changed_by' => $request->user()->id,
                'changed_at' => now(),
            ]);
        });

        return response()->json([
            'message' => 'Sticker request declined.',
            'data' => $stickerRequest->fresh(['student.user', 'reviewer']),
        ]);
    }

    /**
     * Generate sticker
     */
    public function generateSticker(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'vehicle_code' => ['required', 'string', 'max:20'],
            'price' => ['required', 'numeric', 'min:0'],
            'valid_month' => ['required', 'string', 'size:3'],
            'valid_year' => ['required', 'string', 'size:4'],
        ]);

        $stickerRequest = StickerRequest::findOrFail($id);

        if ($stickerRequest->status !== 'approved') {
            return response()->json([
                'message' => 'Only approved requests can generate stickers.',
            ], 422);
        }

        if ($stickerRequest->sticker) {
            return response()->json([
                'message' => 'Sticker already generated for this request.',
            ], 422);
        }

        $sticker = DB::transaction(function () use ($stickerRequest, $validated, $request) {
            // Generate unique serial number
            $serialNumber = 'MSU-' . now()->format('Y') . '-' . str_pad($stickerRequest->id, 5, '0', STR_PAD_LEFT);

            $sticker = Sticker::create([
                'sticker_request_id' => $stickerRequest->id,
                'serial_number' => $serialNumber,
                'vehicle_code' => $validated['vehicle_code'],
                'price' => $validated['price'],
                'valid_month' => strtoupper($validated['valid_month']),
                'valid_year' => $validated['valid_year'],
                'generated_by' => $request->user()->id,
            ]);

            // Generation makes the sticker ready to print. It is not a
            // completed/printed sticker until staff explicitly records that.
            $oldStatus = $stickerRequest->status;
            $stickerRequest->update(['status' => 'generated']);

            // Create history record
            StickerRequestHistory::create([
                'sticker_request_id' => $stickerRequest->id,
                'old_status' => $oldStatus,
                'new_status' => 'generated',
                'remarks' => 'Sticker generated with serial: ' . $serialNumber,
                'changed_by' => $request->user()->id,
                'changed_at' => now(),
            ]);

            return $sticker;
        });

        return response()->json([
            'message' => 'Sticker generated and ready to print.',
            'data' => $sticker->load(['request.student.user', 'generatedBy']),
        ], 201);
    }

    /**
     * Record a completed print only when staff explicitly confirms it.
     */
    public function markPrinted(Request $request, int $id): JsonResponse
    {
        $stickerRequest = StickerRequest::findOrFail($id);

        if ($stickerRequest->status !== 'generated') {
            return response()->json([
                'message' => 'Only generated stickers can be marked as printed.',
            ], 422);
        }

        DB::transaction(function () use ($stickerRequest, $request) {
            $stickerRequest->update(['status' => 'completed']);

            StickerRequestHistory::create([
                'sticker_request_id' => $stickerRequest->id,
                'old_status' => 'generated',
                'new_status' => 'completed',
                'remarks' => 'Sticker print completed by staff.',
                'changed_by' => $request->user()->id,
                'changed_at' => now(),
            ]);
        });

        return response()->json([
            'message' => 'Sticker marked as printed.',
            'data' => $stickerRequest->fresh(),
        ]);
    }

    /**
     * Get all generated stickers
     */
    public function stickers(Request $request): JsonResponse
    {
        $stickers = Sticker::with(['request.student.user', 'generatedBy'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'serial_number' => $s->serial_number,
                'vehicle_code' => $s->vehicle_code,
                'student_name' => $s->request?->student?->user?->full_name ?? 'Unknown',
                'plate_number' => $s->request->plate_number,
                'price' => $s->price,
                'valid_month' => $s->valid_month,
                'valid_year' => $s->valid_year,
                'generated_by' => $s->generatedBy?->full_name ?? 'Unknown',
                'generated_at' => $s->created_at->toDateTimeString(),
            ]);

        return response()->json(['data' => $stickers]);
    }
}
