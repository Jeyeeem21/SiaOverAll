<?php

namespace App\Enums;

enum RequestStatus: string
{
    case PENDING = 'pending';
    case APPROVED = 'approved';
    case DENIED = 'denied';
    case COMPLETED = 'completed';

    /**
     * Get all possible status values
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Check if status is a valid transition from current status
     */
    public static function isValidTransition(string $from, string $to): bool
    {
        $allowedTransitions = [
            'pending' => ['approved', 'denied'],
            'approved' => ['completed', 'denied'],
            'denied' => [],
            'completed' => [],
        ];

        return in_array($to, $allowedTransitions[$from] ?? []);
    }

    /**
     * Get label for display
     */
    public function label(): string
    {
        return match($this) {
            self::PENDING => 'Pending Review',
            self::APPROVED => 'Approved',
            self::DENIED => 'Denied',
            self::COMPLETED => 'Completed',
        };
    }

    /**
     * Get color for display (for badges)
     */
    public function color(): string
    {
        return match($this) {
            self::PENDING => 'warning',
            self::APPROVED => 'success',
            self::DENIED => 'error',
            self::COMPLETED => 'info',
        };
    }
}
