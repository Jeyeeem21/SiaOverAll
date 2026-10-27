<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->string('signature_path')->nullable()->after('photo_path');
            $table->string('address')->nullable()->after('department');
            $table->date('birthdate')->nullable()->after('address');
            $table->string('emergency_contact_name')->nullable()->after('contact_number');
            $table->string('emergency_contact_number')->nullable()->after('emergency_contact_name');
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn([
                'signature_path',
                'address',
                'birthdate',
                'emergency_contact_name',
                'emergency_contact_number'
            ]);
        });
    }
};
