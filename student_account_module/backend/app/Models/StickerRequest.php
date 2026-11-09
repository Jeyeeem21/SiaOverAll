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
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
