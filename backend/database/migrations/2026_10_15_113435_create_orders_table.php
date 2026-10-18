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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->string('order_number')->unique();
            $table->enum('status', ['pending', 'processing', 'completed', 'cancelled', 'refunded'])->default('pending');
            $table->enum('payment_status', ['unpaid', 'paid', 'partially_paid', 'refunded', 'failed'])->default('unpaid');
            $table->decimal('subtotal', 10, 2)->default(0.00);
            $table->decimal('tax_amount', 10, 2)->default(0.00);
            $table->decimal('discount_amount', 10, 2)->default(0.00);
            $table->decimal('total_amount', 10, 2)->default(0.00);
            $table->string('payment_method')->nullable();
            $table->string('payment_reference')->nullable();
            $table->text('notes')->nullable();
            $table->text('staff_notes')->nullable();
            $table->timestamp('order_date')->useCurrent();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
            $table->index(['student_id', 'order_date']);
            $table->index('order_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
