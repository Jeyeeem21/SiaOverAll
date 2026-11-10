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
            // Index for searching by vehicle plate number
            // Used in: Requirement 1.1 - Search requests by plate number
            $table->index('vehicle_plate_number');
            
            // Composite index for filtered searches
            // Used in: Requirement 1.1 - Search by plate number with status filter
            $table->index(['vehicle_plate_number', 'status'], 'idx_plate_status');
            
            // Index for filtering by reviewed_by staff member
            // Used in: Audit trails and staff performance reporting
            $table->index('reviewed_by');
            
            // Composite index for date range filtering with status
            // Used in: Requirement 1.1 - Filter requests by date range
            $table->index(['created_at', 'status'], 'idx_created_status');
        });
        
        Schema::table('users', function (Blueprint $table) {
            // Index for searching by student/staff name
            // Used in: Requirement 1.1 - Search requests by student name
            $table->index('name');
        });
        
        Schema::table('stickers', function (Blueprint $table) {
            // Composite index for filtering stickers by date and vehicle type
            // Used in: Reporting and analytics queries
            $table->index(['generated_at', 'vehicle_type'], 'idx_generated_vehicle');
            
            // Index for searching by student ID number
            // Used in: Search functionality and verification
            $table->index('student_id_number');
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
            $table->dropIndex(['name']);
        });
        
        Schema::table('stickers', function (Blueprint $table) {
            $table->dropIndex('idx_generated_vehicle');
            $table->dropIndex(['student_id_number']);
        });
    }
};
