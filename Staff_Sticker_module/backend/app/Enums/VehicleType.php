<?php

namespace App\Enums;

enum VehicleType: string
{
    case MOTORCYCLE = 'motorcycle';
    case CAR = 'car';
    case SUV = 'suv';
    case VAN = 'van';

    /**
     * Get all possible vehicle type values
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
            self::MOTORCYCLE => 'Motorcycle',
            self::CAR => 'Car',
            self::SUV => 'SUV',
            self::VAN => 'Van',
        };
    }

    /**
     * Get icon name for display
     */
    public function icon(): string
    {
        return match($this) {
            self::MOTORCYCLE => 'motorcycle',
            self::CAR => 'directions_car',
            self::SUV => 'airport_shuttle',
            self::VAN => 'local_shipping',
        };
    }
}
