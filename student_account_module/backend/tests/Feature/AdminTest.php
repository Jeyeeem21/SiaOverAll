<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Student;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Laravel\Sanctum\PersonalAccessToken;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function admin_can_suspend_student()
    {
        // Create admin user
        $admin = User::factory()->create([
            'email' => 'admin@example.com',
            'password' => bcrypt('password123'),
            'role' => 'admin',
        ]);

        // Create student
        $studentUser = User::factory()->create([
            'email' => 'student@example.com',
            'password' => bcrypt('password123'),
            'role' => 'student',
        ]);

        $student = Student::factory()->create([
            'user_id' => $studentUser->id,
            'student_number' => 'STU123456',
            'college' => 'Test College',
            'department' => 'Test Department',
            'contact_number' => '1234567890',
            'status' => 'verified',
            'verified_at' => now(),
        ]);

        // Create some tokens for the student to verify they get revoked
        $token = $studentUser->createToken('test-token')->plainTextToken;

        $this->actingAs($admin, 'sanctum');

        $response = $this->postJson("/api/admin/students/{$studentUser->id}/suspend");

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Student suspended successfully'
        ]);

        // Check that student is now suspended
        $this->assertDatabaseHas('students', [
            'id' => $student->id,
            'status' => 'suspended',
        ]);

        // Check that tokens were revoked
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $studentUser->id,
        ]);

        // Verify that the student can no longer login with the old token
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}"
        ])->postJson('/api/login', [
            'email' => 'student@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(401);
    }

    /** @test */
    public function admin_can_reinstate_student()
    {
        // Create admin user
        $admin = User::factory()->create([
            'email' => 'admin@example.com',
            'password' => bcrypt('password123'),
            'role' => 'admin',
        ]);

        // Create suspended student
        $studentUser = User::factory()->create([
            'email' => 'student@example.com',
            'password' => bcrypt('password123'),
            'role' => 'student',
        ]);

        $student = Student::factory()->create([
            'user_id' => $studentUser->id,
            'student_number' => 'STU123456',
            'college' => 'Test College',
            'department' => 'Test Department',
            'contact_number' => '1234567890',
            'status' => 'suspended',
        ]);

        $this->actingAs($admin, 'sanctum');

        $response = $this->postJson("/api/admin/students/{$studentUser->id}/reinstate");

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Student reinstated successfully'
        ]);

        // Check that student is now pending (since they were never verified)
        $this->assertDatabaseHas('students', [
            'id' => $student->id,
            'status' => 'pending',
        ]);

        // Now test reinstating a previously verified student
        $student->status = 'verified';
        $student->verified_at = now();
        $student->save();

        $response = $this->postJson("/api/admin/students/{$studentUser->id}/reinstate");

        $response->assertStatus(200);

        // Check that student is now verified again
        $this->assertDatabaseHas('students', [
            'id' => $student->id,
            'status' => 'verified',
        ]);
    }

    /** @test */
    public function staff_cannot_suspend_students()
    {
        // Create staff user
        $staff = User::factory()->create([
            'email' => 'staff@example.com',
            'password' => bcrypt('password123'),
            'role' => 'staff',
        ]);

        // Create student
        $studentUser = User::factory()->create([
            'email' => 'student@example.com',
            'password' => bcrypt('password123'),
            'role' => 'student',
        ]);

        $student = Student::factory()->create([
            'user_id' => $studentUser->id,
            'student_number' => 'STU123456',
            'college' => 'Test College',
            'department' => 'Test Department',
            'contact_number' => '1234567890',
        ]);

        $this->actingAs($staff, 'sanctum');

        $response = $this->postJson("/api/admin/students/{$studentUser->id}/suspend");

        $response->assertStatus(403);
    }

    /** @test */
    public function student_cannot_access_admin_endpoints()
    {
        // Create student user
        $student = User::factory()->create([
            'email' => 'student@example.com',
            'password' => bcrypt('password123'),
            'role' => 'student',
        ]);

        // Create a student record
        $studentRecord = Student::factory()->create([
            'user_id' => $student->id,
            'student_number' => 'STU123456',
            'college' => 'Test College',
            'department' => 'Test Department',
            'contact_number' => '1234567890',
        ]);

        $this->actingAs($student, 'sanctum');

        // Try to suspend endpoint
        $response = $this->postJson("/api/admin/students/{$student->id}/suspend");
        $response->assertStatus(403);

        // Try to reinstate endpoint
        $response = $this->postJson("/api/admin/students/{$student->id}/reinstate");
        $response->assertStatus(403);
    }
}