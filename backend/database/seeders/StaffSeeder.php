<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class StaffSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create staff user
        User::create([
            'name' => 'Staff User',
            'email' => 'staff@example.com',
            'password' => Hash::make('password123'),
            'role' => 'staff',
        ]);

        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        $this->command->info('Staff and admin users created successfully!');
    }
}
