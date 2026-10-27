<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudentIdCard extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'card_number',
        'status',
        'requested_at',
        'approved_at',
        'printed_at',
        'released_at',
        'expired_at',
        'replacement_requested_at',
        'expiry_date',
        'requested_by',
        'approved_by',
        'printed_by',
        'released_by',
        'expired_by',
        'replacement_requested_by',
        'replacement_reason',
    ];

    protected function casts(): array
    {
        return [
            'requested_at' => 'datetime',
            'approved_at' => 'datetime',
            'printed_at' => 'datetime',
            'released_at' => 'datetime',
            'expired_at' => 'datetime',
            'replacement_requested_at' => 'datetime',
            'expiry_date' => 'date',
        ];
    }

    protected function cardNumber(): Attribute
    {
        return Attribute::make(
            get: fn (string $value) => str_starts_with($value, 'STID-')
                ? 'MBC-' . substr($value, 5)
                : $value,
        );
    }

    /**
     * Get all valid status transitions
     */
    public static function getValidTransitions(): array
    {
        return [
            'requested' => ['approved', 'replacement_requested'],
            'approved' => ['printed', 'replacement_requested'],
            'printed' => ['released', 'replacement_requested'],
            'released' => ['expired', 'replacement_requested'],
            'expired' => ['replacement_requested'],
            'replacement_requested' => [], // Terminal state until new card created
        ];
    }

    /**
     * Check if status transition is valid
     */
    public function canTransitionTo(string $newStatus): bool
    {
        $validTransitions = self::getValidTransitions();
        return in_array($newStatus, $validTransitions[$this->status] ?? [], true);
    }

    /**
     * Get status label with color
     */
    public function getStatusInfo(): array
    {
        return match($this->status) {
            'requested' => ['label' => 'Requested', 'color' => 'amber', 'icon' => '📝'],
            'approved' => ['label' => 'Approved', 'color' => 'blue', 'icon' => '✅'],
            'printed' => ['label' => 'Printed', 'color' => 'violet', 'icon' => '🖨️'],
            'released' => ['label' => 'Released', 'color' => 'emerald', 'icon' => '📋'],
            'expired' => ['label' => 'Expired', 'color' => 'red', 'icon' => '⏰'],
            'replacement_requested' => ['label' => 'Replacement Requested', 'color' => 'orange', 'icon' => '🔄'],
            default => ['label' => ucfirst($this->status), 'color' => 'gray', 'icon' => '📄'],
        };
    }

    /**
     * Check if card is expired
     */
    public function isExpired(): bool
    {
        if ($this->status === 'expired') {
            return true;
        }
        
        if ($this->expiry_date && $this->expiry_date < now()) {
            return true;
        }
        
        return false;
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function printedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'printed_by');
    }

    public function releasedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'released_by');
    }

    public function expiredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'expired_by');
    }

    public function replacementRequestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'replacement_requested_by');
    }

    public function history(): HasMany
    {
        return $this->hasMany(StudentIdStatusHistory::class);
    }

    public function releases(): HasMany
    {
        return $this->hasMany(StudentIdRelease::class);
    }
}
