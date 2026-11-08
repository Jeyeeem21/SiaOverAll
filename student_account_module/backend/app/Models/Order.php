<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    /**
     * The table associated with the model.
     * CHANGED: Now using shared 'orders' table from Main System
     */
    protected $table = 'orders';

    /**
     * The primary key for the model.
     */
    protected $primaryKey = 'order_id';

    /**
     * The attributes that are mass assignable.
     * UPDATED: Full schema with extended fields for student account integration
     */
    protected $fillable = [
        'student_id',
        'order_number',
        'customer_name',
        'service_type',
        'status',
        'payment_status',
        'payment_method',
        'payment_reference',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'notes',
        'staff_notes',
        'processed_by',
        'preferred_pickup_date',
        'order_date',
        'completed_date',
        'completed_at',
        'cancelled_at',
        'is_voided',
        'void_reason',
        'voided_by',
        'voided_at',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'preferred_pickup_date' => 'date',
        'order_date' => 'datetime',
        'completed_date' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'is_voided' => 'boolean',
        'voided_at' => 'datetime',
    ];

    /**
     * Get the order items for this order.
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'order_id', 'order_id');
    }

    /**
     * Get the transactions for this order.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'order_id', 'order_id');
    }

    /**
     * Get the payment for this order.
     */
    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class, 'order_id', 'order_id');
    }

    /**
     * Get the user who voided the order.
     */
    public function voidedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'voided_by');
    }

    /**
     * Generate a unique order number.
     */
    public static function generateOrderNumber(): string
    {
        $prefix = 'ORD';
        $date = now()->format('Ymd');
        $lastOrder = static::whereDate('created_at', today())
            ->orderBy('order_id', 'desc')
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
     * Check if order can be cancelled
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['Pending', 'In Progress']) && !$this->is_voided;
    }

    /**
     * Check if order can be updated
     */
    public function canBeUpdated(): bool
    {
        return $this->status === 'Pending' && !$this->is_voided;
    }

    /**
     * Get the total items count in the order.
     */
    public function getTotalItemsAttribute(): int
    {
        return $this->orderItems()->count();
    }
}
