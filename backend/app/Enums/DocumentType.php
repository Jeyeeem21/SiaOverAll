<?php

namespace App\Enums;

enum DocumentType: string
{
    case STUDENT_ID = 'student_id';
    case REGISTRATION = 'registration';
    case PHOTO = 'photo';
    case OTHER = 'other';

    /**
     * Get all possible document type values
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Get label for display
     */
    public function label(): string
    {
        return match($this) {
            self::STUDENT_ID => 'Student ID',
            self::REGISTRATION => 'Vehicle Registration',
            self::PHOTO => 'Vehicle Photo',
            self::OTHER => 'Other Document',
        };
    }

    /**
     * Get allowed MIME types for this document type
     */
    public function allowedMimeTypes(): array
    {
        return match($this) {
            self::STUDENT_ID, self::REGISTRATION => [
                'image/jpeg',
                'image/png',
                'image/jpg',
                'application/pdf',
            ],
            self::PHOTO => [
                'image/jpeg',
                'image/png',
                'image/jpg',
            ],
            self::OTHER => [
                'image/jpeg',
                'image/png',
                'image/jpg',
                'application/pdf',
            ],
        };
    }
}
