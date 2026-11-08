<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Student;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function student_can_register_and_receive_token()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test Student',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'student_number' => 'STU123456',
            'college' => 'Test College',
            'department' => 'Test Department',
            'contact_number' => '1234567890',
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'user' => [
                'id',
                'name',
                'email',
                'role',
                'student' => [
                    'id',
                    'reference_no',
                    'student_number',
                    'college',
                    'department',
                    'contact_number',
                    'status',
                ]
            ],
            'token'
        ]);

        $this->assertAuthenticated();
        $this->assertEquals('student', $response->json('user.role'));
        $this->assertEquals('pending', $response->json('user.student.status'));
    }

    /** @test */
    public function student_can_login_and_receive_token()
    {
        // Create a student user first
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

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'user' => [
                'id',
                'name',
                'email',
                'role',
                'student' => [
                    'id',
                    'reference_no',
                    'student_number',
                    'college',
                    'department',
                    'contact_number',
                    'status',
                ],
                'verifications'
            ],
            'token'
        ]);

        $this->assertAuthenticated();
    }

    /** @test */
    public function suspended_student_cannot_login()
    {
        // Create a suspended student user
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

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(403);
        $this->assertGuest();
    }
}