<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable([
    'user_id',
    'action',
    'entity_type',
    'entity_id',
    'meta',
    'ip_address'
])]
class AuditLog extends Model
{
    /**
     * Get the user that performed the action.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
