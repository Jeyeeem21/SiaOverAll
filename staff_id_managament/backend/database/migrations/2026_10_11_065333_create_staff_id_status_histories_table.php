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
        Schema::create('staff_id_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id_card_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['requested', 'approved', 'printed', 'released']);
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_id_status_histories');
    }
};
