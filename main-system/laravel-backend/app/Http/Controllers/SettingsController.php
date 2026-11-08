<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class SettingsController extends Controller
{
    // Get current user profile
    public function getProfile()
    {
        // For now, return a default admin user
        // In production, this would be: $user = auth()->user();
        $user = User::where('role', 'admin')->first();
        
        if (!$user) {
            // Create default admin if doesn't exist
            $user = User::create([
                'full_name' => 'Administrator',
                'email' => 'admin@minsu.edu.ph',
                'password' => Hash::make('admin123'),
                'phone' => '0912-345-6789',
                'role' => 'admin',
                'status' => 'active',
                'email_verified' => true,
            ]);
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'status' => $user->status,
                'avatar_url' => $user->avatar_url,
                'created_at' => $user->created_at,
            ]
        ]);
    }

    // Update profile
    public function updateProfile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('role', 'admin')->first();
        
        $user->update([
            'full_name' => $request->full_name,
            'email' => $request->email,
            'phone' => $request->phone,
        ]);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'status' => $user->status,
            ]
        ]);
    }

    // Update password
    public function updatePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('role', 'admin')->first();

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect',
            ], 422);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'message' => 'Password updated successfully',
        ]);
    }

    // Get all users (for Account Management)
    public function getUsers()
    {
        $users = User::orderBy('created_at', 'desc')->get();

        return response()->json([
            'users' => $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'full_name' => $user->full_name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role,
                    'status' => $user->status,
                    'student_id' => $user->student_id,
                    'email_verified' => $user->email_verified,
                    'last_login' => $user->last_login,
                    'created_at' => $user->created_at,
                ];
            })
        ]);
    }

    // Create new user/admin/staff
    public function createUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email|max:255',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
            'role' => 'nullable|in:admin,staff',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Default to admin if no role specified (for Settings page)
        // Set to staff if specified (for Staff page)
        $role = $request->role ?? 'admin';

        $user = User::create([
            'full_name' => $request->full_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role' => $role,
            'status' => 'active',
            'email_verified' => true,
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'user' => [
                'id' => $user->id,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'status' => $user->status,
            ]
        ], 201);
    }

    // Update user
    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
            'status' => 'required|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update([
            'full_name' => $request->full_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'status' => $request->status,
        ]);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user,
        ]);
    }

    // Block or unblock an account without deleting the user or related records.
    public function updateUserStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $actor = $request->user();
        if (strtolower($actor->role) !== 'admin') {
            return response()->json(['message' => 'Only administrators can block or unblock accounts.'], 403);
        }

        $user = User::findOrFail($id);
        if ($user->id === $actor->id) {
            return response()->json(['message' => 'You cannot block your own account.'], 422);
        }

        if (
            $request->status === 'inactive'
            && strtolower($user->role) === 'admin'
            && User::whereRaw('LOWER(role) = ?', ['admin'])->where('status', 'active')->count() <= 1
        ) {
            return response()->json(['message' => 'Cannot block the last active administrator.'], 422);
        }

        $user->update(['status' => $request->status]);

        // A blocked account must not retain an already-issued API token.
        if ($request->status === 'inactive') {
            $user->tokens()->delete();
        }

        return response()->json([
            'message' => $request->status === 'inactive' ? 'User blocked successfully.' : 'User unblocked successfully.',
            'user' => $user->fresh(),
        ]);
    }

    // Delete user
    public function deleteUser($id)
    {
        $user = User::findOrFail($id);

        if ($user->status !== 'inactive') {
            return response()->json([
                'message' => 'Block this user before deleting the account.',
            ], 422);
        }
        
        // Prevent deleting the last admin
        if ($user->role === 'admin' && User::where('role', 'admin')->count() <= 1) {
            return response()->json([
                'message' => 'Cannot delete the last admin user',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully. Historical records were preserved.',
        ]);
    }

    // Reset user password (admin function)
    public function resetUserPassword(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'new_password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::findOrFail($id);
        
        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'message' => 'Password reset successfully',
        ]);
    }

    // Check if email is available
    public function checkEmail(Request $request)
    {
        $email = $request->input('email');
        $userId = $request->input('user_id'); // For edit mode
        
        $query = User::where('email', $email);
        
        if ($userId) {
            $query->where('id', '!=', $userId);
        }
        
        $exists = $query->exists();
        
        return response()->json([
            'available' => !$exists,
            'message' => $exists ? 'Email is already taken' : 'Email is available'
        ]);
    }
}
