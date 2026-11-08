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
        if (Schema::hasTable('account_students') && 
            !Schema::hasColumn('account_students', 'year_level')) {
            Schema::table('account_students', function (Blueprint $table) {
                $table->string('year_level')->nullable()->after('department');
                $table->string('section')->nullable()->after('year_level');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('account_students')) {
            Schema::table('account_students', function (Blueprint $table) {
                if (Schema::hasColumn('account_students', 'year_level')) {
                    $table->dropColumn(['year_level', 'section']);
                }
            });
        }
    }
};
