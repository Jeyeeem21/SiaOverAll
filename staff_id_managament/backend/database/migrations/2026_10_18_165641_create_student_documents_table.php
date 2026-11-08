<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->string('document_type'); // birth_certificate, transcript, clearance, etc.
            $table->string('document_name')->nullable(); // User-friendly name
            $table->string('file_path'); // Storage path
            $table->string('original_filename'); // Original file name
            $table->string('mime_type'); // File MIME type
            $table->unsignedBigInteger('file_size'); // Size in bytes
            $table->text('notes')->nullable(); // Optional notes
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            
            $table->index(['student_id', 'document_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_documents');
    }
};
