<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'categories';

    /**
     * The primary key associated with the table.
     */
    protected $primaryKey = 'category_id';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'category_name',
        'name',
        'description',
        'icon',
        'status',
    ];

    /**
     * Get the products for the category.
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'category_id', 'category_id');
    }

    /**
     * Get the category name (handles both name and category_name columns).
     */
    public function getNameAttribute()
    {
        return $this->attributes['category_name'] ?? $this->attributes['name'];
    }

    /**
     * Scope for active categories.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Get products count for this category.
     */
    public function getProductCountAttribute(): int
    {
        return $this->products()->where('is_active', true)->orWhere('status', 'active')->count();
    }
}
