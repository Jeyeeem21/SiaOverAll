<?php

namespace Tests\Feature;

use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class StudentRecordsApiTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        if (Schema::hasTable('students')) {
            return;
        }

        Schema::create('students', function (Blueprint $table): void {
            $table->id();
            $table->string('student_number')->unique();
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('program');
            $table->string('year_level', 30);
            $table->string('section', 50);
            $table->string('department');
            $table->string('email')->nullable();
            $table->string('contact_number', 30)->nullable();
            $table->string('verification_status')->default('pending');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function test_student_records_require_authentication(): void
    {
        $this->getJson('/api/students')
            ->assertUnauthorized()
            ->assertJsonPath('message', 'Unauthenticated.');
    }

    public function test_an_authorized_admin_can_search_student_records(): void
    {
        Student::create([
            'student_number' => '2026-0001',
            'first_name' => 'Ana',
            'last_name' => 'Santos',
            'program' => 'BSIT',
            'year_level' => '3',
            'section' => 'A',
            'department' => 'Computing Studies',
            'verification_status' => 'verified',
        ]);
        Student::create([
            'student_number' => '2026-0002',
            'first_name' => 'Marco',
            'last_name' => 'Reyes',
            'program' => 'BSCS',
            'year_level' => '2',
            'section' => 'B',
            'department' => 'Computing Studies',
            'verification_status' => 'pending',
        ]);

        $this->actingAs($this->admin(), 'sanctum')
            ->getJson('/api/students?search=ana+santos&program=BSIT')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.student_number', '2026-0001')
            ->assertJsonPath('data.0.student_id_number', null);
    }

    public function test_an_authorized_admin_can_create_a_student(): void
    {
        $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/students', $this->studentAttributes('2026-0003'))
            ->assertCreated()
            ->assertJsonPath('data.student_number', '2026-0003')
            ->assertJsonPath('data.full_name', 'Ana Santos');

        $this->assertDatabaseHas('students', ['student_number' => '2026-0003']);
    }

    public function test_duplicate_student_numbers_are_rejected_on_update(): void
    {
        $first = Student::create($this->studentAttributes('2026-0001'));
        $second = Student::create($this->studentAttributes('2026-0002'));

        $this->actingAs($this->admin(), 'sanctum')
            ->patchJson("/api/students/{$second->id}", ['student_number' => $first->student_number])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('student_number');
    }

    public function test_an_authorized_admin_can_update_a_student(): void
    {
        $student = Student::create($this->studentAttributes('2026-0005'));

        $this->actingAs($this->admin(), 'sanctum')
            ->patchJson("/api/students/{$student->id}", [
                'program' => 'BSCS',
                'verification_status' => 'verified',
            ])
            ->assertOk()
            ->assertJsonPath('data.program', 'BSCS');

        $this->assertDatabaseHas('students', [
            'id' => $student->id,
            'program' => 'BSCS',
        ]);
    }

    public function test_an_authorized_admin_can_delete_a_student(): void
    {
        $student = Student::create($this->studentAttributes('2026-0004'));

        $this->actingAs($this->admin(), 'sanctum')
            ->deleteJson("/api/students/{$student->id}")
            ->assertOk()
            ->assertJsonPath('message', 'Student record deactivated successfully.');

        $this->assertSoftDeleted('students', ['id' => $student->id]);
    }

    private function admin(): User
    {
        $user = new User();
        $user->id = 1;
        $user->role = 'Admin';

        return $user;
    }

    private function studentAttributes(string $studentNumber): array
    {
        return [
            'student_number' => $studentNumber,
            'first_name' => 'Ana',
            'last_name' => 'Santos',
            'program' => 'BSIT',
            'year_level' => '3',
            'section' => 'A',
            'department' => 'Computing Studies',
            'verification_status' => 'verified',
        ];
    }
}
