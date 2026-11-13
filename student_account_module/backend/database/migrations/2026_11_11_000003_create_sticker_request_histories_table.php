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
        if (!Schema::hasTable('sticker_request_histories')) {
            Schema::create('sticker_request_histories', function (Blueprint $table) {
                $table->id();
                $table->foreignId('sticker_request_id')->constrained('sticker_requests')->cascadeOnDelete();
                $table->string('old_status', 20);
                $table->string('new_status', 20);
                $table->text('remarks')->nullable();
                $table->unsignedBigInteger('changed_by');
                $table->timestamp('changed_at');
                
                $table->foreign('changed_by')->references('id')->on('users')->onDelete('cascade');
                $table->index(['sticker_request_id', 'changed_at']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sticker_request_histories');
    }
};
