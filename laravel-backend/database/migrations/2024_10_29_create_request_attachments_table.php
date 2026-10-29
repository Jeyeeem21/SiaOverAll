<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('request_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sticker_request_id')->constrained('sticker_requests')->onDelete('cascade');
            $table->string('file_name');
            $table->string('file_path');
            $table->string('file_type');
            $table->unsignedBigInteger('file_size');
            $table->string('upload_type'); // 'vehicle_document', 'identity', 'other'
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('sticker_request_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('request_attachments');
    }
};
