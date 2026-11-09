<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Student;
use App\Models\StudentVerification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class StudentController extends Controller
{
    /**
     * Update student profile.
     */
    public function updateProfile(Request $request)
    {
        if (! $request->filled('name') && $request->filled('full_name')) {
            $request->merge(['name' => $request->input('full_name')]);
        }
        if (! $request->filled('contact_number') && $request->filled('phone')) {
            $request->merge(['contact_number' => $request->input('phone')]);
        }

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'college' => 'sometimes|string|max:255',
            'department' => 'sometimes|string|max:255',
            'contact_number' => 'sometimes|string|max:20',
            'year_level' => 'sometimes|string|max:50',
            'section' => 'sometimes|string|max:50',
            'birthdate' => 'sometimes|nullable|date',
            'address' => 'sometimes|nullable|string|max:500',
            'emergency_contact_name' => 'sometimes|nullable|string|max:255',
            'emergency_contact_number' => 'sometimes|nullable|string|max:20',
        ]);

        $user = $request->user();
        $student = $user->student;

        // Update user fields - ONLY full_name
        if ($request->has('name')) {
            $user->full_name = $request->name;
            $user->save();
        }

        // Update student fields - EXPLICITLY ONLY these fields
        // photo_path and signature_path are NOT updated here
        // They are managed by ID Management system only
        $allowedFields = [
            'college',
            'department',
            'contact_number',
            'year_level',
            'section',
            'birthdate',
            'address',
            'emergency_contact_name',
            'emergency_contact_number',
        ];

        foreach ($allowedFields as $field) {
            if ($request->has($field)) {
                $student->{$field} = $request->input($field);
            }
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
     * List verification documents belonging to the authenticated student.
     */
    public function verifications(Request $request)
    {
        $student = $request->user()->student;

        if (! $student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        return response()->json(
            $student->verifications()->latest()->get()
        );
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
        $filePath = storage_path('app/'.$verification->file_path);

        if (! file_exists($filePath)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return response()->file($filePath, [
            'Content-Type' => $verification->mime,
            'Content-Disposition' => 'inline; filename="'.$verification->original_name.'"',
        ]);
    }

    /**
     * Get user's notifications.
     */
    public function notifications(Request $request)
    {
        $notifications = $request->user()->notifications()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($notification): array {
                $isApproved = Str::endsWith($notification->type, 'VerificationApproved');
                $isRejected = Str::endsWith($notification->type, 'VerificationRejected');

                return [
                    'id' => $notification->id,
                    'title' => $isApproved
                        ? 'Verification approved'
                        : ($isRejected ? 'Verification rejected' : 'Account notification'),
                    'message' => $notification->data['message'] ?? 'You have a new notification.',
                    'type' => $isApproved ? 'success' : ($isRejected ? 'error' : 'info'),
                    'is_read' => $notification->read_at !== null,
                    'time_ago' => $notification->created_at?->diffForHumans(),
                    'created_at' => $notification->created_at,
                ];
            })
            ->values();

        return response()->json($notifications);
    }

    /**
     * Mark notifications as read.
     */
    public function markNotificationsAsRead(Request $request)
    {
        $request->validate([
            'notification_id' => 'nullable|string',
        ]);

        $notifications = $request->user()->unreadNotifications();

        if ($request->filled('notification_id')) {
            $notifications->whereKey($request->input('notification_id'));
        }

        $notifications->update(['read_at' => now()]);

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

            if (! $student) {
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

    /**
     * Upload user avatar.
     */
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max
        ]);

        $user = $request->user();

        try {
            // Delete old avatar if exists
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }

            // Store new avatar
            $path = $request->file('avatar')->store('avatars', 'public');

            // Update user record
            $user->avatar = $path;
            $user->save();

            return response()->json([
                'message' => 'Avatar uploaded successfully',
                'avatar' => $path,
                'avatar_url' => url('storage/'.$path),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to upload avatar: '.$e->getMessage()], 500);
        }
    }

    /**
     * Change user password.
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6',
        ]);

        $user = $request->user();

        // Verify current password
        if (! \Hash::check($request->current_password, $user->password)) {
            return response()->json(['error' => 'Current password is incorrect'], 422);
        }

        // Update password
        $user->password = \Hash::make($request->new_password);
        $user->save();

        return response()->json(['message' => 'Password changed successfully']);
    }
}
