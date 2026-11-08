<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE inventories MODIFY quantity DECIMAL(12,2) NOT NULL DEFAULT 0');
        DB::statement('ALTER TABLE inventories MODIFY reorder_level DECIMAL(12,2) NOT NULL DEFAULT 10');
        DB::statement('ALTER TABLE inventories MODIFY reorder_quantity DECIMAL(12,2) NOT NULL DEFAULT 50');
        DB::statement('ALTER TABLE inventories MODIFY last_restock_quantity DECIMAL(12,2) NULL');
        DB::statement('ALTER TABLE order_items MODIFY quantity DECIMAL(12,2) NOT NULL');
        DB::statement('ALTER TABLE product_transactions MODIFY quantity DECIMAL(12,2) NOT NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE inventories MODIFY quantity DECIMAL(12,3) NOT NULL DEFAULT 0');
        DB::statement('ALTER TABLE inventories MODIFY reorder_level DECIMAL(12,3) NOT NULL DEFAULT 10');
        DB::statement('ALTER TABLE inventories MODIFY reorder_quantity DECIMAL(12,3) NOT NULL DEFAULT 50');
        DB::statement('ALTER TABLE inventories MODIFY last_restock_quantity DECIMAL(12,3) NULL');
        DB::statement('ALTER TABLE order_items MODIFY quantity DECIMAL(12,3) NOT NULL');
        DB::statement('ALTER TABLE product_transactions MODIFY quantity DECIMAL(12,3) NOT NULL');
    }
};
