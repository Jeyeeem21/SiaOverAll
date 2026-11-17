<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ensure card requests point to the integrated Student Account record.
     *
     * Older deployments could record the previous migration as complete before
     * account_students existed, leaving student_id_cards linked to students.
     */
    public function up(): void
    {
        if (!Schema::hasTable('student_id_cards') || !Schema::hasTable('account_students')) {
            return;
        }

        $foreignKeys = DB::select(
            "SELECT CONSTRAINT_NAME AS constraint_name, REFERENCED_TABLE_NAME AS referenced_table_name
             FROM information_schema.KEY_COLUMN_USAGE
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = ?
               AND COLUMN_NAME = 'student_id'
               AND REFERENCED_TABLE_NAME IS NOT NULL",
            ['student_id_cards'],
        );

        $hasAccountStudentsForeignKey = false;
        foreach ($foreignKeys as $foreignKey) {
            if ($foreignKey->referenced_table_name === 'account_students') {
                $hasAccountStudentsForeignKey = true;
                continue;
            }

            $constraintName = str_replace('`', '``', $foreignKey->constraint_name);
            DB::statement("ALTER TABLE `student_id_cards` DROP FOREIGN KEY `{$constraintName}`");
        }

        if (!$hasAccountStudentsForeignKey) {
            Schema::table('student_id_cards', function (Blueprint $table): void {
                $table->foreign('student_id', 'student_id_cards_student_id_account_students_foreign')
                    ->references('id')
                    ->on('account_students')
                    ->cascadeOnDelete();
            });
        }
    }

    public function down(): void
    {
        // The previous target table is not restored because it is obsolete.
    }
};
