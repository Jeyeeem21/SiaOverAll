<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $table = 'audit_trail_logs';

    public $timestamps = false;

    public const UPDATED_AT = null;

    protected $fillable = [
        'actor_id',
        'actor_name',
        'actor_role',
        'module',
        'action',
        'entity_type',
        'entity_id',
        'method',
        'endpoint',
        'status_code',
        'ip_address',
        'user_agent',
        'properties',
        'occurred_at',
    ];

    protected function casts(): array
    {
        return [
            'properties' => 'array',
            'occurred_at' => 'datetime',
        ];
    }
}
