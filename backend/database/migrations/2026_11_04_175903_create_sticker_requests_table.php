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
        Schema::create('sticker_requests', function (Blueprint $table) {
            $table->id();
            
            // Student information
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            
            // Request status
            $table->enum('status', ['pending', 'approved', 'denied', 'completed'])->default('pending');
            
            // Vehicle information
            $table->enum('vehicle_type', ['motorcycle', 'car', 'suv', 'van']);
            $table->string('vehicle_plate_number', 20);
            
            // Review information
            $table->text('remarks')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();
            
            $table->timestamps();
            
            // Indexes for performance optimization
            $table->index('status');
            $table->index('student_id');
            $table->index('created_at');
            $table->index(['status', 'created_at']);
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
