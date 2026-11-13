<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This migration adds additional indexes for performance optimization
     * based on common query patterns identified in the requirements:
     * - Searching by vehicle plate number (Requirement 1.1)
     * - Filtering by plate number combined with status
     * - Searching by student name (Requirement 1.1)
     * - Filtering by reviewed_by staff member for audit trails
     */
    public function up(): void
    {
        Schema::table('sticker_requests', function (Blueprint $table) {
            // Most indexes already exist from the base migration
            // Only add the ones that don't
            
            // Index for searching by vehicle plate number - skip if exists
            $connection = Schema::getConnection();
            $tableName = 'sticker_requests';
            $indexName = 'sticker_requests_vehicle_plate_number_index';
            
            $indexes = $connection->select("SHOW INDEX FROM {$tableName} WHERE Key_name = ?", [$indexName]);
            if (empty($indexes)) {
                $table->index('vehicle_plate_number');
            }
            
            // Composite index for filtered searches - skip if exists
            $indexName2 = 'idx_plate_status';
            $indexes2 = $connection->select("SHOW INDEX FROM {$tableName} WHERE Key_name = ?", [$indexName2]);
            if (empty($indexes2)) {
                $table->index(['vehicle_plate_number', 'status'], 'idx_plate_status');
            }
            
            // Index for filtering by reviewed_by staff member - skip if exists
            $indexName3 = 'sticker_requests_reviewed_by_index';
            $indexes3 = $connection->select("SHOW INDEX FROM {$tableName} WHERE Key_name = ?", [$indexName3]);
            if (empty($indexes3)) {
                $table->index('reviewed_by');
            }
            
            // Composite index for date range filtering with status already exists in base migration
        });
        
        Schema::table('users', function (Blueprint $table) {
            // Index for searching by student/staff name
            // Check if full_name column exists (used in integrated system)
            if (Schema::hasColumn('users', 'full_name')) {
                $connection = Schema::getConnection();
                $indexName = 'users_full_name_index';
                $indexes = $connection->select("SHOW INDEX FROM users WHERE Key_name = ?", [$indexName]);
                if (empty($indexes)) {
                    $table->index('full_name');
                }
            }
        });
        
        Schema::table('stickers', function (Blueprint $table) {
            // Composite index for filtering stickers by date and vehicle type
            $connection = Schema::getConnection();
            $tableName = 'stickers';
            $indexName = 'idx_generated_vehicle';
            $indexes = $connection->select("SHOW INDEX FROM {$tableName} WHERE Key_name = ?", [$indexName]);
            if (empty($indexes)) {
                $table->index(['generated_at', 'vehicle_type'], 'idx_generated_vehicle');
            }
            
            // Index for searching by student ID number - skip if exists
            $indexName2 = 'stickers_student_id_number_index';
            $indexes2 = $connection->select("SHOW INDEX FROM {$tableName} WHERE Key_name = ?", [$indexName2]);
            if (empty($indexes2)) {
                $table->index('student_id_number');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sticker_requests', function (Blueprint $table) {
            $table->dropIndex(['vehicle_plate_number']);
            $table->dropIndex('idx_plate_status');
            $table->dropIndex(['reviewed_by']);
            $table->dropIndex('idx_created_status');
        });
        
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'full_name')) {
                $table->dropIndex(['full_name']);
            }
            if (Schema::hasColumn('users', 'name')) {
                $table->dropIndex(['name']);
            }
        });
        
        Schema::table('stickers', function (Blueprint $table) {
            $table->dropIndex('idx_generated_vehicle');
            $table->dropIndex(['student_id_number']);
        });
    }
};
