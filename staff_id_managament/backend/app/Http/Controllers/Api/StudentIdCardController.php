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
                'student',
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
        $requirements = $this->idRequestRequirements($student);
        if (!$requirements['complete']) {
            return response()->json([
                'message' => 'Student ID requirements are incomplete.',
                'requirements' => $requirements,
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

            // Use student's ID number as the card number
            $card->update([
                'card_number' => $student->student_number
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
            'status' => ['required', 'in:approved,printed,expired,replacement_requested,invalid'],
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
            // When approving a new ID request, mark all old released cards as invalid
            if ($attributes['status'] === 'approved') {
                StudentIdCard::where('student_id', $card->student_id)
                    ->where('id', '!=', $card->id)
                    ->where('status', 'released')
                    ->update([
                        'status' => 'invalid',
                        'updated_at' => now()
                    ]);

                // Add history for invalidated cards
                $invalidatedCards = StudentIdCard::where('student_id', $card->student_id)
                    ->where('id', '!=', $card->id)
                    ->where('status', 'invalid')
                    ->get();

                foreach ($invalidatedCards as $oldCard) {
                    $oldCard->history()->create([
                        'status' => 'invalid',
                        'changed_by' => $request->user()?->id,
                        'notes' => 'Marked as invalid due to new ID card approval',
                    ]);
                }
            }

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
        $card->load(['student.user']);

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

    // ==================== PUBLIC ENDPOINTS FOR CROSS-MODULE ACCESS ====================

    /**
     * Get ID status by student number (public endpoint for Student Portal)
     */
    public function getPublicStudentStatus(string $studentNumber): JsonResponse
    {
        $student = Student::where('student_number', $studentNumber)->first();

        if (!$student) {
            return response()->json([
                'message' => 'Student not found with this student number.'
            ], 404);
        }

        // Get current active request (requested, approved, printed)
        $currentCard = $student->idCards()
            ->whereIn('status', ['requested', 'approved', 'printed'])
            ->with(['requestedBy', 'approvedBy', 'printedBy'])
            ->latest()
            ->first();

        // Get release history (released and invalid cards)
        $history = $student->idCards()
            ->whereIn('status', ['released', 'invalid'])
            ->latest()
            ->get()
            ->map(function ($card) {
                return [
                    'id' => $card->id,
                    'card_number' => $card->card_number,
                    'status' => $card->status,
                    'requested_at' => $card->requested_at,
                    'released_at' => $card->released_at,
                    'notes' => $card->history()->latest()->first()?->notes,
                ];
            });

        return response()->json([
            'current_card' => $currentCard ? [
                'id' => $currentCard->id,
                'card_number' => $currentCard->card_number,
                'status' => $currentCard->status,
                'requested_at' => $currentCard->requested_at,
                'approved_at' => $currentCard->approved_at,
                'printed_at' => $currentCard->printed_at,
                'notes' => $currentCard->history()->latest()->first()?->notes,
            ] : null,
            'history' => $history,
        ]);
    }

    /**
     * Request ID card by student number (public endpoint for Student Portal)
     */
    public function publicRequest(string $studentNumber, Request $request): JsonResponse
    {
        $student = Student::where('student_number', $studentNumber)->first();

        if (!$student) {
            return response()->json([
                'message' => 'Student not found with this student number.'
            ], 404);
        }

        $requirements = $this->idRequestRequirements($student);
        if (!$requirements['complete']) {
            return response()->json([
                'message' => 'Complete all ID card requirements before submitting a request.',
                'requirements' => $requirements,
            ], 422);
        }

        // Check for existing active ID card
        $existingCard = $student->idCards()
            ->whereIn('status', ['requested', 'approved', 'printed'])
            ->first();

        if ($existingCard !== null) {
            return response()->json([
                'message' => 'You already have an active ID card request. Please wait for staff to process it.',
                'existing_card' => [
                    'id' => $existingCard->id,
                    'card_number' => $existingCard->card_number,
                    'status' => $existingCard->status,
                    'requested_at' => $existingCard->requested_at,
                ]
            ], 422);
        }

        $card = DB::transaction(function () use ($student): StudentIdCard {
            // Create the card with student's ID number (same card number for all requests)
            $card = $student->idCards()->create([
                'card_number' => $student->student_number,
                'status' => 'requested',
                'requested_at' => now(),
                'requested_by' => null, // Student portal doesn't have staff user ID
            ]);

            // Create history record
            $card->history()->create([
                'status' => 'requested',
                'changed_by' => null,
                'notes' => 'ID card requested via student portal.',
            ]);

            return $card;
        });

        return response()->json([
            'message' => 'ID card request submitted successfully! Staff will process your request soon.',
            'card' => [
                'id' => $card->id,
                'card_number' => $card->card_number,
                'status' => $card->status,
                'requested_at' => $card->requested_at,
            ]
        ], 201);
    }

    /** Show the student portal exactly what must be completed before an ID can be requested. */
    public function getPublicRequestRequirements(string $studentNumber): JsonResponse
    {
        $student = Student::where('student_number', $studentNumber)->first();

        if (!$student) {
            return response()->json(['message' => 'Student not found with this student number.'], 404);
        }

        return response()->json($this->idRequestRequirements($student));
    }

    private function idRequestRequirements(Student $student): array
    {
        $student->loadMissing('user');
        $profileComplete = $student->user
            && filled($student->user->full_name)
            && filled($student->user->email)
            && filled($student->contact_number)
            && filled($student->student_number)
            && filled($student->college)
            && filled($student->department);

        $approvedDocuments = DB::table('student_verifications')
            ->where('student_id', $student->id)
            ->where('status', 'approved')
            ->pluck('document_type')
            ->all();

        $items = [
            ['key' => 'profile', 'label' => 'Profile details', 'complete' => $profileComplete, 'action' => 'Update your name, phone, college, and program.'],
            ['key' => 'photo', 'label' => 'ID photo', 'complete' => filled($student->photo_path), 'action' => 'Upload an ID photo through ID Management.'],
            ['key' => 'school_id', 'label' => 'Approved school ID', 'complete' => in_array('school_id', $approvedDocuments, true), 'action' => 'Upload your school ID in Profile and wait for approval.'],
            ['key' => 'registration_form', 'label' => 'Approved registration form', 'complete' => in_array('registration_form', $approvedDocuments, true), 'action' => 'Upload your registration form in Profile and wait for approval.'],
        ];

        return [
            'complete' => collect($items)->every(fn (array $item) => $item['complete']),
            'items' => $items,
        ];
    }
}
