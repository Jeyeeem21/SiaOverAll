<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrintOrderStatusHistory extends Model
{
    protected $table = 'print_order_status_history';
    public $timestamps = false;

    protected $fillable = [
        'print_order_id',
        'from_status',
        'to_status',
        'notes',
        'changed_by_name',
        'changed_by',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    // Relationships
    public function printOrder(): BelongsTo
    {
        return $this->belongsTo(PrintOrder::class, 'print_order_id', 'print_order_id');
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}

