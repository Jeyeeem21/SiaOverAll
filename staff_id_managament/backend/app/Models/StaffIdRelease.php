<?php

namespace App\Models;

use Database\Factories\StaffIdReleaseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StaffIdRelease extends Model
{
    /** @use HasFactory<StaffIdReleaseFactory> */
    use HasFactory;

    protected $fillable = ['staff_id_card_id', 'recipient_name', 'released_at', 'released_by', 'notes'];

    protected function casts(): array
    {
        return ['released_at' => 'datetime'];
    }

    public function card(): BelongsTo
    {
        return $this->belongsTo(StaffIdCard::class, 'staff_id_card_id');
    }

    public function releasedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'released_by');
    }
}
