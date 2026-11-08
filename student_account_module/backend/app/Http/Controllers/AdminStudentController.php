<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;

class AdminStudentController extends Controller
{
    /**
     * Suspend a student (revoke all tokens).
     */
    public function suspend(Request $request, $id)
    {
        // Check if user is admin
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::findOrFail($id);

        // Ensure the user is actually a student
        if (! $user->student || $user->role !== 'student') {
            return response()->json(['message' => 'User is not a student'], 403);
        }

        // Revoke all tokens for the user
        $user->tokens()->delete();

        // Update student status to suspended
        $student = $user->student;
        $student->status = 'suspended';
        $student->save();

        // Log audit
        \DB::table('audit_logs')->insert([
            'user_id' => $request->user()->id,
            'action' => 'student.suspended',
            'entity_type' => 'student',
            'entity_id' => $student->id,
            'ip_address' => $request->ip(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Student suspended successfully']);
    }

    /**
     * Reinstate a student.
     */
    public function reinstate(Request $request, $id)
    {
        // Check if user is admin
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::findOrFail($id);

        // Ensure the user is actually a student
        if (! $user->student || $user->role !== 'student') {
            return response()->json(['message' => 'User is not a student'], 403);
        }

        $student = $user->student;

        // Reinstate based on previous status
        if ($student->verified_at) {
            $student->status = 'verified';
        } else {
            $student->status = 'pending';
        }

        $student->save();

        // Log audit
        \DB::table('audit_logs')->insert([
            'user_id' => $request->user()->id,
            'action' => 'student.reinstated',
            'entity_type' => 'student',
            'entity_id' => $student->id,
            'ip_address' => $request->ip(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Student reinstated successfully']);
    }
}
