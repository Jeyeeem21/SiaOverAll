<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adding fields needed for student account module integration to order_items
     */
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            // Add missing product details
            $table->string('product_barcode')->nullable()->after('product_name');
            $table->text('product_description')->nullable()->after('product_barcode');
            $table->string('category_name')->nullable()->after('product_description');
            
            // Add unit cost and total price
            $table->decimal('unit_cost', 10, 2)->default(0)->after('unit_price');
            $table->decimal('total_price', 10, 2)->default(0)->after('unit_cost');
            
            // Add unit field
            $table->string('unit', 50)->nullable()->after('total_price');
            
            // Add special instructions
            $table->text('special_instructions')->nullable()->after('unit');
            
            // Add status tracking
            $table->enum('status', ['pending', 'preparing', 'ready', 'delivered', 'cancelled'])
                ->default('pending')
                ->after('special_instructions');
            
            // Add timestamps for item lifecycle
            $table->timestamp('prepared_at')->nullable()->after('status');
            $table->timestamp('delivered_at')->nullable()->after('prepared_at');
            
            // Add updated_at if not exists
            if (!Schema::hasColumn('order_items', 'updated_at')) {
                $table->timestamp('updated_at')->nullable()->after('delivered_at');
            }
            
            // Add indexes
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex(['status']);
            
            $table->dropColumn([
                'product_barcode',
                'product_description',
                'category_name',
                'unit_cost',
                'total_price',
                'unit',
                'special_instructions',
                'status',
                'prepared_at',
                'delivered_at',
            ]);
            
            // Only drop updated_at if we added it
            if (Schema::hasColumn('order_items', 'updated_at')) {
                $table->dropColumn('updated_at');
            }
        });
    }
};
