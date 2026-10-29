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
        Schema::create('print_order_files', function (Blueprint $table) {
            $table->id('file_id');
            $table->foreignId('print_order_id')->constrained('print_orders', 'print_order_id')->onDelete('cascade');
            
            // File Information
            $table->string('original_filename', 255);
            $table->string('stored_filename', 255);
            $table->string('file_path', 500);
            $table->string('file_type', 50); // pdf, docx, jpg, png, etc.
            $table->string('mime_type', 100);
            $table->bigInteger('file_size'); // in bytes
            
            // Document Details
            $table->integer('page_count')->nullable();
            $table->string('file_hash', 64)->nullable(); // SHA256 hash for verification
            
            // Status
            $table->enum('status', ['uploaded', 'processing', 'ready', 'printed', 'error'])->default('uploaded');
            $table->text('error_message')->nullable();
            
            // Download tracking
            $table->integer('download_count')->default(0);
            $table->timestamp('last_downloaded_at')->nullable();
            $table->foreignId('last_downloaded_by')->nullable()->constrained('users', 'id')->nullOnDelete();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('print_order_id');
            $table->index('status');
            $table->index('file_hash');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('print_order_files');
    }
};
