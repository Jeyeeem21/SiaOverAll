<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // First, modify the status enum to include new statuses
        DB::statement("ALTER TABLE student_id_cards MODIFY COLUMN status ENUM('requested', 'approved', 'printed', 'released', 'expired', 'replacement_requested') NOT NULL DEFAULT 'requested'");
        
        Schema::table('student_id_cards', function (Blueprint $table) {
            // Add expiry date field
            $table->date('expiry_date')->nullable()->after('released_at');
            
            // Add expired_at timestamp
            $table->timestamp('expired_at')->nullable()->after('expiry_date');
            
            // Add replacement_requested_at timestamp
            $table->timestamp('replacement_requested_at')->nullable()->after('expired_at');
            
            // Add expired_by and replacement_requested_by for audit
            $table->foreignId('expired_by')->nullable()->after('released_by')->constrained('users')->nullOnDelete();
            $table->foreignId('replacement_requested_by')->nullable()->after('expired_by')->constrained('users')->nullOnDelete();
            
            // Add reason for replacement
            $table->text('replacement_reason')->nullable()->after('replacement_requested_by');
            
            // Add index for expiry date queries
            $table->index('expiry_date');
        });
    }

    public function down(): void
    {
        Schema::table('student_id_cards', function (Blueprint $table) {
            $table->dropForeign(['expired_by']);
            $table->dropForeign(['replacement_requested_by']);
            $table->dropColumn([
                'expiry_date',
                'expired_at',
                'replacement_requested_at',
                'expired_by',
                'replacement_requested_by',
                'replacement_reason'
            ]);
        });
        
        // Revert status enum
        DB::statement("ALTER TABLE student_id_cards MODIFY COLUMN status ENUM('requested', 'approved', 'printed', 'released') NOT NULL DEFAULT 'requested'");
    }
};
