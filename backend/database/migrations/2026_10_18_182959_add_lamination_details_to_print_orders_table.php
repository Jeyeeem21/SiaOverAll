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
            $table->string('lamination_item', 100)->nullable()->after('lamination_type');
            $table->integer('lamination_quantity')->default(1)->after('lamination_item');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('print_orders', function (Blueprint $table) {
            $table->dropColumn(['lamination_item', 'lamination_quantity']);
        });
    }
};
