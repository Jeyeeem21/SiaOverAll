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
        if (Schema::hasTable('student_id_cards') && Schema::hasTable('account_students')) {
            Schema::table('student_id_cards', function (Blueprint $table) {
                // Drop the old foreign key constraint if it exists
                try {
                    $table->dropForeign('student_id_cards_student_id_foreign');
                } catch (\Exception $e) {
                    // Foreign key might not exist, continue
                }
                
                // Add new foreign key constraint referencing account_students
                $table->foreign('student_id')
                    ->references('id')
                    ->on('account_students')
                    ->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('student_id_cards') && Schema::hasTable('students')) {
            Schema::table('student_id_cards', function (Blueprint $table) {
                // Drop the new foreign key constraint
                try {
                    $table->dropForeign(['student_id']);
                } catch (\Exception $e) {
                    // Foreign key might not exist, continue
                }
                
                // Recreate the old foreign key constraint (back to students table)
                $table->foreign('student_id')
                    ->references('id')
                    ->on('students')
                    ->onDelete('cascade');
            });
        }
    }
};
