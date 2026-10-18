<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Student;
use App\Models\StudentVerification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Event;

class StaffTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function staff_can_view_verification_queue()
    {
        // Create staff user
        $staff = User::factory()->create([
            'email' => 'staff@example.com',
            'password' => bcrypt('password123'),
            'role' => 'staff',
        ]);

        // Create some verifications
        $student1 = User::factory()->create([
            'email' => 'student1@example.com',
            'password' => bcrypt('password123'),
            'role' => 'student',
        ]);

        $student1Record = Student::factory()->create([
            'user_id' => $student1->id,
            'student_number' => 'STU111111',
            'college' => 'Test College',
            'department' => 'Test Department',
            'contact_number' => '1111111111',
            'status' => 'pending',
        ]);

        StudentVerification::factory()->create([
            'student_id' => $student1Record->id,
            'document_type' => 'school_id',
            'status' => 'pending',
        ]);

        $this->actingAs($staff, 'sanctum');

        $response = $this->getJson('/api/staff/verifications?status=pending');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'current_page',
            'data' => [
                '*' => [
                    'id',
                    'student' => [
                        'user' => [
                            'name',
                            'email'
                        ],
                        'student_number',
                        'reference_no'
                    ],
                    'document_type',
                    'status',
                    'created_at'
                ]
            ],
            'first_page_url',
            'from',
            'last_page',
            'last_page_url',
            'links',
            'next_page_url',
            'path',
            'per_page',
            'prev_page_url',
            'to',
            'total'
        ]);
    }

    /** @test */
    public function student_cannot_access_staff_verification_endpoints()
    {
        // Create student user
        $student = User::factory()->create([
            'email' => 'student@example.com',
            'password' => bcrypt('password123'),
            'role' => 'student',
        ]);

        $this->actingAs($student, 'sanctum');

        // Try to access staff endpoint
        $response = $this->getJson('/api/staff/verifications');

        $response->assertStatus(403);
    }

    /** @test */
    public function staff_can_approve_verification_document()
    {
        Notification::fake();

        // Create staff user
        $staff = User::factory()->create([
            'email' => 'staff@example.com',
            'password' => bcrypt('password123'),
            'role' => 'staff',
        ]);

        // Create student with pending verification
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
            'status' => 'pending',
        ]);

        $verification = StudentVerification::factory()->create([
            'student_id' => $student->id,
            'document_type' => 'school_id',
            'status' => 'pending',
        ]);

        $this->actingAs($staff, 'sanctum');

        $response = $this->postJson("/api/staff/verifications/{$verification->id}/approve");

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'id',
            'student_id',
            'document_type',
            'status',
            'reviewed_by',
            'reviewed_at'
        ]);

        // Check that verification is approved
        $this->assertEquals('approved', $response->json('status'));
        $this->assertEquals($staff->id, $response->json('reviewed_by'));

        // Check that student is now verified
        $this->assertDatabaseHas('students', [
            'id' => $student->id,
            'status' => 'verified',
        ]);

        // Check that notification was sent
        Notification::assertSentTo(
            $studentUser,
            \App\Notifications\VerificationApproved::class
        );
    }

    /** @test */
    public function staff_cannot_approve_non_pending_verification()
    {
        // Create staff user
        $staff = User::factory()->create([
            'email' => 'staff@example.com',
            'password' => bcrypt('password123'),
            'role' => 'staff',
        ]);

        // Create student with already approved verification
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
        ]);

        $verification = StudentVerification::factory()->create([
            'student_id' => $student->id,
            'document_type' => 'school_id',
            'status' => 'approved',
        ]);

        $this->actingAs($staff, 'sanctum');

        $response = $this->postJson("/api/staff/verifications/{$verification->id}/approve");

        $response->assertStatus(403);
    }

    /** @test */
    public function staff_can_reject_verification_document()
    {
        Notification::fake();

        // Create staff user
        $staff = User::factory()->create([
            'email' => 'staff@example.com',
            'password' => bcrypt('password123'),
            'role' => 'staff',
        ]);

        // Create student with pending verification
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
            'status' => 'pending',
        ]);

        $verification = StudentVerification::factory()->create([
            'student_id' => $student->id,
            'document_type' => 'school_id',
            'status' => 'pending',
        ]);

        $this->actingAs($staff, 'sanctum');

        $response = $this->postJson("/api/staff/verifications/{$verification->id}/reject", [
            'reason' => 'unclear_scan',
            'note' => 'The document is too blurry to read important information.'
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'id',
            'student_id',
            'document_type',
            'status',
            'rejection_reason',
            'reviewer_note',
            'reviewed_by',
            'reviewed_at'
        ]);

        // Check that verification is rejected
        $this->assertEquals('rejected', $response->json('status'));
        $this->assertEquals('unclear_scan', $response->json('rejection_reason'));
        $this->equals($staff->id, $response->json('reviewed_by'));

        // Check that student is now rejected
        $this->assertDatabaseHas('students', [
            'id' => $student->id,
            'status' => 'rejected',
        ]);

        // Check that notification was sent
        Notification::assertSentTo(
            $studentUser,
            \App\Notifications\VerificationRejected::class
        );
    }

    /** @test */
    public function staff_must_provide_reason_when_rejecting_verification()
    {
        // Create staff user
        $staff = User::factory()->create([
            'email' => 'staff@example.com',
            'password' => bcrypt('password123'),
            'role' => 'staff',
        ]);

        // Create student with pending verification
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
            'status' => 'pending',
        ]);

        $verification = StudentVerification::factory()->create([
            'student_id' => $student->id,
            'document_type' => 'school_id',
            'status' => 'pending',
        ]);

        $this->actingAs($staff, 'sanctum');

        $response = $this->postJson("/api/staff/verifications/{$verification->id}/reject", [
            'note' => 'Some note but no reason'
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['reason']);
    }

    /** @test */
    public function student_cannot_access_staff_reject_endpoint()
    {
        // Create student user
        $student = User::factory()->create([
            'email' => 'student@example.com',
            'password' => bcrypt('password123'),
            'role' => 'student',
        ]);

        // Create a verification
        $studentRecord = Student::factory()->create([
            'user_id' => $student->id,
            'student_number' => 'STU123456',
            'college' => 'Test College',
            'department' => 'Test Department',
            'contact_number' => '1234567890',
        ]);

        $verification = StudentVerification::factory()->create([
            'student_id' => $studentRecord->id,
            'document_type' => 'school_id',
            'status' => 'pending',
        ]);

        $this->actingAs($student, 'sanctum');

        $response = $this->postJson("/api/staff/verifications/{$verification->id}/reject", [
            'reason' => 'unclear_scan'
        ]);

        $response->assertStatus(403);
    }
}