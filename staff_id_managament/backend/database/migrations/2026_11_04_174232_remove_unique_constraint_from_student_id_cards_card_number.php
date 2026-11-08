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
        Schema::table('student_id_cards', function (Blueprint $table) {
            // Drop the unique constraint on card_number
            // This allows students to request replacement IDs with the same card number
            $table->dropUnique('student_id_cards_card_number_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_id_cards', function (Blueprint $table) {
            // Re-add the unique constraint
            $table->unique('card_number', 'student_id_cards_card_number_unique');
        });
    }
};
