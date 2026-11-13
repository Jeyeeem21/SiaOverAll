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
        Schema::table('sticker_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('sticker_requests', 'remarks')) {
                $table->text('remarks')->nullable()->after('status');
            }
            if (!Schema::hasColumn('sticker_requests', 'reviewed_by')) {
                $table->unsignedBigInteger('reviewed_by')->nullable()->after('remarks');
            }
            if (!Schema::hasColumn('sticker_requests', 'reviewed_at')) {
                $table->timestamp('reviewed_at')->nullable()->after('reviewed_by');
            }
        });
        
        // Add foreign key and index separately to avoid duplicate errors
        try {
            Schema::table('sticker_requests', function (Blueprint $table) {
                $table->foreign('reviewed_by')->references('id')->on('users')->onDelete('set null');
            });
        } catch (\Exception $e) {
            // Foreign key might already exist
        }
        
        try {
            Schema::table('sticker_requests', function (Blueprint $table) {
                $table->index('reviewed_by');
            });
        } catch (\Exception $e) {
            // Index might already exist
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sticker_requests', function (Blueprint $table) {
            $table->dropForeign(['reviewed_by']);
            $table->dropColumn(['remarks', 'reviewed_by', 'reviewed_at']);
        });
    }
};
