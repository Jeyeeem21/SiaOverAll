<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'order_items';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'product_barcode',
        'product_description',
        'category_name',
        'quantity',
        'unit_price',
        'unit_cost',
        'total_price',
        'unit',
        'special_instructions',
        'status',
        'prepared_at',
        'delivered_at',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'unit_cost' => 'decimal:2',
        'total_price' => 'decimal:2',
        'prepared_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    /**
     * Get the order that owns the order item.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Calculate total price based on quantity and unit price.
     */
    protected static function booted()
    {
        static::saving(function ($orderItem) {
            $orderItem->total_price = $orderItem->quantity * $orderItem->unit_price;
        });
    }

    /**
     * Scope for filtering by status.
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Get the profit margin for this item.
     */
    public function getProfitMarginAttribute(): float
    {
        if (!$this->unit_cost) return 0;
        return ($this->unit_price - $this->unit_cost) * $this->quantity;
    }
}
