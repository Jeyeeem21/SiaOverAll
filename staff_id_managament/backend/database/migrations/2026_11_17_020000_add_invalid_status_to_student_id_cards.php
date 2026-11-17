<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('student_id_cards')) {
            DB::statement("ALTER TABLE student_id_cards MODIFY COLUMN status ENUM('requested', 'approved', 'printed', 'released', 'expired', 'replacement_requested', 'invalid') NOT NULL DEFAULT 'requested'");
        }

        if (Schema::hasTable('student_id_status_histories')) {
            DB::statement("ALTER TABLE student_id_status_histories MODIFY COLUMN status ENUM('requested', 'approved', 'printed', 'released', 'expired', 'replacement_requested', 'invalid') NOT NULL");
        }
    }

    public function down(): void
    {
        // Existing invalid records represent cancelled/replaced IDs. Keep them
        // intact rather than risking data loss during a rollback.
    }
};
