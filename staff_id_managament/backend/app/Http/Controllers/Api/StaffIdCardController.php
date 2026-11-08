<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StaffIdCard;
use App\Models\StaffIdRelease;
use App\Models\StaffInformation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StaffIdCardController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            StaffIdCard::query()->with(['staff', 'releases.releasedBy'])->latest()->paginate(12)
        );
    }

    public function request(StaffInformation $staff, Request $request): JsonResponse
    {
        $existingCard = $staff->idCards()
            ->whereIn('status', ['requested', 'approved', 'printed'])
            ->first();

        if ($existingCard !== null) {
            return response()->json(['message' => 'This staff member already has an active ID request.'], 422);
        }

        $card = DB::transaction(function () use ($staff, $request): StaffIdCard {
            $card = $staff->idCards()->create([
                'card_number' => 'PENDING',
                'status' => 'requested',
                'requested_at' => now(),
                'requested_by' => $request->user()?->id,
            ]);

            $card->update(['card_number' => sprintf('STM-%s-%06d', now()->format('Y'), $card->id)]);
            $card->history()->create([
                'status' => 'requested',
                'changed_by' => $request->user()?->id,
                'notes' => 'ID card requested.',
            ]);

            return $card;
        });

        return response()->json($card->load(['staff', 'history.changedBy']), 201);
    }

    public function updateStatus(StaffIdCard $card, Request $request): JsonResponse
    {
        $attributes = $request->validate([
            'status' => ['required', 'in:approved,printed'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $allowedTransitions = ['requested' => 'approved', 'approved' => 'printed'];
        if (($allowedTransitions[$card->status] ?? null) !== $attributes['status']) {
            return response()->json(['message' => 'This ID status change is not allowed.'], 422);
        }

        DB::transaction(function () use ($card, $attributes, $request): void {
            $timestampColumn = $attributes['status'].'_at';
            $actorColumn = $attributes['status'].'_by';
            $card->update([
                'status' => $attributes['status'],
                $timestampColumn => now(),
                $actorColumn => $request->user()?->id,
            ]);
            $card->history()->create([
                'status' => $attributes['status'],
                'changed_by' => $request->user()?->id,
                'notes' => $attributes['notes'] ?? null,
            ]);
        });

        return response()->json($card->fresh()->load(['staff', 'history.changedBy']));
    }

    public function release(StaffIdCard $card, Request $request): JsonResponse
    {
        $attributes = $request->validate([
            'recipient_name' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($card->status !== 'printed') {
            return response()->json(['message' => 'Only printed ID cards can be released.'], 422);
        }

        $release = DB::transaction(function () use ($card, $attributes, $request): StaffIdRelease {
            $card->update([
                'status' => 'released',
                'released_at' => now(),
                'released_by' => $request->user()?->id,
            ]);
            $card->history()->create([
                'status' => 'released',
                'changed_by' => $request->user()?->id,
                'notes' => $attributes['notes'] ?? null,
            ]);

            return $card->releases()->create([
                'recipient_name' => $attributes['recipient_name'],
                'released_at' => now(),
                'released_by' => $request->user()?->id,
                'notes' => $attributes['notes'] ?? null,
            ]);
        });

        return response()->json($release->load(['card.staff', 'releasedBy']), 201);
    }
}
