<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('account_students')) {
            return;
        }

        if (! Schema::hasColumn('account_students', 'year_level')) {
            Schema::table('account_students', function (Blueprint $table): void {
                $table->string('year_level')->nullable();
            });
        }

        if (! Schema::hasColumn('account_students', 'section')) {
            Schema::table('account_students', function (Blueprint $table): void {
                $table->string('section')->nullable();
            });
        }

        if (! Schema::hasColumn('account_students', 'birthdate')) {
            Schema::table('account_students', function (Blueprint $table): void {
                $table->date('birthdate')->nullable();
            });
        }

        if (! Schema::hasColumn('account_students', 'address')) {
            Schema::table('account_students', function (Blueprint $table): void {
                $table->text('address')->nullable();
            });
        }

        if (! Schema::hasColumn('account_students', 'emergency_contact_name')) {
            Schema::table('account_students', function (Blueprint $table): void {
                $table->string('emergency_contact_name')->nullable();
            });
        }

        if (! Schema::hasColumn('account_students', 'emergency_contact_number')) {
            Schema::table('account_students', function (Blueprint $table): void {
                $table->string('emergency_contact_number')->nullable();
            });
        }
    }

    public function down(): void
    {
        // This migration reconciles a shared production table and must not
        // remove fields that may also be owned by the Staff ID module.
    }
};
