<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== TESTING MAIN SYSTEM ORDER CREATION ===\n\n";

try {
    // Test creating order like main system does
    $orderNumber = 'TEST-' . time();
    
    $order = \App\Models\Order::create([
        'order_number' => $orderNumber,
        'customer_name' => 'Test Customer',
        'service_type' => 'Printing',
        'status' => 'Pending',
        'notes' => 'Test order',
        'total_amount' => 100.00,
    ]);
    
    echo "✓ Order created successfully: {$order->order_number}\n";
    echo "  Order ID: {$order->order_id}\n";
    echo "  Customer: {$order->customer_name}\n";
    echo "  Total: {$order->total_amount}\n\n";
    
    // Test creating order item
    $orderItem = \App\Models\OrderItem::create([
        'order_id' => $order->order_id,
        'product_id' => 1,
        'product_name' => 'Test Product',
        'quantity' => 5,
        'unit_price' => 20.00,
        'notes' => 'Test item',
    ]);
    
    echo "✓ Order item created successfully\n";
    echo "  Item ID: {$orderItem->order_item_id}\n";
    echo "  Product: {$orderItem->product_name}\n";
    echo "  Quantity: {$orderItem->quantity}\n";
    echo "  Price: {$orderItem->unit_price}\n\n";
    
    // Clean up
    $orderItem->delete();
    $order->delete();
    
    echo "✓ Test completed successfully - Main system logic is NOT broken!\n";
    
} catch (\Exception $e) {
    echo "✗ ERROR: {$e->getMessage()}\n";
    echo "Stack trace:\n{$e->getTraceAsString()}\n";
    exit(1);
}
