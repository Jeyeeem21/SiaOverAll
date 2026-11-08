<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class StudentDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'document_type',
        'document_name',
        'file_path',
        'original_filename',
        'mime_type',
        'file_size',
        'notes',
        'uploaded_by',
    ];

    protected $appends = ['file_url', 'formatted_size'];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    protected function fileUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->file_path 
                ? Storage::disk('private')->url($this->file_path)
                : null,
        );
    }

    protected function formattedSize(): Attribute
    {
        return Attribute::make(
            get: function () {
                $bytes = $this->file_size;
                if ($bytes >= 1073741824) {
                    return number_format($bytes / 1073741824, 2) . ' GB';
                } elseif ($bytes >= 1048576) {
                    return number_format($bytes / 1048576, 2) . ' MB';
                } elseif ($bytes >= 1024) {
                    return number_format($bytes / 1024, 2) . ' KB';
                }
                return $bytes . ' bytes';
            }
        );
    }

    public function getDocumentTypeLabel(): string
    {
        return match($this->document_type) {
            'birth_certificate' => 'Birth Certificate',
            'transcript' => 'Transcript of Records',
            'clearance' => 'Clearance',
            'medical_record' => 'Medical Record',
            'id_copy' => 'ID Copy',
            'other' => 'Other Document',
            default => ucwords(str_replace('_', ' ', $this->document_type)),
        };
    }
}
