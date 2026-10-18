<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Student;
use App\Models\StudentVerification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;

class StudentTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function student_can_update_own_profile()
    {
        // Create and authenticate a student
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
            'role' => 'student',
        ]);

        $student = Student::factory()->create([
            'user_id' => $user->id,
            'student_number' => 'STU123456',
            'college' => 'Original College',
            'department' => 'Original Department',
            'contact_number' => '1234567890',
        ]);

        $this->actingAs($user, 'sanctum');

        $response = $this->putJson('/api/me/profile', [
            'name' => 'Updated Name',
            'college' => 'Updated College',
            'department' => 'Updated Department',
            'contact_number' => '0987654321',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'user' => [
                'name' => 'Updated Name',
            ],
            'student' => [
                'college' => 'Updated College',
                'department' => 'Updated Department',
                'contact_number' => '0987654321',
            ]
        ]);

        // Ensure student_number is not editable
        $this->assertEquals('STU123456', $response->json('user.student.student_number'));
    }

    /** @test */
    public function student_cannot_upload_document_when_suspended()
    {
        Storage::fake('local');

        // Create a suspended student
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
            'role' => 'student',
        ]);

        $student = Student::factory()->create([
            'user_id' => $user->id,
            'student_number' => 'STU123456',
            'college' => 'Test College',
            'department' => 'Test Department',
            'contact_number' => '1234567890',
            'status' => 'suspended',
        ]);

        $this->actingAs($user, 'sanctum');

        $file = UploadedFile::fake()->image('verification.jpg');

        $response = $this->postJson('/api/verifications', [
            'document_type' => 'school_id',
            'file' => $file,
        ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function student_cannot_upload_document_when_already_verified()
    {
        Storage::fake('local');

        // Create a verified student
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
            'role' => 'student',
        ]);

        $student = Student::factory()->create([
            'user_id' => $user->id,
            'student_number' => 'STU123456',
            'college' => 'Test College',
            'department' => 'Test Department',
            'contact_number' => '1234567890',
            'status' => 'verified',
            'verified_at' => now(),
        ]);

        $this->actingAs($user, 'sanctum');

        $file = UploadedFile::fake()->image('verification.jpg');

        $response = $this->postJson('/api/verifications', [
            'document_type' => 'school_id',
            'file' => $file,
        ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function student_cannot_upload_document_when_already_has_pending_document()
    {
        Storage::fake('local');

        // Create a student with a pending verification
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
            'role' => 'student',
        ]);

        $student = Student::factory()->create([
            'user_id' => $user->id,
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

        $this->actingAs($user, 'sanctum');

        $file = UploadedFile::fake()->image('verification2.jpg');

        $response = $this->postJson('/api/verifications', [
            'document_type' => 'registration_form',
            'file' => $file,
        ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function student_can_upload_verification_document()
    {
        Storage::fake('local');

        // Create a student
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
            'role' => 'student',
        ]);

        $student = Student::factory()->create([
            'user_id' => $user->id,
            'student_number' => 'STU123456',
            'college' => 'Test College',
            'department' => 'Test Department',
            'contact_number' => '1234567890',
            'status' => 'pending',
        ]);

        $this->actingAs($user, 'sanctum');

        $file = UploadedFile::fake()->image('verification.jpg');

        $response = $this->postJson('/api/verifications', [
            'document_type' => 'school_id',
            'file' => $file,
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'id',
            'student_id',
            'document_type',
            'file_path',
            'original_name',
            'mime',
            'size',
            'status',
            'rejection_reason',
            'reviewer_note',
            'reviewed_by',
            'reviewed_at',
            'created_at',
            'updated_at'
        ]);

        // Check that file was stored
        Storage::disk('local')->assertExists($response->json('file_path'));

        // Check that student status remains pending (until approved)
        $this->assertEquals('pending', $response->json('status'));
    }

    /** @test */
    public function student_cannot_see_another_students_verification_file()
    {
        Storage::fake('local');

        // Create two students
        $user1 = User::factory()->create([
            'email' => 'test1@example.com',
            'password' => bcrypt('password123'),
            'role' => 'student',
        ]);

        $student1 = Student::factory()->create([
            'user_id' => $user1->id,
            'student_number' => 'STU111111',
            'college' => 'Test College',
            'department' => 'Test Department',
            'contact_number' => '1111111111',
        ]);

        $user2 = User::factory()->create([
            'email' => 'test2@example.com',
            'password' => bcrypt('password123'),
            'role' => 'student',
        ]);

        $student2 = Student::factory()->create([
            'user_id' => $user2->id,
            'student_number' => 'STU222222',
            'college' => 'Test College',
            'department' => 'Test Department',
            'contact_number' => '2222222222',
        ]);

        // Create a verification for student 1
        $verification = StudentVerification::factory()->create([
            'student_id' => $student1->id,
            'document_type' => 'school_id',
            'status' => 'pending',
        ]);

        // Try to access student 1's verification as student 2
        $this->actingAs($user2, 'sanctum');

        $response = $this->getJson("/api/verifications/{$verification->id}/file");

        $response->assertStatus(403);

        // Now access as student 1 - should work
        $this->actingAs($user1, 'sanctum');

        $response = $this->getJson("/api/verifications/{$verification->id}/file");

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'image/jpeg');
    }
}