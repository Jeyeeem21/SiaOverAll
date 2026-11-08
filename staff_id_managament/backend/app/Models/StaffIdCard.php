<?php

namespace App\Models;

use Database\Factories\StaffIdCardFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StaffIdCard extends Model
{
    /** @use HasFactory<StaffIdCardFactory> */
    use HasFactory;

    protected $fillable = [
        'staff_info_id', 'card_number', 'status', 'requested_at', 'approved_at',
        'printed_at', 'released_at', 'requested_by', 'approved_by', 'printed_by', 'released_by',
    ];

    protected function casts(): array
    {
        return [
            'requested_at' => 'datetime', 'approved_at' => 'datetime',
            'printed_at' => 'datetime', 'released_at' => 'datetime',
        ];
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(StaffInformation::class, 'staff_info_id');
    }

    public function history(): HasMany
    {
        return $this->hasMany(StaffIdStatusHistory::class);
    }

    public function releases(): HasMany
    {
        return $this->hasMany(StaffIdRelease::class);
    }
}
