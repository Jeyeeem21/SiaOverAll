<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Transaction;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    /**
     * Get all orders for the authenticated student.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $student = Student::where('user_id', $user->id)->first();
            
            if (!$student) {
                return response()->json(['error' => 'Student profile not found'], 404);
            }

            $orders = Order::with(['orderItems', 'transactions', 'payment'])
                ->where('student_id', $student->id)
                ->orderBy('order_date', 'desc')
                ->get()
                ->map(function ($order) {
                    return [
                        'id' => $order->order_id,
                        'order_number' => $order->order_number,
                        'customer_name' => $order->customer_name,
                        'service_type' => $order->service_type,
                        'status' => $order->status,
                        // A staff-recorded payment is the source of truth. This also
                        // repairs display of older orders created before payment_status
                        // was written by the Main System completion flow.
                        'payment_status' => $order->payment ? 'paid' : ($order->payment_status ?? 'unpaid'),
                        'subtotal' => (float) $order->subtotal,
                        'tax_amount' => (float) $order->tax_amount,
                        'discount_amount' => (float) $order->discount_amount,
                        'total_amount' => (float) $order->total_amount,
                        'payment_method' => $order->payment?->payment_method ?? $order->payment_method,
                        'payment_reference' => $order->payment_reference,
                        'notes' => $order->notes,
                        'order_date' => $order->order_date,
                        'completed_at' => $order->completed_at,
                        'cancelled_at' => $order->cancelled_at,
                        'items_count' => $order->orderItems->count(),
                        'total_quantity' => $order->orderItems->sum('quantity'),
                        'items' => $order->orderItems->map(function ($item) {
                            return [
                                'id' => $item->order_item_id,
                                'product_id' => $item->product_id,
                                'product_name' => $item->product_name,
                                'quantity' => $item->quantity,
                                'unit_price' => (float) $item->unit_price,
                                'total_price' => (float) $item->total_price,
                                'status' => $item->status,
                            ];
                        }),
                        'created_at' => $order->created_at,
                        'updated_at' => $order->updated_at,
                    ];
                });

            return response()->json($orders);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch orders'], 500);
        }
    }

    /**
     * Create a new product order with multiple items.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'items' => 'required|array|min:1',
                'items.*.product_id' => 'required|integer',
                'items.*.quantity' => 'required|numeric|gt:0',
                'items.*.special_instructions' => 'nullable|string|max:500',
                'payment_method' => 'nullable|in:cash,gcash,bank_transfer,card',
                'notes' => 'nullable|string|max:1000',
            ]);

            $user = Auth::user();
            $student = Student::where('user_id', $user->id)->first();
            
            if (!$student) {
                return response()->json(['error' => 'Student profile not found'], 404);
            }

            DB::beginTransaction();

            try {
                // Calculate order totals
                $subtotal = 0;
                $orderItems = [];

                foreach ($validated['items'] as $item) {
                    // Get product details from MySQL products table
                    $product = DB::connection('mysql')->table('products')
                        ->leftJoin('categories', 'products.category_id', '=', 'categories.category_id')
                        ->select(
                            'products.product_id',
                            'products.product_name as name',
                            'products.description',
                            'products.price',
                            'products.cost',
                            'products.unit',
                            'products.sale_type',
                            'products.barcode',
                            'products.status',
                            'products.is_active',
                            'products.expiration_date',
                            'categories.category_name'
                        )
                        ->where('products.product_id', $item['product_id'])
                        ->first();

                    if (!$product) {
                        throw new \Exception("Product ID {$item['product_id']} not found");
                    }

                    if (($product->sale_type ?? 'count') !== 'weight'
                        && floor((float) $item['quantity']) !== (float) $item['quantity']) {
                        throw new \Exception("Product '{$product->name}' is sold by whole units only");
                    }

                    // Check if product is available
                    if ($product->status !== 'active' && !$product->is_active) {
                        throw new \Exception("Product '{$product->name}' is not available");
                    }

                    if ($product->expiration_date && strtotime($product->expiration_date) < time()) {
                        throw new \Exception("Product '{$product->name}' has expired");
                    }

                    $unitPrice = (float) $product->price;
                    $quantity = $item['quantity'];
                    $totalPrice = $unitPrice * $quantity;
                    $subtotal += $totalPrice;

                    $orderItems[] = [
                        'product_id' => $product->product_id,
                        'product_name' => $product->name,
                        'product_barcode' => $product->barcode,
                        'product_description' => $product->description,
                        'category_name' => $product->category_name,
                        'quantity' => $quantity,
                        'unit_price' => $unitPrice,
                        'unit_cost' => (float) $product->cost,
                        'total_price' => $totalPrice,
                        'unit' => $product->unit,
                        'special_instructions' => $item['special_instructions'] ?? null,
                        'status' => 'pending',
                    ];
                }

                // Calculate taxes and totals
                $taxRate = 0.0; // No tax for now, can be configured
                $taxAmount = $subtotal * $taxRate;
                $totalAmount = $subtotal + $taxAmount;

                // Get student name from user's full_name
                $studentName = $user->full_name ?? 'Student';

                // Create the order with full schema
                $order = Order::create([
                    'student_id' => $student->id,
                    'order_number' => Order::generateOrderNumber(),
                    'customer_name' => $studentName,
                    'service_type' => 'Other', // Default service type - can be made dynamic
                    'status' => 'Pending',
                    'payment_status' => 'unpaid',
                    'payment_method' => $validated['payment_method'] ?? null,
                    'subtotal' => $subtotal,
                    'tax_amount' => $taxAmount,
                    'discount_amount' => 0.00,
                    'total_amount' => $totalAmount,
                    'notes' => $validated['notes'] ?? null,
                    'order_date' => now(),
                ]);

                // Create order items
                foreach ($orderItems as $itemData) {
                    $itemData['order_id'] = $order->order_id;
                    OrderItem::create($itemData);
                }

                // Create initial transaction if payment method is specified
                if (!empty($validated['payment_method'])) {
                    Transaction::create([
                        'order_id' => $order->order_id,
                        'transaction_number' => Transaction::generateTransactionNumber(),
                        'type' => 'payment',
                        'status' => 'pending',
                        'payment_method' => $validated['payment_method'],
                        'amount' => $totalAmount,
                        'currency' => 'PHP',
                    ]);
                }

                DB::commit();

                // Load the created order with relationships
                $order = Order::with(['orderItems', 'transactions'])->find($order->order_id);

                return response()->json([
                    'message' => 'Order created successfully',
                    'order' => [
                        'id' => $order->order_id,
                        'order_number' => $order->order_number,
                        'customer_name' => $order->customer_name,
                        'service_type' => $order->service_type,
                        'status' => $order->status,
                        'payment_status' => $order->payment_status,
                        'subtotal' => (float) $order->subtotal,
                        'tax_amount' => (float) $order->tax_amount,
                        'total_amount' => (float) $order->total_amount,
                        'payment_method' => $order->payment_method,
                        'items_count' => $order->orderItems->count(),
                        'total_quantity' => $order->orderItems->sum('quantity'),
                        'order_date' => $order->order_date,
                        'created_at' => $order->created_at,
                    ]
                ], 201);

            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }

        } catch (ValidationException $e) {
            return response()->json(['error' => 'Validation failed', 'details' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create order', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get a specific order by ID with all details.
     */
    public function show(Request $request, $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $student = Student::where('user_id', $user->id)->first();
            
            if (!$student) {
                return response()->json(['error' => 'Student profile not found'], 404);
            }

            $order = Order::with(['orderItems', 'transactions'])
                ->where('order_id', $id)
                ->where('student_id', $student->id)
                ->first();

            if (!$order) {
                return response()->json(['error' => 'Order not found'], 404);
            }

            return response()->json([
                'id' => $order->order_id,
                'order_number' => $order->order_number,
                'customer_name' => $order->customer_name,
                'service_type' => $order->service_type,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'subtotal' => (float) $order->subtotal,
                'tax_amount' => (float) $order->tax_amount,
                'discount_amount' => (float) $order->discount_amount,
                'total_amount' => (float) $order->total_amount,
                'payment_method' => $order->payment_method,
                'payment_reference' => $order->payment_reference,
                'notes' => $order->notes,
                'staff_notes' => $order->staff_notes,
                'preferred_pickup_date' => $order->preferred_pickup_date,
                'order_date' => $order->order_date,
                'completed_date' => $order->completed_date,
                'completed_at' => $order->completed_at,
                'cancelled_at' => $order->cancelled_at,
                'items' => $order->orderItems->map(function ($item) {
                    return [
                        'id' => $item->order_item_id,
                        'product_id' => $item->product_id,
                        'product_name' => $item->product_name,
                        'product_barcode' => $item->product_barcode,
                        'product_description' => $item->product_description,
                        'category_name' => $item->category_name,
                        'quantity' => $item->quantity,
                        'unit_price' => (float) $item->unit_price,
                        'unit_cost' => (float) $item->unit_cost,
                        'total_price' => (float) $item->total_price,
                        'unit' => $item->unit,
                        'special_instructions' => $item->special_instructions,
                        'status' => $item->status,
                        'prepared_at' => $item->prepared_at,
                        'delivered_at' => $item->delivered_at,
                    ];
                }),
                'transactions' => $order->transactions->map(function ($transaction) {
                    return [
                        'id' => $transaction->id,
                        'transaction_number' => $transaction->transaction_number,
                        'type' => $transaction->type,
                        'status' => $transaction->status,
                        'payment_method' => $transaction->payment_method,
                        'amount' => (float) $transaction->amount,
                        'currency' => $transaction->currency,
                        'reference_number' => $transaction->reference_number,
                        'processed_at' => $transaction->processed_at,
                        'confirmed_at' => $transaction->confirmed_at,
                    ];
                }),
                'created_at' => $order->created_at,
                'updated_at' => $order->updated_at,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch order'], 500);
        }
    }

    /**
     * Update order (payment method, notes, etc).
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'payment_method' => 'nullable|in:cash,gcash,bank_transfer,card',
                'notes' => 'nullable|string|max:1000',
                'preferred_pickup_date' => 'nullable|date',
            ]);

            $user = Auth::user();
            $student = Student::where('user_id', $user->id)->first();
            
            if (!$student) {
                return response()->json(['error' => 'Student profile not found'], 404);
            }

            $order = Order::where('order_id', $id)
                ->where('student_id', $student->id)
                ->where('status', 'Pending')
                ->first();

            if (!$order) {
                return response()->json(['error' => 'Order not found or cannot be updated'], 404);
            }

            $order->update(array_filter($validated));

            return response()->json([
                'message' => 'Order updated successfully',
                'order' => [
                    'id' => $order->order_id,
                    'payment_method' => $order->payment_method,
                    'notes' => $order->notes,
                    'preferred_pickup_date' => $order->preferred_pickup_date,
                    'updated_at' => $order->updated_at,
                ]
            ]);
        } catch (ValidationException $e) {
            return response()->json(['error' => 'Validation failed', 'details' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update order'], 500);
        }
    }

    /**
     * Cancel an order.
     */
    public function cancel(Request $request, $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'reason' => 'required|string|max:500',
            ]);

            $user = Auth::user();
            $student = Student::where('user_id', $user->id)->first();
            
            if (!$student) {
                return response()->json(['error' => 'Student profile not found'], 404);
            }

            $order = Order::where('order_id', $id)
                ->where('student_id', $student->id)
                ->whereIn('status', ['Pending', 'In Progress'])
                ->first();

            if (!$order) {
                return response()->json(['error' => 'Order not found or cannot be cancelled'], 404);
            }

            DB::beginTransaction();

            try {
                // Update order status
                $order->update([
                    'status' => 'Cancelled',
                    'cancelled_at' => now(),
                    'notes' => ($order->notes ? $order->notes . "\n\n" : '') . "Cancelled: " . $validated['reason'],
                ]);

                // Cancel all order items
                $order->orderItems()->update(['status' => 'cancelled']);

                // Cancel pending transactions
                $order->transactions()
                    ->where('status', 'pending')
                    ->update(['status' => 'cancelled']);

                DB::commit();

                return response()->json(['message' => 'Order cancelled successfully']);
            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }

        } catch (ValidationException $e) {
            return response()->json(['error' => 'Validation failed', 'details' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to cancel order'], 500);
        }
    }
}
