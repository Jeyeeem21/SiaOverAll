<?php

namespace App\Observers;

use App\Models\Student;

class StudentObserver
{
    /**
     * Handle the Student "creating" event.
     */
    public function creating(Student $student): void
    {
        if (empty($student->student_id_number)) {
            $student->student_id_number = $this->generateStudentIdNumber($student);
        }
    }

    /**
     * Generate a unique student ID number based on year and sequence.
     * Format: STUD-YYYY-XXXXXX (e.g., STUD-2026-000001)
     */
    private function generateStudentIdNumber(Student $student): string
    {
        $year = now()->year;
        $prefix = "STUD-{$year}-";

        // Get the last student ID number for this year
        $lastStudent = Student::query()
            ->where('student_id_number', 'LIKE', "{$prefix}%")
            ->orderByDesc('student_id_number')
            ->first();

        if ($lastStudent) {
            // Extract the sequence number and increment
            $lastSequence = (int) substr($lastStudent->student_id_number, -6);
            $newSequence = $lastSequence + 1;
        } else {
            // First student for this year
            $newSequence = 1;
        }

        return $prefix . str_pad((string) $newSequence, 6, '0', STR_PAD_LEFT);
    }
}
