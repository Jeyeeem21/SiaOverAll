<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    /**
     * The table associated with the model.
     * Using shared 'order_items' table from Main System
     */
    protected $table = 'order_items';

    /**
     * The primary key for the model.
     */
    protected $primaryKey = 'order_item_id';

    /**
     * The attributes that are mass assignable.
     * Aligned with Main System order_items table structure
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
        'notes',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'quantity' => 'decimal:2',
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
        return $this->belongsTo(Order::class, 'order_id', 'order_id');
    }

    /**
     * Get the product for this order item.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    /**
     * Get total price for this item.
     */
    public function getTotalPriceAttribute(): float
    {
        return $this->quantity * $this->unit_price;
    }

    /**
     * Calculate total price based on quantity and unit price.
     */
    protected static function booted()
    {
        static::saving(function ($orderItem) {
            // Total price is calculated dynamically via accessor
            // No need to save it to database
        });
    }
}
