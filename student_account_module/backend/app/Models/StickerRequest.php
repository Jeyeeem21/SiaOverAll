<?php

namespace App\Models;

use Database\Factories\StickerRequestFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StickerRequest extends Model
{
    /** @use HasFactory<StickerRequestFactory> */
    use HasFactory;

    protected $fillable = [
        'student_id',
        'plate_number',
        'vehicle_type',
        'vehicle_model',
        'vehicle_color',
        'license_path',
        'official_receipt_path',
        'certificate_of_registration_path',
        'status',
        'remarks',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function sticker()
    {
        return $this->hasOne(Sticker::class);
    }

    public function histories()
    {
        return $this->hasMany(StickerRequestHistory::class)->orderBy('changed_at', 'desc');
    }
}
