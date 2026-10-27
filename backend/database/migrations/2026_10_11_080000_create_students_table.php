<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->unique()->constrained()->nullOnDelete();
            $table->string('student_number')->unique();
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('program');
            $table->string('year_level', 30);
            $table->string('section', 50);
            $table->string('department');
            $table->string('email')->nullable();
            $table->string('contact_number', 30)->nullable();
            $table->enum('verification_status', ['pending', 'verified', 'unverified'])->default('pending')->index();
            $table->timestamps();

            $table->index(['program', 'year_level']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
