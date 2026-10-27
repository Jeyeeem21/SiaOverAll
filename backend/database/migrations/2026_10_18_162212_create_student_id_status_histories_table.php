<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_id_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id_card_id')->constrained('student_id_cards')->cascadeOnDelete();
            $table->enum('status', ['requested', 'approved', 'printed', 'released', 'expired', 'replacement_requested']);
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['student_id_card_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_id_status_histories');
    }
};
