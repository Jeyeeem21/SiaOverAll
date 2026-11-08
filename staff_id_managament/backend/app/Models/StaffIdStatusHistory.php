<?php

namespace App\Models;

use Database\Factories\StaffIdStatusHistoryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StaffIdStatusHistory extends Model
{
    /** @use HasFactory<StaffIdStatusHistoryFactory> */
    use HasFactory;

    protected $fillable = ['staff_id_card_id', 'status', 'changed_by', 'notes'];

    public function card(): BelongsTo
    {
        return $this->belongsTo(StaffIdCard::class, 'staff_id_card_id');
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
