<?php

namespace App\Enums;

enum DocumentType: string
{
    case OFFICIAL_RECEIPT = 'official_receipt';
    case CERTIFICATE_OF_REGISTRATION = 'certificate_of_registration';
    case DRIVERS_LICENSE = 'drivers_license';
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
            self::OFFICIAL_RECEIPT => 'Official Receipt',
            self::CERTIFICATE_OF_REGISTRATION => 'Certification of Registration',
            self::DRIVERS_LICENSE => 'Driver\'s License',
            self::OTHER => 'Other Document',
        };
    }

    /**
     * Get allowed MIME types for this document type
     */
    public function allowedMimeTypes(): array
    {
        return match($this) {
            self::OFFICIAL_RECEIPT, self::CERTIFICATE_OF_REGISTRATION, self::DRIVERS_LICENSE => [
                'image/jpeg',
                'image/png',
                'image/jpg',
                'application/pdf',
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
