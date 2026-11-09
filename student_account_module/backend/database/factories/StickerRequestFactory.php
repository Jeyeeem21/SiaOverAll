<?php

namespace Database\Factories;

use App\Models\StickerRequest;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StickerRequest>
 */
class StickerRequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'plate_number' => fake()->bothify('???-####'),
            'vehicle_type' => 'car',
            'vehicle_model' => fake()->word(),
            'vehicle_color' => fake()->colorName(),
            'license_path' => 'sticker-requests/licenses/license.pdf',
            'official_receipt_path' => 'sticker-requests/receipts/receipt.pdf',
            'certificate_of_registration_path' => 'sticker-requests/certificates/certificate.pdf',
            'status' => 'pending',
        ];
    }
}
