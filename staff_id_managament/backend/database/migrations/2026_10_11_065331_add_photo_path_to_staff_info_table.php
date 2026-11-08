<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // photo_path is owned by the Main System staff_info migration.
    }

    public function down(): void
    {
        // Do not remove a shared column owned by Main System.
    }
};
