<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PrintOrderFile extends Model
{
    use SoftDeletes;

    protected $table = 'print_order_files';
    protected $primaryKey = 'file_id';

    protected $fillable = [
        'print_order_id',
        'original_filename',
        'stored_filename',
        'file_path',
        'file_type',
        'mime_type',
        'file_size',
        'page_count',
        'file_hash',
        'status',
        'error_message',
        'download_count',
        'last_downloaded_at',
        'last_downloaded_by',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'page_count' => 'integer',
        'download_count' => 'integer',
        'last_downloaded_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function printOrder(): BelongsTo
    {
        return $this->belongsTo(PrintOrder::class, 'print_order_id', 'print_order_id');
    }

    public function lastDownloadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'last_downloaded_by');
    }

    // Helper methods
    public function getFileUrl(): string
    {
        return asset('storage/' . $this->file_path);
    }

    public function getHumanFileSize(): string
    {
        $size = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $size >= 1024 && $i < count($units) - 1; $i++) {
            $size /= 1024;
        }
        
        return round($size, 2) . ' ' . $units[$i];
    }

    public function incrementDownloadCount($userId = null): void
    {
        $this->increment('download_count');
        $this->update([
            'last_downloaded_at' => now(),
            'last_downloaded_by' => $userId,
        ]);
    }
}

