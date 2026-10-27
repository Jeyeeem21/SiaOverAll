<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Skip if staff_info table doesn't exist yet
        if (!Schema::hasTable('staff_info')) {
            return;
        }
        
        if (Schema::hasColumn('staff_info', 'photo_path')) {
            return;
        }

        Schema::table('staff_info', function (Blueprint $table) {
            $table->string('photo_path')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasColumn('staff_info', 'photo_path')) {
            return;
        }

        Schema::table('staff_info', function (Blueprint $table) {
            $table->dropColumn('photo_path');
        });
    }
};
