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
        Schema::create('print_orders', function (Blueprint $table) {
            $table->id('print_order_id');
            $table->string('order_number', 50)->unique();
            
            // Student Information (from external system via API)
            $table->string('student_id', 50)->nullable(); // External student ID
            $table->string('student_name', 100);
            $table->string('student_email', 100);
            $table->string('student_phone', 20)->nullable();
            
            // Printing Options
            $table->enum('color_type', ['black_white', 'colored'])->default('black_white');
            $table->enum('paper_size', ['A4', 'A3', 'Letter', 'Legal', 'Short', 'Long'])->default('A4');
            $table->enum('orientation', ['portrait', 'landscape'])->default('portrait');
            $table->enum('print_side', ['single', 'double'])->default('single');
            $table->integer('copies')->default(1);
            $table->integer('pages_per_document')->default(1);
            $table->integer('total_pages')->default(1); // copies * pages_per_document
            
            // Binding & Lamination
            $table->enum('binding_type', ['none', 'spiral', 'staple', 'plastic_comb'])->default('none');
            $table->boolean('lamination')->default(false);
            $table->enum('lamination_type', ['none', 'glossy', 'matte'])->default('none');
            
            // Pricing
            $table->decimal('price_per_page', 8, 2)->default(0);
            $table->decimal('binding_cost', 8, 2)->default(0);
            $table->decimal('lamination_cost', 8, 2)->default(0);
            $table->decimal('total_amount', 10, 2)->default(0);
            
            // Order Status
            $table->enum('status', [
                'submitted',
                'reviewing',
                'awaiting_payment',
                'payment_confirmed',
                'printing',
                'ready_for_pickup',
                'completed',
                'cancelled'
            ])->default('submitted');
            
            // Payment Information
            $table->enum('payment_status', ['pending', 'partial', 'paid', 'refunded'])->default('pending');
            $table->decimal('amount_paid', 10, 2)->default(0);
            $table->string('payment_reference', 100)->nullable();
            $table->timestamp('payment_date')->nullable();
            
            // Additional Details
            $table->text('special_instructions')->nullable();
            $table->text('staff_notes')->nullable();
            $table->text('cancellation_reason')->nullable();
            
            // Pickup Details
            $table->date('preferred_pickup_date')->nullable();
            $table->timestamp('ready_at')->nullable();
            $table->timestamp('picked_up_at')->nullable();
            
            // Staff Actions
            $table->foreignId('processed_by')->nullable()->constrained('users', 'id')->nullOnDelete();
            $table->foreignId('cancelled_by')->nullable()->constrained('users', 'id')->nullOnDelete();
            $table->timestamp('cancelled_at')->nullable();
            
            // Timestamps
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for performance
            $table->index('student_id');
            $table->index('student_email');
            $table->index('status');
            $table->index('payment_status');
            $table->index('created_at');
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('print_orders');
    }
};
