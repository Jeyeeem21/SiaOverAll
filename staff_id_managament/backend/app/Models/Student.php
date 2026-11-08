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
    use HasFactory; // Removed SoftDeletes since account_students table doesn't have deleted_at column

    /**
     * The table associated with the model.
     * Points to account_students from student account module
     */
    protected $table = 'account_students';

    protected $fillable = [
        'user_id',
        'reference_no',
        'student_number',
        'college',
        'department',
        'year_level',
        'section',
        'birthdate',
        'address',
        'emergency_contact_name',
        'emergency_contact_number',
        'contact_number',
        'photo_path',
        'signature_path',
        'status',
        'verified_at',
        'verified_by',
    ];

    protected $appends = ['full_name', 'email', 'program', 'photo_url', 'signature_url', 'avatar_url'];

    // Original fillable for ID card photo uploads - stored separately
    // 'photo_path', 'signature_path', 'registrar_signature_path'

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
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

    protected function fullName(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->user ? $this->user->full_name : 'N/A',
        );
    }

    protected function firstName(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!$this->user || !$this->user->full_name) {
                    return '';
                }
                $nameParts = explode(' ', trim($this->user->full_name));
                return $nameParts[0] ?? '';
            }
        );
    }

    protected function middleName(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!$this->user || !$this->user->full_name) {
                    return '';
                }
                $nameParts = explode(' ', trim($this->user->full_name));
                return count($nameParts) > 2 ? $nameParts[1] : '';
            }
        );
    }

    protected function lastName(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!$this->user || !$this->user->full_name) {
                    return '';
                }
                $nameParts = explode(' ', trim($this->user->full_name));
                return count($nameParts) > 2 ? $nameParts[count($nameParts) - 1] : ($nameParts[1] ?? '');
            }
        );
    }

    protected function studentIdNumber(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->student_number,
        );
    }

    protected function email(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->user ? $this->user->email : null,
        );
    }

    protected function program(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->department, // Map department to program for compatibility
        );
    }

    protected function photoUrl(): Attribute
    {
        return Attribute::make(
            get: function () {
                // Priority 1: Use photo_path if exists (uploaded by staff in ID Management)
                if ($this->photo_path) {
                    return url('storage/' . $this->photo_path);
                }
                
                // Priority 2: Use user's avatar if exists (uploaded by student in portal)
                if ($this->user && $this->user->avatar) {
                    // Avatar is from student account module at localhost:8004
                    // We need to return the full URL from that service
                    $studentAccountUrl = env('STUDENT_ACCOUNT_URL', 'http://localhost:8004');
                    return $studentAccountUrl . '/storage/' . $this->user->avatar;
                }
                
                return null;
            }
        );
    }

    protected function avatarUrl(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->user && $this->user->avatar) {
                    $studentAccountUrl = env('STUDENT_ACCOUNT_URL', 'http://localhost:8004');
                    return $studentAccountUrl . '/storage/' . $this->user->avatar;
                }
                return null;
            }
        );
    }

    protected function signatureUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->signature_path ? url('storage/' . $this->signature_path) : null,
        );
    }

    protected function registrarSignatureUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => null, // Registrar signature stored separately
        );
    }

    protected function casts(): array
    {
        return [
            'birthdate' => 'date',
            'verified_at' => 'datetime',
        ];
    }
}
