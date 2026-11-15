<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The earlier migration can be recorded before this shared table exists.
     * Reconcile the live shared schema whenever the Staff ID service deploys.
     */
    public function up(): void
    {
        if (! Schema::hasTable('account_students') || Schema::hasColumn('account_students', 'signature_path')) {
            return;
        }

        Schema::table('account_students', function (Blueprint $table) {
            $table->string('signature_path')->nullable()->after('photo_path');
        });
    }

    public function down(): void
    {
        if (Schema::hasTable('account_students') && Schema::hasColumn('account_students', 'signature_path')) {
            Schema::table('account_students', function (Blueprint $table) {
                $table->dropColumn('signature_path');
            });
        }
    }
};
