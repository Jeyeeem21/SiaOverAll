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
        Schema::create('request_status_histories', function (Blueprint $table) {
            $table->id();
            
            // Reference to sticker request
            $table->foreignId('sticker_request_id')->constrained('sticker_requests')->onDelete('cascade');
            
            // Status transition tracking
            $table->enum('from_status', ['pending', 'approved', 'denied', 'completed'])->nullable();
            $table->enum('to_status', ['pending', 'approved', 'denied', 'completed']);
            
            // Change details
            $table->text('remarks')->nullable();
            $table->foreignId('changed_by')->constrained('users')->onDelete('restrict');
            
            $table->timestamps();
            
            // Indexes for performance optimization
            $table->index('sticker_request_id');
            $table->index('changed_by');
            $table->index('created_at');
            $table->index(['sticker_request_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request_status_histories');
    }
};
