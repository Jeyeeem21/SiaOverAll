<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class StickerRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'status',
        'vehicle_type',
        'vehicle_plate_number',
        'remarks',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the student who made the request
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the staff member who reviewed the request
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Get the sticker for this request
     */
    public function sticker(): HasOne
    {
        return $this->hasOne(Sticker::class, 'sticker_request_id');
    }

    /**
     * Get all documents for this request
     */
    public function documents(): HasMany
    {
        return $this->hasMany(RequestDocument::class, 'request_id');
    }

    /**
     * Get the status history for this request
     */
    public function statusHistory(): HasMany
    {
        return $this->hasMany(RequestStatusHistory::class, 'request_id');
    }

    /**
     * Scope a query to only include requests with a specific status
     */
    public function scopeWithStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include pending requests
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include approved requests
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope a query to only include completed requests
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }
}
