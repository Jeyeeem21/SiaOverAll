<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_id_releases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id_card_id')->constrained('student_id_cards')->cascadeOnDelete();
            $table->string('recipient_name');
            $table->timestamp('released_at');
            $table->foreignId('released_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['student_id_card_id', 'released_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_id_releases');
    }
};
