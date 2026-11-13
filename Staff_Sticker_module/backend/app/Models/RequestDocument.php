<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequestDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_id',
        'document_type',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the sticker request that owns this document
     */
    public function stickerRequest(): BelongsTo
    {
        return $this->belongsTo(StickerRequest::class, 'request_id');
    }
}
