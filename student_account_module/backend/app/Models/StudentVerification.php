<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable([
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
    'reviewed_at'
])]
class StudentVerification extends Model
{
    /**
     * Get the student that owns the verification.
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the user that reviewed the verification.
     */
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
