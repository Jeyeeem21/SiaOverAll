<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Convert the former Student Account ID format (ORDYYYYMMDD####) to the
     * shared POS format (ORD-YYYY-####). The numeric order ID stays unchanged.
     */
    public function up(): void
    {
        $legacyOrders = DB::table('orders')
            ->whereRaw("order_number REGEXP '^ORD[0-9]{12}$'")
            ->orderBy('order_id')
            ->get(['order_id', 'order_number', 'created_at']);

        foreach ($legacyOrders as $order) {
            $year = $order->created_at
                ? date('Y', strtotime($order->created_at))
                : date('Y');
            $sequence = $order->order_id;
            $orderNumber = 'ORD-'.$year.'-'.str_pad($sequence, 4, '0', STR_PAD_LEFT);

            // A manually edited historical number could already use this
            // value. In that rare case, advance until a unique ID is found.
            while (DB::table('orders')
                ->where('order_number', $orderNumber)
                ->where('order_id', '!=', $order->order_id)
                ->exists()) {
                $sequence++;
                $orderNumber = 'ORD-'.$year.'-'.str_pad($sequence, 4, '0', STR_PAD_LEFT);
            }

            DB::table('orders')
                ->where('order_id', $order->order_id)
                ->update(['order_number' => $orderNumber]);
        }
    }

    public function down(): void
    {
        // Keep standardized public IDs stable on rollback.
    }
};
