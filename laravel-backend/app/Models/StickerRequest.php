<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StickerRequest extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'sticker_type_id',
        'status',
        'quantity',
        'vehicle_registration',
        'vehicle_type',
        'vehicle_color',
        'vehicle_model',
        'purpose',
        'start_date',
        'end_date',
        'requirements',
        'total_amount',
        'payment_reference',
        'payment_date',
        'approved_by',
        'approval_notes',
        'approved_at',
        'rejection_reason',
        'rejected_at',
        'printed_at',
        'released_at',
        'released_by',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'total_amount' => 'decimal:2',
        'requirements' => 'array',
        'start_date' => 'date',
        'end_date' => 'date',
        'payment_date' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'printed_at' => 'datetime',
        'released_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function stickerType()
    {
        return $this->belongsTo(StickerType::class);
    }

    public function stickers()
    {
        return $this->hasMany(Sticker::class);
    }

    public function attachments()
    {
        return $this->hasMany(RequestAttachment::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function releaser()
    {
        return $this->belongsTo(User::class, 'released_by');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopePrinted($query)
    {
        return $query->where('status', 'printed');
    }

    public function scopeReleased($query)
    {
        return $query->where('status', 'released');
    }
}
