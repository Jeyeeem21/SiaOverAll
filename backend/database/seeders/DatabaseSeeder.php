<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user for testing
        User::factory()->create([
            'full_name' => 'Admin User',
            'email' => 'admin@example.com',
            'role' => 'Admin',
            'status' => 'active',
        ]);

        // Create staff user for testing
        User::factory()->create([
            'full_name' => 'Staff User',
            'email' => 'staff@example.com',
            'role' => 'Staff',
            'status' => 'active',
        ]);

        // Seed students
        $this->call([
            StudentSeeder::class,
        ]);
    }
}
