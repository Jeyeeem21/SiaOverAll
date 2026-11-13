<?php

namespace App\DTOs;

class StickerCustomizationData
{
    public function __construct(
        public readonly string $plateNumber,
        public readonly string $studentName,
        public readonly string $studentIdNumber,
        public readonly string $vehicleType,
        public readonly float $price,
        public readonly ?string $remarks = null,
    ) {}

    /**
     * Create from array
     */
    public static function fromArray(array $data): self
    {
        return new self(
            plateNumber: $data['plate_number'],
            studentName: $data['student_name'],
            studentIdNumber: $data['student_id_number'],
            vehicleType: $data['vehicle_type'],
            price: (float) $data['price'],
            remarks: $data['remarks'] ?? null,
        );
    }

    /**
     * Convert to array
     */
    public function toArray(): array
    {
        return [
            'plate_number' => $this->plateNumber,
            'student_name' => $this->studentName,
            'student_id_number' => $this->studentIdNumber,
            'vehicle_type' => $this->vehicleType,
            'price' => $this->price,
            'remarks' => $this->remarks,
        ];
    }

    /**
     * Validate the data
     */
    public function validate(): array
    {
        $errors = [];

        if (empty($this->plateNumber)) {
            $errors['plate_number'] = 'Plate number is required';
        }

        if (empty($this->studentName)) {
            $errors['student_name'] = 'Student name is required';
        }

        if (empty($this->studentIdNumber)) {
            $errors['student_id_number'] = 'Student ID number is required';
        }

        if ($this->price <= 0) {
            $errors['price'] = 'Price must be greater than zero';
        }

        return $errors;
    }
}
