<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sticker_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('sticker_type_id')->constrained('sticker_types')->onDelete('restrict');
            $table->enum('status', ['pending', 'approved', 'rejected', 'paid', 'printed', 'released', 'cancelled'])->default('pending');
            $table->integer('quantity')->default(1);
            
            // Vehicle details
            $table->string('vehicle_registration')->nullable();
            $table->string('vehicle_type')->nullable();
            $table->string('vehicle_color')->nullable();
            $table->string('vehicle_model')->nullable();
            
            // Request details
            $table->text('purpose')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->json('requirements')->nullable();
            
            // Payment tracking
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->string('payment_reference')->nullable();
            $table->timestamp('payment_date')->nullable();
            
            // Approval tracking
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('approval_notes')->nullable();
            $table->timestamp('approved_at')->nullable();
            
            $table->text('rejection_reason')->nullable();
            $table->timestamp('rejected_at')->nullable();
            
            // Printing tracking
            $table->timestamp('printed_at')->nullable();
            $table->timestamp('released_at')->nullable();
            $table->foreignId('released_by')->nullable()->constrained('users')->onDelete('set null');
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('user_id');
            $table->index('status');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sticker_requests');
    }
};
