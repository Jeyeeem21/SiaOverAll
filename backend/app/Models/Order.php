<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'student_orders';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'student_id',
        'order_number',
        'document_type',
        'document_title',
        'quantity',
        'unit_price',
        'total_amount',
        'status',
        'priority',
        'payment_status',
        'payment_method',
        'payment_reference',
        'notes',
        'pickup_method',
        'pickup_date',
        'delivery_address',
        'processed_by',
        'processed_at',
        'completed_at',
        'cancelled_reason',
        'expected_completion_date'
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'unit_price' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'pickup_date' => 'date',
        'processed_at' => 'datetime',
        'completed_at' => 'datetime',
        'expected_completion_date' => 'date',
    ];

    /**
     * Get the user that owns the order.
     */
    public function user(): BelongsTo
    {
        return $this->hasOneThrough(User::class, Student::class, 'id', 'id', 'student_id', 'user_id');
    }

    /**
     * Get the student that owns the order.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the payments for the order.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'order_id');
    }

    /**
     * Get the user who processed the order.
     */
    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /**
     * Generate a unique order number.
     */
    public static function generateOrderNumber(): string
    {
        $prefix = 'ORD';
        $date = now()->format('Ymd');
        $lastOrder = static::whereDate('created_at', today())
            ->orderBy('id', 'desc')
            ->first();
        
        $sequence = $lastOrder ? (int) substr($lastOrder->order_number, -4) + 1 : 1;
        
        return $prefix . $date . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Scope for filtering by status.
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for filtering by payment status.
     */
    public function scopeByPaymentStatus($query, $paymentStatus)
    {
        return $query->where('payment_status', $paymentStatus);
    }

    /**
     * Get the total quantity of items in the order.
     */
    public function getTotalQuantityAttribute(): int
    {
        return $this->quantity ?? 0;
    }

    /**
     * Get the total items count in the order.
     */
    public function getTotalItemsAttribute(): int
    {
        return 1; // Each student_order is one item
    }

    /**
     * Check if order can be cancelled
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['pending', 'processing']);
    }

    /**
     * Check if order can be updated
     */
    public function canBeUpdated(): bool
    {
        return $this->status === 'pending';
    }
}
