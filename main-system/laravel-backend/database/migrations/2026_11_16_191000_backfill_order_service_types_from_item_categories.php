<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Populate legacy student-cart orders that were saved with the generic
     * service type even though their order items include a category name.
     */
    public function up(): void
    {
        $categoriesByOrder = DB::table('orders')
            ->join('order_items', 'order_items.order_id', '=', 'orders.order_id')
            ->where('orders.service_type', 'Other')
            ->whereNotNull('order_items.category_name')
            ->where('order_items.category_name', '!=', '')
            ->select('orders.order_id', 'order_items.category_name')
            ->orderBy('orders.order_id')
            ->get()
            ->groupBy('order_id');

        foreach ($categoriesByOrder as $orderId => $items) {
            $serviceType = $items->pluck('category_name')
                ->filter()
                ->unique()
                ->values()
                ->implode(', ');

            if ($serviceType !== '') {
                DB::table('orders')
                    ->where('order_id', $orderId)
                    ->update(['service_type' => $serviceType]);
            }
        }
    }

    public function down(): void
    {
        // Preserve the corrected historical categories on rollback.
    }
};
