<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PrintOrder extends Model
{
    use SoftDeletes;

    protected $table = 'print_orders';
    protected $primaryKey = 'print_order_id';

    protected $fillable = [
        'order_number',
        'student_id',
        'student_name',
        'student_email',
        'student_phone',
        'color_type',
        'paper_size',
        'orientation',
        'print_side',
        'copies',
        'pages_per_document',
        'total_pages',
        'binding_type',
        'lamination',
        'lamination_type',
        'lamination_item',
        'lamination_quantity',
        'price_per_page',
        'binding_cost',
        'lamination_cost',
        'total_amount',
        'status',
        'payment_status',
        'payment_method',
        'payment_proof_file',
        'payment_proof_original_name',
        'payment_proof_uploaded_at',
        'amount_paid',
        'payment_reference',
        'payment_date',
        'special_instructions',
        'staff_notes',
        'cancellation_reason',
        'preferred_pickup_date',
        'ready_at',
        'picked_up_at',
        'processed_by',
        'cancelled_by',
        'cancelled_at',
    ];

    protected $casts = [
        'copies' => 'integer',
        'pages_per_document' => 'integer',
        'total_pages' => 'integer',
        'lamination' => 'boolean',
        'lamination_quantity' => 'integer',
        'price_per_page' => 'decimal:2',
        'binding_cost' => 'decimal:2',
        'lamination_cost' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'payment_date' => 'datetime',
        'payment_proof_uploaded_at' => 'datetime',
        'preferred_pickup_date' => 'date',
        'ready_at' => 'datetime',
        'picked_up_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function files(): HasMany
    {
        return $this->hasMany(PrintOrderFile::class, 'print_order_id', 'print_order_id');
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(PrintOrderStatusHistory::class, 'print_order_id', 'print_order_id')->orderBy('created_at', 'desc');
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    // Helper methods
    public function isPending(): bool
    {
        return $this->status === 'submitted' || $this->status === 'reviewing';
    }

    public function isInProgress(): bool
    {
        return in_array($this->status, ['awaiting_payment', 'payment_confirmed', 'printing']);
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function canCancel(): bool
    {
        return !in_array($this->status, ['completed', 'cancelled', 'ready_for_pickup']);
    }

    public function canDownloadFiles(): bool
    {
        return in_array($this->status, ['payment_confirmed', 'printing', 'ready_for_pickup', 'completed']);
    }
}

