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
            // Add missing columns if they don't exist
            if (!Schema::hasColumn('sticker_requests', 'vehicle_model')) {
                $table->string('vehicle_model')->nullable()->after('vehicle_type');
            }
            
            if (!Schema::hasColumn('sticker_requests', 'vehicle_color')) {
                $table->string('vehicle_color')->nullable()->after('vehicle_model');
            }
            
            if (!Schema::hasColumn('sticker_requests', 'license_path')) {
                $table->string('license_path')->nullable()->after('plate_number');
            }
            
            if (!Schema::hasColumn('sticker_requests', 'official_receipt_path')) {
                $table->string('official_receipt_path')->nullable()->after('license_path');
            }
            
            if (!Schema::hasColumn('sticker_requests', 'certificate_of_registration_path')) {
                $table->string('certificate_of_registration_path')->nullable()->after('official_receipt_path');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sticker_requests', function (Blueprint $table) {
            $columns = [
                'vehicle_model',
                'vehicle_color', 
                'license_path',
                'official_receipt_path',
                'certificate_of_registration_path'
            ];
            
            foreach ($columns as $column) {
                if (Schema::hasColumn('sticker_requests', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
