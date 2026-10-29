<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sticker extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'sticker_request_id',
        'serial_number',
        'qr_code',
        'issue_date',
        'expiry_date',
        'status',
        'reprint_count',
        'last_reprinted_at',
        'file_path',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'expiry_date' => 'date',
        'reprint_count' => 'integer',
        'last_reprinted_at' => 'datetime',
    ];

    public function request()
    {
        return $this->belongsTo(StickerRequest::class, 'sticker_request_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'expired');
    }

    public function isExpired(): bool
    {
        return $this->expiry_date->isPast();
    }

    public function canReprint(): bool
    {
        return $this->status === 'active' && $this->reprint_count < 3;
    }
}
