<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StickerType extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'color',
        'price',
        'validity_days',
        'requires_vehicle_details',
        'requires_approval',
        'allowed_file_types',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'validity_days' => 'integer',
        'requires_vehicle_details' => 'boolean',
        'requires_approval' => 'boolean',
        'allowed_file_types' => 'array',
    ];

    public function requests()
    {
        return $this->hasMany(StickerRequest::class);
    }
}
