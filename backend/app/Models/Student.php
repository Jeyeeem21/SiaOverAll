<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Student extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'student_id_number',
        'first_name',
        'middle_name',
        'last_name',
        'program',
        'year_level',
        'section',
        'department',
        'address',
        'birthdate',
        'email',
        'contact_number',
        'emergency_contact_name',
        'emergency_contact_number',
        'verification_status',
        'photo_path',
        'signature_path',
        'registrar_signature_path',
    ];

    protected $appends = ['photo_url', 'signature_url', 'registrar_signature_url', 'full_name'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function idCards(): HasMany
    {
        return $this->hasMany(StudentIdCard::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(StudentDocument::class);
    }

    public function activeIdCard(): ?StudentIdCard
    {
        return $this->idCards()
            ->whereIn('status', ['requested', 'approved', 'printed'])
            ->latest()
            ->first();
    }

    protected function photoUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->photo_path 
                ? Storage::disk('public')->url($this->photo_path)
                : null,
        );
    }

    protected function signatureUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->signature_path 
                ? Storage::disk('public')->url($this->signature_path)
                : null,
        );
    }

    protected function registrarSignatureUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->registrar_signature_path 
                ? Storage::disk('public')->url($this->registrar_signature_path)
                : null,
        );
    }

    protected function fullName(): Attribute
    {
        return Attribute::make(
            get: fn () => trim(sprintf(
                '%s %s %s',
                $this->first_name,
                $this->middle_name ?? '',
                $this->last_name
            )),
        );
    }

    protected function casts(): array
    {
        return [
            'birthdate' => 'date',
        ];
    }
}
