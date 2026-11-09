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
        Schema::create('sticker_requests', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('student_id')->constrained('account_students')->cascadeOnDelete();
            $table->string('plate_number');
            $table->string('vehicle_type');
            $table->string('vehicle_model')->nullable();
            $table->string('vehicle_color')->nullable();
            $table->string('license_path');
            $table->string('official_receipt_path');
            $table->string('certificate_of_registration_path');
            $table->string('status')->default('pending');
            $table->timestamps();

            $table->index(['student_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sticker_requests');
    }
};
