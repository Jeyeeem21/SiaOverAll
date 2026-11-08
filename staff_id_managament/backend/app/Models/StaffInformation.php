<?php

namespace App\Models;

use Database\Factories\StaffInformationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Storage;

class StaffInformation extends Model
{
    /** @use HasFactory<StaffInformationFactory> */
    use HasFactory;

    protected $table = 'staff_info';

    protected $fillable = [
        'full_name', 'email', 'phone', 'address', 'date_of_birth', 'gender',
        'position', 'department', 'hire_date', 'user_id', 'status', 'photo_path',
    ];

    protected $appends = ['photo_url'];

    protected function casts(): array
    {
        return ['date_of_birth' => 'date', 'hire_date' => 'date'];
    }

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo_path === null ? null : Storage::disk('public')->url($this->photo_path);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function idCard(): HasOne
    {
        return $this->hasOne(StaffIdCard::class, 'staff_info_id');
    }

    public function idCards(): HasMany
    {
        return $this->hasMany(StaffIdCard::class, 'staff_info_id');
    }
}
