<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('audit_trail_logs')) {
            // Audit timestamps created before this change were stored as UTC.
            // Convert existing local history once so the stored value itself is
            // Asia/Manila, matching future audit writes.
            DB::table('audit_trail_logs')->update([
                'occurred_at' => DB::raw('DATE_ADD(occurred_at, INTERVAL 8 HOUR)'),
            ]);
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('audit_trail_logs')) {
            DB::table('audit_trail_logs')->update([
                'occurred_at' => DB::raw('DATE_SUB(occurred_at, INTERVAL 8 HOUR)'),
            ]);
        }
    }
};
