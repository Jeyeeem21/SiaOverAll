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
        Schema::create('print_order_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('print_order_id')->constrained('print_orders', 'print_order_id')->onDelete('cascade');
            
            $table->string('from_status', 50)->nullable();
            $table->string('to_status', 50);
            $table->text('notes')->nullable();
            $table->string('changed_by_name', 100)->nullable(); // For display
            $table->foreignId('changed_by')->nullable()->constrained('users', 'id')->nullOnDelete();
            
            $table->timestamp('created_at')->useCurrent();
            
            // Indexes
            $table->index('print_order_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('print_order_status_history');
    }
};
