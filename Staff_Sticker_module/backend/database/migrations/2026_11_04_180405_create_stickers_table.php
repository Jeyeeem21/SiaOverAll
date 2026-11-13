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
        Schema::create('stickers', function (Blueprint $table) {
            $table->id();
            
            // Reference to sticker request
            $table->foreignId('sticker_request_id')->constrained('sticker_requests')->onDelete('cascade');
            
            // Serial number (format: MSU-YYYY-XXXXX)
            $table->string('serial_number', 20)->unique();
            
            // Sticker details
            $table->string('plate_number', 20);
            $table->string('student_name', 255);
            $table->string('student_id_number', 50);
            $table->enum('vehicle_type', ['motorcycle', 'car', 'suv', 'van']);
            $table->decimal('price', 10, 2)->default(100.00);
            
            // File information
            $table->string('file_path');
            $table->enum('file_format', ['pdf', 'png'])->default('pdf');
            
            // Generation tracking
            $table->foreignId('generated_by')->constrained('users')->onDelete('restrict');
            $table->timestamp('generated_at');
            
            $table->timestamps();
            
            // Indexes for performance optimization
            $table->index('serial_number');
            $table->index('sticker_request_id');
            $table->index('generated_at');
            $table->index('plate_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stickers');
    }
};
