<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Student;
use App\Models\StudentVerification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Notification;
use App\Notifications\VerificationApproved;
use App\Notifications\VerificationRejected;

class StaffVerificationController extends Controller
{
    /**
     * Get verifications for staff/admin review.
     */
    public function index(Request $request)
    {
        // Check if user is staff or admin
        if (! in_array($request->user()->role, ['staff', 'admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $status = $request->query('status', 'all');
        $query = StudentVerification::with(['student.user']);

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $verifications = $query->paginate(15);

        return response()->json($verifications);
    }

    /**
     * Approve a verification document.
     */
    public function approve(Request $request, $id)
    {
        // Check if user is staff or admin
        if (! in_array($request->user()->role, ['staff', 'admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $verification = StudentVerification::with('student.user')->findOrFail($id);

        // Only pending documents can be reviewed
        if ($verification->status !== 'pending') {
            return response()->json(['message' => 'Verification is not pending'], 403);
        }

        // Update verification status
        $verification->status = 'approved';
        $verification->reviewed_by = $request->user()->id;
        $verification->reviewed_at = now();
        $verification->save();

        // Update student status to verified
        $student = $verification->student;
        $student->status = 'verified';
        $student->verified_at = now();
        $student->verified_by = $request->user()->id;
        $student->save();

        // Send notification to student
        Notification::send($student->user, new VerificationApproved($verification));

        // Log audit
        \DB::table('audit_logs')->insert([
            'user_id' => $request->user()->id,
            'action' => 'verification.approved',
            'entity_type' => 'student_verification',
            'entity_id' => $verification->id,
            'ip_address' => $request->ip(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json($verification);
    }

    /**
     * Reject a verification document.
     */
    public function reject(Request $request, $id)
    {
        // Check if user is staff or admin
        if (! in_array($request->user()->role, ['staff', 'admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'reason' => 'required|in:corrupted_file,unsupported_format,unclear_scan,incomplete_requirements,inappropriate_content,other',
            'note' => 'sometimes|string|max:500',
        ]);

        $verification = StudentVerification::with('student.user')->findOrFail($id);

        // Only pending documents can be reviewed
        if ($verification->status !== 'pending') {
            return response()->json(['message' => 'Verification is not pending'], 403);
        }

        // Update verification status
        $verification->status = 'rejected';
        $verification->rejection_reason = $request->reason;
        $verification->reviewer_note = $request->note;
        $verification->reviewed_by = $request->user()->id;
        $verification->reviewed_at = now();
        $verification->save();

        // Update student status to rejected
        $student = $verification->student;
        $student->status = 'rejected';
        $student->save();

        // Send notification to student
        Notification::send($student->user, new VerificationRejected($verification));

        // Log audit
        \DB::table('audit_logs')->insert([
            'user_id' => $request->user()->id,
            'action' => 'verification.rejected',
            'entity_type' => 'student_verification',
            'entity_id' => $verification->id,
            'meta' => json_encode(['reason' => $request->reason, 'note' => $request->note]),
            'ip_address' => $request->ip(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json($verification);
    }
}
