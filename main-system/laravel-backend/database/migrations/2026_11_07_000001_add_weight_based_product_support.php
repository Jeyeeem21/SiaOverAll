<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->enum('sale_type', ['count', 'weight'])->default('count')->after('unit');
        });

        // Quantities must accept fractional kilograms (for example, 1.250 kg).
        DB::statement('ALTER TABLE inventories MODIFY quantity DECIMAL(12,2) NOT NULL DEFAULT 0');
        DB::statement('ALTER TABLE inventories MODIFY reorder_level DECIMAL(12,2) NOT NULL DEFAULT 10');
        DB::statement('ALTER TABLE inventories MODIFY reorder_quantity DECIMAL(12,2) NOT NULL DEFAULT 50');
        DB::statement('ALTER TABLE inventories MODIFY last_restock_quantity DECIMAL(12,2) NULL');
        DB::statement('ALTER TABLE order_items MODIFY quantity DECIMAL(12,2) NOT NULL');
        DB::statement('ALTER TABLE product_transactions MODIFY quantity DECIMAL(12,2) NOT NULL');
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('sale_type');
        });

        DB::statement('ALTER TABLE inventories MODIFY quantity INT NOT NULL DEFAULT 0');
        DB::statement('ALTER TABLE inventories MODIFY reorder_level INT NOT NULL DEFAULT 10');
        DB::statement('ALTER TABLE inventories MODIFY reorder_quantity INT NOT NULL DEFAULT 50');
        DB::statement('ALTER TABLE inventories MODIFY last_restock_quantity INT NULL');
        DB::statement('ALTER TABLE order_items MODIFY quantity INT NOT NULL');
        DB::statement('ALTER TABLE product_transactions MODIFY quantity INT NOT NULL');
    }
};
