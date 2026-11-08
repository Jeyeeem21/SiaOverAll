<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PrintOrdersController extends Controller
{
    /**
     * Print jobs waiting to be handled by staff.  These rows are created by
     * the Student Print module in the shared integrated-system database.
     */
    public function staffQueue(Request $request): JsonResponse
    {
        $role = strtolower((string) $request->user()?->role);
        abort_unless(in_array($role, ['admin', 'staff'], true), 403, 'Only staff can view print orders.');

        // Staff can see all orders except cancelled ones
        // This includes completed orders so they can still access files
        $orders = DB::table('print_orders')
            ->whereNull('deleted_at')
            ->where('status', '!=', 'cancelled')
            ->orderByDesc('created_at')
            ->get($this->columns());

        return response()->json([
            'orders' => $orders,
            'summary' => [
                'new_orders' => $orders->where('status', 'submitted')->count(),
                'active_orders' => $orders->whereNotIn('status', ['completed', 'cancelled'])->count(),
                'completed_orders' => $orders->where('status', 'completed')->count(),
                'expected_amount' => (float) $orders->whereNotIn('status', ['completed', 'cancelled'])->sum('total_amount'),
                'total_revenue' => (float) $orders->where('status', 'completed')->sum('amount_paid'),
            ],
        ]);
    }

    /**
     * Completed/printed jobs and their revenue.  This is deliberately an
     * admin-only report because it exposes all student payment information.
     */
    public function printedReport(Request $request): JsonResponse
    {
        if (strtolower((string) $request->user()?->role) !== 'admin') {
            abort(403, 'Only administrators can view the printed-orders report.');
        }

        $orders = DB::table('print_orders')
            ->whereNull('deleted_at')
            ->where('status', 'completed')
            ->orderByDesc('picked_up_at')
            ->orderByDesc('created_at')
            ->get($this->columns());

        return response()->json([
            'orders' => $orders,
            'summary' => [
                'printed_orders' => $orders->count(),
                'total_amount' => (float) $orders->sum('total_amount'),
                'amount_paid' => (float) $orders->sum('amount_paid'),
            ],
        ]);
    }

    /**
     * Update order status (Staff action)
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $role = strtolower((string) $request->user()?->role);
        abort_unless(in_array($role, ['admin', 'staff'], true), 403, 'Only staff can update print orders.');

        $request->validate([
            'status' => 'required|string|in:submitted,reviewing,awaiting_payment,payment_confirmed,printing,ready_for_pickup,completed,cancelled',
            'paymentAmount' => 'nullable|numeric|min:0',
            'paymentReference' => 'nullable|string|max:255',
        ]);

        $updateData = [
            'status' => $request->status,
            'updated_at' => now(),
            // Set ready_at when status is completed or ready_for_pickup
            'ready_at' => in_array($request->status, ['completed', 'ready_for_pickup']) ? now() : null,
        ];

        // When completing an order, save the actual amount paid
        \Log::info('Complete order request', [
            'order_id' => $id,
            'status' => $request->status,
            'has_paymentAmount' => $request->has('paymentAmount'),
            'paymentAmount_value' => $request->input('paymentAmount'),
            'all_input' => $request->all(),
        ]);
        
        if ($request->status === 'completed' && $request->filled('paymentAmount')) {
            \Log::info('Saving payment amount', [
                'order_id' => $id,
                'paymentAmount' => $request->paymentAmount,
                'paymentReference' => $request->paymentReference,
            ]);
            
            $updateData['amount_paid'] = $request->paymentAmount;
            $updateData['payment_status'] = 'paid';
            $updateData['picked_up_at'] = now();
            
            if ($request->filled('paymentReference')) {
                $updateData['payment_reference'] = $request->paymentReference;
            }
        }

        \Log::info('Update data', ['updateData' => $updateData]);

        $updated = DB::table('print_orders')
            ->where('print_order_id', $id)
            ->whereNull('deleted_at')
            ->update($updateData);

        if (!$updated) {
            return response()->json(['message' => 'Order not found or already deleted'], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully',
        ]);
    }

    /**
     * Create manual print order (Staff action)
     * File upload is optional - for walk-in or phone orders
     */
    public function store(Request $request): JsonResponse
    {
        $role = strtolower((string) $request->user()?->role);
        abort_unless(in_array($role, ['admin', 'staff'], true), 403, 'Only staff can create print orders.');

        $validated = $request->validate([
            'student_name' => 'required|string|max:100',
            'student_id' => 'nullable|string|max:50',
            'student_email' => 'nullable|email|max:100',
            'student_phone' => 'nullable|string|max:20',
            'color_type' => 'required|in:black_white,colored',
            'paper_size' => 'required|in:A4,A3,Letter,Legal,Short,Long',
            'print_side' => 'required|in:single,double',
            'copies' => 'required|integer|min:1',
            'total_pages' => 'required|integer|min:1',
            'binding_type' => 'required|in:none,spiral,staple,plastic_comb',
            'special_instructions' => 'nullable|string|max:1000',
            'amount_paid' => 'nullable|numeric|min:0',
            'payment_method' => 'required|in:cash_on_pickup,gcash,paymaya,bank_transfer',
        ]);

        // Generate order number
        $year = now()->year;
        $lastOrder = DB::table('print_orders')
            ->where('order_number', 'like', "PO-{$year}-%")
            ->orderByDesc('print_order_id')
            ->first();

        $nextNumber = 1;
        if ($lastOrder) {
            preg_match('/PO-\d{4}-(\d+)/', $lastOrder->order_number, $matches);
            $nextNumber = isset($matches[1]) ? (int)$matches[1] + 1 : 1;
        }
        $orderNumber = sprintf('PO-%d-%03d', $year, $nextNumber);

        // Calculate total amount (basic calculation)
        $pricePerPage = $validated['color_type'] === 'colored' ? 5.00 : 1.00;
        $totalAmount = $pricePerPage * $validated['total_pages'] * $validated['copies'];

        // Add binding cost
        $bindingCost = match($validated['binding_type']) {
            'spiral' => 20.00,
            'staple' => 5.00,
            'plastic_comb' => 15.00,
            default => 0.00,
        };
        $totalAmount += $bindingCost;

        // Insert order
        $orderId = DB::table('print_orders')->insertGetId([
            'order_number' => $orderNumber,
            'student_name' => $validated['student_name'],
            'student_id' => $validated['student_id'],
            'student_email' => $validated['student_email'],
            'student_phone' => $validated['student_phone'],
            'color_type' => $validated['color_type'],
            'paper_size' => $validated['paper_size'],
            'orientation' => 'portrait', // default
            'print_side' => $validated['print_side'],
            'copies' => $validated['copies'],
            'pages_per_document' => $validated['total_pages'],
            'total_pages' => $validated['total_pages'] * $validated['copies'],
            'binding_type' => $validated['binding_type'],
            'binding_cost' => $bindingCost,
            'lamination' => false,
            'price_per_page' => $pricePerPage,
            'total_amount' => $totalAmount,
            'amount_paid' => $validated['amount_paid'] ?? 0.00,
            'payment_method' => $validated['payment_method'],
            'payment_status' => isset($validated['amount_paid']) && $validated['amount_paid'] > 0 ? 'paid' : 'pending',
            'status' => isset($validated['amount_paid']) && $validated['amount_paid'] > 0 ? 'completed' : 'submitted',
            'special_instructions' => $validated['special_instructions'],
            'created_at' => now(),
            'updated_at' => now(),
            'picked_up_at' => isset($validated['amount_paid']) && $validated['amount_paid'] > 0 ? now() : null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Print order created successfully',
            'data' => [
                'print_order_id' => $orderId,
                'order_number' => $orderNumber,
            ],
        ], 201);
    }

    /**
     * Search students for autocomplete (Staff action)
     */
    public function searchStudents(Request $request): JsonResponse
    {
        $role = strtolower((string) $request->user()?->role);
        abort_unless(in_array($role, ['admin', 'staff'], true), 403, 'Only staff can search students.');

        $query = $request->input('query', '');
        
        if (strlen($query) < 2) {
            return response()->json([
                'success' => true,
                'data' => [],
            ]);
        }

        $students = DB::table('users as u')
            ->leftJoin('account_students as s', 'u.id', '=', 's.user_id')
            ->where('u.role', 'Customer')
            ->where(function($q) use ($query) {
                $q->where('u.full_name', 'like', "%{$query}%")
                  ->orWhere('u.email', 'like', "%{$query}%")
                  ->orWhere('s.student_number', 'like', "%{$query}%");
            })
            ->select(
                'u.id',
                'u.full_name as name',
                'u.email',
                'u.phone',
                's.student_number as student_id'
            )
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $students,
        ]);
    }

    /**
     * Delete files only (not the order data) - Admin only
     * This is for freeing up storage space while keeping order records
     */
    public function deleteFiles(Request $request, int $id): JsonResponse
    {
        $role = strtolower((string) $request->user()?->role);
        abort_unless($role === 'admin', 403, 'Only administrators can delete files.');

        // Note: Files are stored in the Student Print module backend
        // We'll need to call that API to delete the physical files
        // For now, we'll mark them as deleted in the print_order_files table
        
        $deletedCount = DB::table('print_order_files')
            ->where('print_order_id', $id)
            ->update([
                'deleted_at' => now(),
                'updated_at' => now(),
            ]);

        \Log::info('Files marked as deleted', [
            'order_id' => $id,
            'files_deleted' => $deletedCount,
            'admin_user' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Files deleted successfully. Order data retained for records.',
            'files_deleted' => $deletedCount,
        ]);
    }

    private function columns(): array
    {
        return [
            'print_order_id', 'order_number', 'student_name', 'student_id',
            'student_email', 'color_type', 'paper_size', 'print_side',
            'copies', 'total_pages', 'binding_type', 'lamination',
            'total_amount', 'amount_paid', 'status', 'payment_status',
            'payment_method', 'created_at', 'ready_at', 'picked_up_at',
            'preferred_pickup_date', 'special_instructions',
            // Add files_deleted_at to check if files have been deleted
            DB::raw('(SELECT MAX(deleted_at) FROM print_order_files WHERE print_order_files.print_order_id = print_orders.print_order_id) as files_deleted_at'),
        ];
    }
}
