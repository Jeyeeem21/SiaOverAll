<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentIdCard;
use App\Models\StudentIdRelease;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class StudentIdCardController extends Controller
{
    /**
     * List all student ID cards with pagination
     */
    public function index(): JsonResponse
    {
        $cards = StudentIdCard::query()
            ->with([
                'student' => function ($query) {
                    $query->withTrashed();
                },
                'requestedBy',
                'approvedBy',
                'printedBy',
                'releasedBy',
                'history.changedBy'
            ])
            ->latest()
            ->paginate(15);

        return response()->json($cards);
    }

    /**
     * Request a new ID card for a student
     */
    public function request(Student $student, Request $request): JsonResponse
    {
        // Check if student has photo
        if (!$student->photo_path) {
            return response()->json([
                'message' => 'Student must have a photo uploaded before requesting an ID card.'
            ], 422);
        }

        // Check for existing active ID card
        $existingCard = $student->idCards()
            ->whereIn('status', ['requested', 'approved', 'printed'])
            ->first();

        if ($existingCard !== null) {
            return response()->json([
                'message' => 'This student already has an active ID card request.',
                'existing_card' => $existingCard
            ], 422);
        }

        $card = DB::transaction(function () use ($student, $request): StudentIdCard {
            // Create the card with PENDING card number initially
            $card = $student->idCards()->create([
                'card_number' => 'PENDING',
                'status' => 'requested',
                'requested_at' => now(),
                'requested_by' => $request->user()?->id,
            ]);

            // Update with formatted card number: MBC-YYYY-XXXXXX
            $card->update([
                'card_number' => sprintf('MBC-%s-%06d', now()->format('Y'), $card->id)
            ]);

            // Create history record
            $card->history()->create([
                'status' => 'requested',
                'changed_by' => $request->user()?->id,
                'notes' => 'ID card requested.',
            ]);

            return $card;
        });

        return response()->json(
            $card->load(['student', 'history.changedBy']),
            201
        );
    }

    /**
     * Get a specific ID card details
     */
    public function show(StudentIdCard $card): JsonResponse
    {
        $card->load([
            'student',
            'requestedBy',
            'approvedBy',
            'printedBy',
            'releasedBy',
            'history.changedBy',
            'releases.releasedByUser'
        ]);

        return response()->json(['data' => $card]);
    }

    /**
     * Update ID card status (approve, print, expire, or request replacement)
     */
    public function updateStatus(StudentIdCard $card, Request $request): JsonResponse
    {
        $attributes = $request->validate([
            'status' => ['required', 'in:approved,printed,expired,replacement_requested'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'expiry_date' => ['nullable', 'date', 'after:today'],
            'replacement_reason' => ['required_if:status,replacement_requested', 'string', 'max:500'],
        ]);

        // Validate status transition using model method
        if (!$card->canTransitionTo($attributes['status'])) {
            $validTransitions = $card->getValidTransitions();
            return response()->json([
                'message' => sprintf(
                    'Cannot change status from "%s" to "%s".',
                    $card->status,
                    $attributes['status']
                ),
                'current_status' => $card->status,
                'valid_transitions' => $validTransitions,
            ], 422);
        }

        DB::transaction(function () use ($card, $attributes, $request): void {
            $timestampColumn = $attributes['status'] . '_at';
            $actorColumn = $attributes['status'] . '_by';

            $updateData = [
                'status' => $attributes['status'],
                $timestampColumn => now(),
                $actorColumn => $request->user()?->id,
            ];

            // Add expiry date if provided and status is approved or printed
            if (isset($attributes['expiry_date']) && in_array($attributes['status'], ['approved', 'printed'])) {
                $updateData['expiry_date'] = $attributes['expiry_date'];
            }

            // Add replacement reason if status is replacement_requested
            if ($attributes['status'] === 'replacement_requested' && isset($attributes['replacement_reason'])) {
                $updateData['replacement_reason'] = $attributes['replacement_reason'];
            }

            $card->update($updateData);

            $card->history()->create([
                'status' => $attributes['status'],
                'changed_by' => $request->user()?->id,
                'notes' => $attributes['notes'] ?? null,
            ]);
        });

        return response()->json(
            $card->fresh()->load(['student', 'history.changedBy'])
        );
    }

    /**
     * Release an ID card to a student
     */
    public function release(StudentIdCard $card, Request $request): JsonResponse
    {
        $attributes = $request->validate([
            'recipient_name' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($card->status !== 'printed') {
            return response()->json([
                'message' => 'Only printed ID cards can be released. Current status: ' . $card->status
            ], 422);
        }

        $release = DB::transaction(function () use ($card, $attributes, $request): StudentIdRelease {
            // Update card status to released
            $card->update([
                'status' => 'released',
                'released_at' => now(),
                'released_by' => $request->user()?->id,
            ]);

            // Create history record
            $card->history()->create([
                'status' => 'released',
                'changed_by' => $request->user()?->id,
                'notes' => $attributes['notes'] ?? null,
            ]);

            // Create release record
            return $card->releases()->create([
                'recipient_name' => $attributes['recipient_name'],
                'released_at' => now(),
                'released_by' => $request->user()?->id,
                'notes' => $attributes['notes'] ?? null,
            ]);
        });

        return response()->json(
            $release->load(['card.student', 'releasedByUser']),
            201
        );
    }

    /**
     * Preview ID card (HTML)
     */
    public function preview(StudentIdCard $card): Response
    {
        $card->load('student');

        return response()->view('id-cards.student-preview', [
            'card' => $card,
            'student' => $card->student,
        ]);
    }

    /**
     * Generate PDF for a single ID card
     */
    public function generatePdf(StudentIdCard $card): Response
    {
        $card->load('student');

        // Only allow PDF generation for approved or printed cards
        if (!in_array($card->status, ['approved', 'printed', 'released'])) {
            abort(422, 'ID card must be approved before generating PDF.');
        }

        $pdf = Pdf::loadView('id-cards.student-pdf', [
            'card' => $card,
            'student' => $card->student,
        ]);

        // ID card size: 3.375" x 2.125" (credit card size)
        $pdf->setPaper([0, 0, 243, 153], 'landscape');

        $filename = sprintf(
            'student-id-card-%s-%s.pdf',
            $card->student->student_id_number,
            now()->format('Y-m-d')
        );

        return $pdf->stream($filename);
    }

    /**
     * Generate batch PDF for multiple ID cards
     */
    public function generateBatchPdf(Request $request): Response
    {
        $validated = $request->validate([
            'card_ids' => ['required', 'array', 'min:1'],
            'card_ids.*' => ['required', 'integer', 'exists:student_id_cards,id'],
        ]);

        $cards = StudentIdCard::query()
            ->with('student')
            ->whereIn('id', $validated['card_ids'])
            ->whereIn('status', ['approved', 'printed', 'released'])
            ->get();

        if ($cards->isEmpty()) {
            abort(422, 'No valid cards found for batch generation.');
        }

        $pdf = Pdf::loadView('id-cards.student-batch-pdf', [
            'cards' => $cards,
        ]);

        // A4 landscape for batch printing
        $pdf->setPaper('a4', 'landscape');

        $filename = sprintf('student-id-cards-batch-%s.pdf', now()->format('Y-m-d-His'));

        return $pdf->stream($filename);
    }

    /**
     * Get ID card status for a specific student (for student self-tracking)
     */
    public function getStudentStatus(Student $student): JsonResponse
    {
        $cards = $student->idCards()
            ->with([
                'requestedBy',
                'approvedBy',
                'printedBy',
                'releasedBy',
                'expiredBy',
                'replacementRequestedBy',
                'history.changedBy'
            ])
            ->latest()
            ->get()
            ->map(function ($card) {
                $statusInfo = $card->getStatusInfo();
                return [
                    'id' => $card->id,
                    'card_number' => $card->card_number,
                    'status' => $card->status,
                    'status_label' => $statusInfo['label'],
                    'status_color' => $statusInfo['color'],
                    'status_icon' => $statusInfo['icon'],
                    'is_expired' => $card->isExpired(),
                    'expiry_date' => $card->expiry_date,
                    'replacement_reason' => $card->replacement_reason,
                    'requested_at' => $card->requested_at,
                    'approved_at' => $card->approved_at,
                    'printed_at' => $card->printed_at,
                    'released_at' => $card->released_at,
                    'expired_at' => $card->expired_at,
                    'replacement_requested_at' => $card->replacement_requested_at,
                    'history' => $card->history,
                    'valid_transitions' => StudentIdCard::getValidTransitions(),
                ];
            });

        return response()->json([
            'student' => [
                'id' => $student->id,
                'student_id_number' => $student->student_id_number,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'has_photo' => !is_null($student->photo_path),
            ],
            'id_cards' => $cards,
        ]);
    }

    /**
     * Delete/cancel an ID card request
     */
    public function destroy(StudentIdCard $card): JsonResponse
    {
        // Only allow deletion of 'requested' status cards
        if ($card->status !== 'requested') {
            return response()->json([
                'message' => 'Only requested ID cards can be cancelled/deleted.'
            ], 422);
        }

        $card->delete();

        return response()->json([
            'message' => 'ID card request cancelled successfully.'
        ], 200);
    }
}
