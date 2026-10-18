<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable([
    'user_id',
    'reference_no',
    'student_number',
    'college',
    'department',
    'contact_number',
    'status',
    'verified_at',
    'verified_by'
])]
class Student extends Model
{
    /**
     * Get the user associated with the student.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the verifications associated with the student.
     */
    public function verifications(): HasMany
    {
        return $this->hasMany(StudentVerification::class);
    }

    /**
     * Get the orders for the student.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'student_id');
    }
}
