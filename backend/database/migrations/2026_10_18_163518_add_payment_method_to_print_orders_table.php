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
        Schema::table('print_orders', function (Blueprint $table) {
            $table->enum('payment_method', ['cash_on_pickup', 'upload_proof'])->default('cash_on_pickup')->after('payment_status');
            $table->string('payment_proof_file', 255)->nullable()->after('payment_method');
            $table->string('payment_proof_original_name', 255)->nullable()->after('payment_proof_file');
            $table->timestamp('payment_proof_uploaded_at')->nullable()->after('payment_proof_original_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('print_orders', function (Blueprint $table) {
            $table->dropColumn(['payment_method', 'payment_proof_file', 'payment_proof_original_name', 'payment_proof_uploaded_at']);
        });
    }
};
