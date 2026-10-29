<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RequestAttachment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'sticker_request_id',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
        'upload_type',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    public function request()
    {
        return $this->belongsTo(StickerRequest::class, 'sticker_request_id');
    }
}
