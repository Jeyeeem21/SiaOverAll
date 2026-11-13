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
        Schema::table('sticker_requests', function (Blueprint $table) {
            // Rename vehicle_plate_number to plate_number to match model
            if (Schema::hasColumn('sticker_requests', 'vehicle_plate_number')) {
                $table->renameColumn('vehicle_plate_number', 'plate_number');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sticker_requests', function (Blueprint $table) {
            if (Schema::hasColumn('sticker_requests', 'plate_number')) {
                $table->renameColumn('plate_number', 'vehicle_plate_number');
            }
        });
    }
};
