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
            !Schema::hasColumn('account_students', 'photo_path')) {
            Schema::table('account_students', function (Blueprint $table) {
                $table->string('photo_path')->nullable()->after('section');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('account_students') && 
            Schema::hasColumn('account_students', 'photo_path')) {
            Schema::table('account_students', function (Blueprint $table) {
                $table->dropColumn('photo_path');
            });
        }
    }
};
