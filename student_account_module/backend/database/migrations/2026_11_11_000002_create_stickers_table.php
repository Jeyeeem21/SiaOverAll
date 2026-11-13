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
        if (!Schema::hasTable('stickers')) {
            Schema::create('stickers', function (Blueprint $table) {
                $table->id();
                $table->foreignId('sticker_request_id')->constrained('sticker_requests')->cascadeOnDelete();
                $table->string('serial_number', 50)->unique();
                $table->string('vehicle_code', 20);
                $table->decimal('price', 10, 2);
                $table->string('valid_month', 3);
                $table->string('valid_year', 4);
                $table->unsignedBigInteger('generated_by');
                $table->timestamps();
                
                $table->foreign('generated_by')->references('id')->on('users')->onDelete('cascade');
                $table->index(['sticker_request_id', 'created_at']);
                $table->index('serial_number');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stickers');
    }
};
