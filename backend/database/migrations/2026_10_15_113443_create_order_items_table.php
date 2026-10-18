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
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('product_id'); // References products.id from MySQL
            $table->string('product_name'); // Store product name at time of order
            $table->string('product_barcode')->nullable();
            $table->text('product_description')->nullable();
            $table->string('category_name')->nullable();
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('unit_cost', 10, 2)->nullable();
            $table->decimal('total_price', 10, 2);
            $table->string('unit')->nullable();
            $table->text('special_instructions')->nullable();
            $table->enum('status', ['pending', 'preparing', 'ready', 'delivered', 'cancelled'])->default('pending');
            $table->timestamp('prepared_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
            
            $table->index(['order_id', 'product_id']);
            $table->index('product_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
