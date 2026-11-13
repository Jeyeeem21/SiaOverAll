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
        Schema::create('request_documents', function (Blueprint $table) {
            $table->id();
            
            // Reference to sticker request
            $table->foreignId('sticker_request_id')->constrained('sticker_requests')->onDelete('cascade');
            
            // Document type (student_id, registration, photo, other)
            $table->enum('document_type', ['student_id', 'registration', 'photo', 'other']);
            
            // File information
            $table->string('file_name');
            $table->string('file_path');
            $table->unsignedBigInteger('file_size'); // File size in bytes (max 10MB = 10485760)
            $table->string('mime_type', 50); // MIME type (image/jpeg, image/png, image/jpg, application/pdf)
            
            $table->timestamps();
            
            // Indexes for performance optimization
            $table->index('sticker_request_id');
            $table->index('document_type');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request_documents');
    }
};
