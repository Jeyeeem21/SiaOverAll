<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Sticker extends Model
{
    use HasFactory;

    protected $fillable = [
        'sticker_request_id',
        'serial_number',
        'vehicle_code',
        'price',
        'valid_month',
        'valid_year',
        'generated_by',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    public function request(): BelongsTo
    {
        return $this->belongsTo(StickerRequest::class, 'sticker_request_id');
    }

    public function generatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }
}
