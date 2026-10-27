<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentIdStatusHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id_card_id',
        'status',
        'changed_by',
        'notes',
    ];

    public function card(): BelongsTo
    {
        return $this->belongsTo(StudentIdCard::class, 'student_id_card_id');
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
