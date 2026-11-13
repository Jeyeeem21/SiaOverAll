<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StickerRequestHistory extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'sticker_request_id',
        'old_status',
        'new_status',
        'remarks',
        'changed_by',
        'changed_at',
    ];

    protected $casts = [
        'changed_at' => 'datetime',
    ];

    public function request(): BelongsTo
    {
        return $this->belongsTo(StickerRequest::class, 'sticker_request_id');
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
