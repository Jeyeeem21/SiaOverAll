<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'transactions';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'order_id',
        'transaction_number',
        'type',
        'status',
        'payment_method',
        'amount',
        'currency',
        'reference_number',
        'external_transaction_id',
        'payment_details',
        'notes',
        'processed_at',
        'confirmed_at',
        'processed_by',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'payment_details' => 'array',
        'processed_at' => 'datetime',
        'confirmed_at' => 'datetime',
    ];

    /**
     * Get the order that owns the transaction.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the user who processed the transaction.
     */
    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /**
     * Generate a unique transaction number.
     */
    public static function generateTransactionNumber(): string
    {
        $prefix = 'TXN';
        $date = now()->format('Ymd');
        $lastTransaction = static::whereDate('created_at', today())
            ->orderBy('id', 'desc')
            ->first();
        
        $sequence = $lastTransaction ? (int) substr($lastTransaction->transaction_number, -4) + 1 : 1;
        
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
     * Scope for filtering by type.
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }
}
