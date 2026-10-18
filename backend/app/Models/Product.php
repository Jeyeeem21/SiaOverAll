<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'products';

    /**
     * The primary key associated with the table.
     */
    protected $primaryKey = 'id';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'product_name',
        'description',
        'price',
        'cost',
        'unit',
        'barcode',
        'category_id',
        'status',
        'is_active',
        'expiration_date',
        'product_image',
        'image_url',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'price' => 'decimal:2',
        'cost' => 'decimal:2',
        'is_active' => 'boolean',
        'expiration_date' => 'date',
    ];

    /**
     * Get the category that owns the product.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    /**
     * Get the product name (handles both name and product_name columns).
     */
    public function getNameAttribute()
    {
        return $this->attributes['product_name'] ?? $this->attributes['name'];
    }

    /**
     * Scope for active products.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orWhere('status', 'active');
    }

    /**
     * Scope for products by category.
     */
    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    /**
     * Scope for searching products.
     */
    public function scopeSearch($query, $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('product_name', 'LIKE', "%{$term}%")
              ->orWhere('name', 'LIKE', "%{$term}%")
              ->orWhere('description', 'LIKE', "%{$term}%")
              ->orWhere('barcode', 'LIKE', "%{$term}%");
        });
    }

    /**
     * Check if product is expired.
     */
    public function getIsExpiredAttribute(): bool
    {
        return $this->expiration_date && $this->expiration_date->isPast();
    }

    /**
     * Get profit margin.
     */
    public function getProfitMarginAttribute(): float
    {
        if (!$this->cost) return 0;
        return $this->price - $this->cost;
    }
}
