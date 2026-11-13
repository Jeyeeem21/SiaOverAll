<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Reconcile tables that were previously created by the retired standalone
     * sticker module. Sticker requests are now owned by Student Account, so
     * their student reference must point at account_students.
     */
    public function up(): void
    {
        Schema::table('sticker_requests', function (Blueprint $table): void {
            $table->dropForeign('sticker_requests_student_id_foreign');
            $table->unsignedBigInteger('student_id')->change();
            $table->string('status')->default('pending')->change();
            $table->string('vehicle_type')->change();
            $table->string('plate_number')->change();
        });

        Schema::table('sticker_requests', function (Blueprint $table): void {
            $table->foreign('student_id')
                ->references('id')
                ->on('account_students')
                ->cascadeOnDelete();
            $table->index(['student_id', 'created_at']);
        });

        // The existing stickers table is empty and has the obsolete standalone
        // module fields. Replace only those fields with the columns used by
        // StaffStickerController and the Student Account Sticker model.
        Schema::table('stickers', function (Blueprint $table): void {
            $table->dropColumn([
                'plate_number',
                'student_name',
                'student_id_number',
                'vehicle_type',
                'file_path',
                'file_format',
                'generated_at',
            ]);
        });

        Schema::table('stickers', function (Blueprint $table): void {
            $table->string('vehicle_code', 20)->after('serial_number');
            $table->string('valid_month', 3)->after('price');
            $table->string('valid_year', 4)->after('valid_month');
        });
    }

    public function down(): void
    {
        throw new RuntimeException('This shared-schema reconciliation must be rolled back with an explicit migration.');
    }
};
