<?php

namespace Database\Factories;

use App\Models\StickerRequest;
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
            'student_id' => \App\Models\User::factory(),
            'status' => fake()->randomElement(['pending', 'approved', 'denied', 'completed']),
            'vehicle_type' => fake()->randomElement(['motorcycle', 'car', 'suv', 'van']),
            'vehicle_plate_number' => strtoupper(fake()->bothify('???-####')),
            'remarks' => fake()->optional()->sentence(),
            'reviewed_by' => null,
            'reviewed_at' => null,
        ];
    }

    /**
     * Indicate that the request is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'reviewed_by' => null,
            'reviewed_at' => null,
        ]);
    }

    /**
     * Indicate that the request is approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
            'reviewed_by' => \App\Models\User::factory(),
            'reviewed_at' => fake()->dateTimeBetween('-1 week', 'now'),
        ]);
    }

    /**
     * Indicate that the request is denied.
     */
    public function denied(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'denied',
            'reviewed_by' => \App\Models\User::factory(),
            'reviewed_at' => fake()->dateTimeBetween('-1 week', 'now'),
            'remarks' => fake()->sentence(),
        ]);
    }

    /**
     * Indicate that the request is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'reviewed_by' => \App\Models\User::factory(),
            'reviewed_at' => fake()->dateTimeBetween('-1 week', 'now'),
        ]);
    }
}
