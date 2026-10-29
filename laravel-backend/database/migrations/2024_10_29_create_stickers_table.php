<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stickers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sticker_request_id')->constrained('sticker_requests')->onDelete('cascade');
            $table->string('serial_number')->unique();
            $table->string('qr_code')->unique();
            $table->date('issue_date');
            $table->date('expiry_date');
            $table->enum('status', ['active', 'inactive', 'expired', 'revoked'])->default('active');
            $table->integer('reprint_count')->default(0);
            $table->timestamp('last_reprinted_at')->nullable();
            $table->string('file_path')->nullable(); // Path to generated QR/label
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('serial_number');
            $table->index('expiry_date');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stickers');
    }
};
