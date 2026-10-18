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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->string('transaction_number')->unique();
            $table->enum('type', ['payment', 'refund', 'partial_refund'])->default('payment');
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled'])->default('pending');
            $table->string('payment_method'); // cash, gcash, bank_transfer, card, etc.
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('PHP');
            $table->string('reference_number')->nullable();
            $table->string('external_transaction_id')->nullable();
            $table->text('payment_details')->nullable(); // JSON for additional payment info
            $table->text('notes')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            $table->index(['order_id', 'status']);
            $table->index('transaction_number');
            $table->index('reference_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
