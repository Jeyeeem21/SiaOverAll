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
        'plate_number',
        'student_name',
        'student_id_number',
        'vehicle_type',
        'price',
        'file_path',
        'file_format',
        'generated_by',
        'generated_at',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'generated_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the sticker request that owns this sticker
     */
    public function stickerRequest(): BelongsTo
    {
        return $this->belongsTo(StickerRequest::class, 'sticker_request_id');
    }

    /**
     * Get the staff member who generated the sticker
     */
    public function generator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }
}
