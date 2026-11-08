<?php

namespace Database\Seeders;

use App\Models\Student;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $programs = [
            'Computer Science',
            'Information Technology',
            'Business Administration',
            'Engineering',
            'Education',
            'Nursing',
        ];

        $departments = [
            'College of Computer Studies',
            'College of Business Administration',
            'College of Engineering',
            'College of Education',
            'College of Nursing',
        ];

        $yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
        $sections = ['A', 'B', 'C', 'D'];
        $statuses = ['pending', 'verified', 'unverified'];

        // Create 50 sample students
        for ($i = 1; $i <= 50; $i++) {
            Student::create([
                'student_number' => '2026-' . str_pad((string) $i, 5, '0', STR_PAD_LEFT),
                'student_id_number' => 'MBC2026-' . str_pad((string) $i, 5, '0', STR_PAD_LEFT),
                'first_name' => fake()->firstName(),
                'middle_name' => fake()->optional(0.7)->firstName(),
                'last_name' => fake()->lastName(),
                'program' => fake()->randomElement($programs),
                'year_level' => fake()->randomElement($yearLevels),
                'section' => fake()->randomElement($sections),
                'department' => fake()->randomElement($departments),
                'address' => fake()->optional(0.8)->address(),
                'birthdate' => fake()->optional(0.8)->dateTimeBetween('-25 years', '-17 years'),
                'email' => fake()->unique()->safeEmail(),
                'contact_number' => fake()->optional(0.8)->phoneNumber(),
                'emergency_contact_name' => fake()->optional(0.7)->name(),
                'emergency_contact_number' => fake()->optional(0.7)->phoneNumber(),
                'verification_status' => fake()->randomElement($statuses),
            ]);
        }
    }
}
