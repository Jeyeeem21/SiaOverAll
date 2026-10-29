<?php

namespace App\Http\Controllers;

use App\Models\StickerRequest;
use App\Models\StickerType;
use App\Models\Sticker;
use App\Services\StickerService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class StickerRequestController extends Controller
{
    protected StickerService $stickerService;

    public function __construct(StickerService $stickerService)
    {
        $this->stickerService = $stickerService;
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = StickerRequest::query();

        if ($user->role !== 'admin' && $user->role !== 'staff') {
            $query->where('user_id', $user->id);
        }

        $requests = $query
            ->with(['stickerType', 'user', 'stickers', 'attachments'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($requests);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'sticker_type_id' => 'required|exists:sticker_types,id',
            'quantity' => 'required|integer|min:1|max:100',
            'vehicle_registration' => 'nullable|string|max:50',
            'vehicle_type' => 'nullable|string|max:50',
            'vehicle_color' => 'nullable|string|max:50',
            'vehicle_model' => 'nullable|string|max:100',
            'purpose' => 'nullable|string|max:1000',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'requirements' => 'nullable|array',
        ]);

        $validated['user_id'] = $request->user()->id;

        $stickerType = StickerType::find($validated['sticker_type_id']);
        $validated['total_amount'] = $stickerType->price * $validated['quantity'];

        $stickerRequest = StickerRequest::create($validated);

        return response()->json($stickerRequest->load(['stickerType', 'user']), 201);
    }

    public function show(StickerRequest $stickerRequest): JsonResponse
    {
        $this->authorizeRequest($stickerRequest);

        return response()->json(
            $stickerRequest->load(['stickerType', 'user', 'stickers', 'attachments', 'approver', 'releaser'])
        );
    }

    public function uploadAttachment(Request $request, StickerRequest $stickerRequest): JsonResponse
    {
        $this->authorizeRequest($stickerRequest);

        $validated = $request->validate([
            'file' => 'required|file|max:5120',
            'upload_type' => 'required|in:vehicle_document,identity,other',
        ]);

        $attachment = $this->stickerService->uploadAttachment($stickerRequest, $validated['file'], $validated['upload_type']);

        return response()->json($attachment, 201);
    }

    public function approve(Request $request, StickerRequest $stickerRequest): JsonResponse
    {
        $this->authorizeStaff();

        $validated = $request->validate([
            'approval_notes' => 'nullable|string|max:1000',
        ]);

        $stickerRequest = $this->stickerService->approveRequest($stickerRequest, $request->user(), $validated['approval_notes'] ?? null);

        return response()->json($stickerRequest);
    }

    public function reject(Request $request, StickerRequest $stickerRequest): JsonResponse
    {
        $this->authorizeStaff();

        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        $stickerRequest = $this->stickerService->rejectRequest($stickerRequest, $validated['rejection_reason']);

        return response()->json($stickerRequest);
    }

    public function markAsPaid(Request $request, StickerRequest $stickerRequest): JsonResponse
    {
        $this->authorizeStaff();

        $validated = $request->validate([
            'payment_reference' => 'required|string|max:100',
        ]);

        $stickerRequest->update([
            'status' => 'paid',
            'payment_reference' => $validated['payment_reference'],
            'payment_date' => now(),
        ]);

        return response()->json($stickerRequest);
    }

    public function markAsPrinted(Request $request, StickerRequest $stickerRequest): JsonResponse
    {
        $this->authorizeStaff();

        $stickerRequest = $this->stickerService->generateStickers($stickerRequest);

        return response()->json($stickerRequest);
    }

    public function release(Request $request, StickerRequest $stickerRequest): JsonResponse
    {
        $this->authorizeStaff();

        $stickerRequest->update([
            'status' => 'released',
            'released_at' => now(),
            'released_by' => $request->user()->id,
        ]);

        return response()->json($stickerRequest);
    }

    public function reprint(Request $request, Sticker $sticker): JsonResponse
    {
        $this->authorizeRequest($sticker->request);

        if (!$sticker->canReprint()) {
            return response()->json(['error' => 'Cannot reprint this sticker'], 422);
        }

        $sticker = $this->stickerService->reprintSticker($sticker);

        return response()->json($sticker);
    }

    public function cancel(StickerRequest $stickerRequest): JsonResponse
    {
        $this->authorizeRequest($stickerRequest);

        if (!in_array($stickerRequest->status, ['pending', 'approved'])) {
            return response()->json(['error' => 'Cannot cancel this request'], 422);
        }

        $stickerRequest->update(['status' => 'cancelled']);

        return response()->json($stickerRequest);
    }

    private function authorizeRequest(StickerRequest $stickerRequest): void
    {
        $user = auth()->user();
        if ($user->id !== $stickerRequest->user_id && !in_array($user->role, ['admin', 'staff'])) {
            abort(403);
        }
    }

    private function authorizeStaff(): void
    {
        $user = auth()->user();
        if (!in_array($user->role, ['admin', 'staff'])) {
            abort(403);
        }
    }
}
