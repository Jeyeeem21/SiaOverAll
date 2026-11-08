<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Linking existing staff users to staff_info table...\n\n";

$staffUsers = DB::table('users')->where('role', 'Staff')->get();

if ($staffUsers->isEmpty()) {
    echo "No staff users found.\n";
    exit(0);
}

foreach ($staffUsers as $user) {
    // Check if already exists
    $exists = DB::table('staff_info')->where('user_id', $user->id)->exists();
    
    if ($exists) {
        echo "Staff info already exists for {$user->full_name} ({$user->email})\n";
        continue;
    }
    
    // Create staff_info entry
    DB::table('staff_info')->insert([
        'user_id' => $user->id,
        'full_name' => $user->full_name,
        'email' => $user->email,
        'phone' => $user->phone,
        'position' => 'Staff',
        'status' => 'active',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    
    echo "✓ Created staff info for {$user->full_name} ({$user->email})\n";
}

echo "\nDone!\n";
