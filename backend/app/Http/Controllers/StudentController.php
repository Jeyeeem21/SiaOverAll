<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Student;
use App\Models\StudentVerification;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class StudentController extends Controller
{
    /**
     * Update student profile.
     */
    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'college' => 'sometimes|string|max:255',
            'department' => 'sometimes|string|max:255',
            'contact_number' => 'sometimes|string|max:20',
        ]);

        $user = $request->user();
        $student = $user->student;

        // Update user fields
        if ($request->has('name')) {
            $user->name = $request->name;
            $user->save();
        }

        // Update student fields
        if ($request->has('college')) {
            $student->college = $request->college;
        }
        if ($request->has('department')) {
            $student->department = $request->department;
        }
        if ($request->has('contact_number')) {
            $student->contact_number = $request->contact_number;
        }

        $student->save();

        return response()->json($user->load('student'));
    }

    /**
     * Upload a verification document.
     */
    public function uploadVerification(Request $request)
    {
        $student = $request->user()->student;

        // Check if student can upload
        if ($student->status === 'verified') {
            return response()->json(['message' => 'Student already verified'], 403);
        }

        if ($student->status === 'suspended') {
            return response()->json(['message' => 'Account suspended'], 403);
        }

        // Check if there's already a pending document
        $pendingVerification = $student->verifications()
            ->where('status', 'pending')
            ->first();

        if ($pendingVerification) {
            return response()->json(['message' => 'Already has a pending document'], 403);
        }

        $request->validate([
            'document_type' => 'required|in:school_id,registration_form',
            'file' => 'required|file|max:10240', // 10 MB
        ]);

        // Validate file type
        $allowedMimes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (! in_array($request->file('file')->getMimeType(), $allowedMimes)) {
            return response()->json(['message' => 'Unsupported file format'], 422);
        }

        // Store file on private disk
        $path = $request->file('file')->store(
            "verifications/{$student->id}",
            ['disk' => 'local']
        );

        // Create verification record
        $verification = StudentVerification::create([
            'student_id' => $student->id,
            'document_type' => $request->document_type,
            'file_path' => $path,
            'original_name' => $request->file('file')->getClientOriginalName(),
            'mime' => $request->file('file')->getMimeType(),
            'size' => $request->file('file')->getSize(),
            'status' => 'pending',
        ]);

        // Update student status to pending if it was rejected
        if ($student->status === 'rejected') {
            $student->status = 'pending';
            $student->save();
        }

        return response()->json($verification, 201);
    }

    /**
     * Get verification file (only for owner or staff/admin).
     */
    public function getVerificationFile(Request $request, $id)
    {
        $verification = StudentVerification::findOrFail($id);
        $student = $request->user()->student;

        // Check authorization
        $isOwner = $verification->student_id === $student->id;
        $isStaffOrAdmin = in_array($request->user()->role, ['staff', 'admin']);

        if (! $isOwner && ! $isStaffOrAdmin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Log document access
        \DB::table('audit_logs')->insert([
            'user_id' => $request->user()->id,
            'action' => 'document.viewed',
            'entity_type' => 'student_verification',
            'entity_id' => $verification->id,
            'ip_address' => $request->ip(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Return file as download
        $filePath = storage_path('app/' . $verification->file_path);

        if (! file_exists($filePath)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return response()->file($filePath, [
            'Content-Type' => $verification->mime,
            'Content-Disposition' => 'inline; filename="' . $verification->original_name . '"',
        ]);
    }

    /**
     * Get user's notifications.
     */
    public function notifications(Request $request)
    {
        $notifications = $request->user()->notifications()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($notifications);
    }

    /**
     * Mark notifications as read.
     */
    public function markNotificationsAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['message' => 'Notifications marked as read']);
    }

    /**
     * Get user's orders (calls external core system).
     */
    public function orders(Request $request)
    {
        try {
            $user = $request->user();
            $student = Student::where('user_id', $user->id)->first();
            
            if (!$student) {
                return response()->json(['error' => 'Student profile not found'], 404);
            }

            $orders = Order::where('student_id', $student->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'order_number' => $order->order_number,
                        'item' => $order->document_title,
                        'document_type' => $order->document_type,
                        'quantity' => $order->quantity,
                        'unit_price' => (float) $order->unit_price,
                        'amount' => (float) $order->total_amount,
                        'status' => $order->status,
                        'priority' => $order->priority,
                        'payment_status' => $order->payment_status,
                        'payment_method' => $order->payment_method,
                        'pickup_method' => $order->pickup_method,
                        'pickup_date' => $order->pickup_date,
                        'expected_completion' => $order->expected_completion_date,
                        'completed_at' => $order->completed_at,
                        'cancelled_reason' => $order->cancelled_reason,
                        'notes' => $order->notes,
                        'created_at' => $order->created_at,
                        'updated_at' => $order->updated_at,
                    ];
                });

            return response()->json($orders);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch orders'], 500);
        }
    }
}
