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
        Schema::create('student_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->enum('document_type', ['school_id', 'registration_form']);
            $table->string('file_path');
            $table->string('original_name');
            $table->string('mime');
            $table->integer('size');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->string('rejection_reason')->nullable();
            $table->text('reviewer_note')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_verifications');
    }
};
