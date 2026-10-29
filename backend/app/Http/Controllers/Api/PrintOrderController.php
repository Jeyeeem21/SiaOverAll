<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PrintOrder;
use App\Models\PrintOrderFile;
use App\Models\PrintOrderStatusHistory;
use App\Models\PrintPricingConfig;
use App\Http\Requests\StorePrintOrderRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PrintOrderController extends Controller
{
    /**
     * Get all print orders with filtering
     */
    public function index(Request $request): JsonResponse
    {
        $query = PrintOrder::with(['files'])->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->has('student_email')) {
            $query->where('student_email', $request->student_email);
        }

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $perPage = $request->get('per_page', 15);
        $orders = $query->paginate($perPage);

        // Transform response
        $transformed = $orders->map(function ($order) {
            return [
                'print_order_id' => $order->print_order_id,
                'order_number' => $order->order_number,
                'student_name' => $order->student_name,
                'student_email' => $order->student_email,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'total_amount' => number_format($order->total_amount, 2),
                'preferred_pickup_date' => $order->preferred_pickup_date?->format('Y-m-d H:i'),
                'created_at' => $order->created_at->format('Y-m-d H:i:s'),
                'files_count' => $order->files->count(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'current_page' => $orders->currentPage(),
                'data' => $transformed,
                'total' => $orders->total(),
                'per_page' => $orders->perPage(),
                'last_page' => $orders->lastPage(),
            ],
        ]);
    }

    /**
     * Create new print order
     */
    public function store(Request $request): JsonResponse
    {
        // Validate request
        $validated = $request->validate([
            'student_id' => 'nullable|string|max:50',
            'student_name' => 'required|string|max:100',
            'student_email' => 'required|email|max:100',
            'student_phone' => 'nullable|string|max:20',
            'color_type' => 'required|in:black_white,colored',
            'paper_size' => 'required|in:A4,A3,Letter,Legal,Short,Long',
            'orientation' => 'required|in:portrait,landscape',
            'print_side' => 'required|in:single,double',
            'copies' => 'required|integer|min:1|max:1000',
            'pages_per_document' => 'required|integer|min:1',
            'binding_type' => 'required|in:none,spiral,staple,plastic_comb',
            'lamination' => 'required|boolean',
            'lamination_type' => 'nullable|in:none,glossy,matte',
            'lamination_item' => 'required_if:lamination,1|string|max:100',
            'lamination_quantity' => 'required_if:lamination,1|integer|min:1|max:100',
            'payment_method' => 'required|in:cash_on_pickup,upload_proof',
            'payment_proof' => 'required_if:payment_method,upload_proof|file|mimes:jpg,jpeg,png,pdf|max:5120', // 5MB
            'preferred_pickup_date' => 'nullable|date_format:Y-m-d\TH:i|after:now',
            'special_instructions' => 'nullable|string|max:1000',
            'files' => 'required|array|min:1|max:5',
            'files.*' => 'required|file|mimes:pdf,doc,docx,txt|max:10240', // 10MB
        ]);

        try {
            DB::beginTransaction();

            // Calculate pricing
            $pricing = $this->calculatePricing($validated);

            // Generate order number
            $orderNumber = $this->generateOrderNumber();

            // Handle payment proof upload if provided
            $paymentProofData = [];
            if ($validated['payment_method'] === 'upload_proof' && $request->hasFile('payment_proof')) {
                $paymentProofData = $this->handlePaymentProofUpload($request->file('payment_proof'));
            }

            // Create print order
            $order = PrintOrder::create([
                'order_number' => $orderNumber,
                'student_id' => $validated['student_id'] ?? null,
                'student_name' => $validated['student_name'],
                'student_email' => $validated['student_email'],
                'student_phone' => $validated['student_phone'] ?? null,
                'color_type' => $validated['color_type'],
                'paper_size' => $validated['paper_size'],
                'orientation' => $validated['orientation'],
                'print_side' => $validated['print_side'],
                'copies' => $validated['copies'],
                'pages_per_document' => $validated['pages_per_document'],
                'total_pages' => $validated['copies'] * $validated['pages_per_document'],
                'binding_type' => $validated['binding_type'],
                'lamination' => $validated['lamination'],
                'lamination_type' => $validated['lamination'] ? ($validated['lamination_type'] ?? 'none') : 'none',
                'lamination_item' => $validated['lamination'] ? ($validated['lamination_item'] ?? null) : null,
                'lamination_quantity' => $validated['lamination'] ? ($validated['lamination_quantity'] ?? 1) : 0,
                'price_per_page' => $pricing['price_per_page'],
                'binding_cost' => $pricing['binding_cost'],
                'lamination_cost' => $pricing['lamination_cost'],
                'total_amount' => $pricing['total_amount'],
                'status' => 'submitted',
                'payment_status' => 'pending',
                'payment_method' => $validated['payment_method'],
                'payment_proof_file' => $paymentProofData['file_path'] ?? null,
                'payment_proof_original_name' => $paymentProofData['original_name'] ?? null,
                'payment_proof_uploaded_at' => $paymentProofData['uploaded_at'] ?? null,
                'preferred_pickup_date' => $validated['preferred_pickup_date'] ?? null,
                'special_instructions' => $validated['special_instructions'] ?? null,
            ]);

            // Handle file uploads
            $files = [];
            foreach ($request->file('files') as $file) {
                $fileData = $this->handleFileUpload($file, $order->print_order_id);
                $files[] = PrintOrderFile::create($fileData);
            }

            // Create status history
            PrintOrderStatusHistory::create([
                'print_order_id' => $order->print_order_id,
                'from_status' => null,
                'to_status' => 'submitted',
                'notes' => 'Order created by student',
                'changed_by_name' => $validated['student_name'],
                'changed_by' => auth()->id(),
            ]);

            DB::commit();

            // Load relationships for response
            $order->load('files');

            return response()->json([
                'success' => true,
                'message' => 'Print order created successfully',
                'data' => [
                    'print_order_id' => $order->print_order_id,
                    'order_number' => $order->order_number,
                    'student_name' => $order->student_name,
                    'status' => $order->status,
                    'total_amount' => number_format($order->total_amount, 2),
                    'created_at' => $order->created_at->format('Y-m-d H:i:s'),
                    'files' => $order->files->map(function ($file) {
                        return [
                            'file_id' => $file->file_id,
                            'original_filename' => $file->original_filename,
                            'file_size' => $file->getHumanFileSize(),
                            'page_count' => $file->page_count,
                            'status' => $file->status,
                        ];
                    }),
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create print order: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get single print order
     */
    public function show($id): JsonResponse
    {
        $order = PrintOrder::with(['files', 'statusHistory'])->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Print order not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'print_order_id' => $order->print_order_id,
                'order_number' => $order->order_number,
                'student_id' => $order->student_id,
                'student_name' => $order->student_name,
                'student_email' => $order->student_email,
                'student_phone' => $order->student_phone,
                'printing_options' => [
                    'color_type' => $order->color_type,
                    'paper_size' => $order->paper_size,
                    'orientation' => $order->orientation,
                    'print_side' => $order->print_side,
                    'copies' => $order->copies,
                    'pages_per_document' => $order->pages_per_document,
                    'total_pages' => $order->total_pages,
                    'binding_type' => $order->binding_type,
                    'lamination' => $order->lamination,
                    'lamination_type' => $order->lamination_type,
                ],
                'pricing' => [
                    'price_per_page' => number_format($order->price_per_page, 2),
                    'binding_cost' => number_format($order->binding_cost, 2),
                    'lamination_cost' => number_format($order->lamination_cost, 2),
                    'total_amount' => number_format($order->total_amount, 2),
                ],
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'payment_method' => $order->payment_method,
                'payment_proof_file' => $order->payment_proof_file,
                'payment_proof_original_name' => $order->payment_proof_original_name,
                'payment_proof_uploaded_at' => $order->payment_proof_uploaded_at?->format('Y-m-d H:i:s'),
                'amount_paid' => number_format($order->amount_paid, 2),
                'payment_reference' => $order->payment_reference,
                'preferred_pickup_date' => $order->preferred_pickup_date?->format('Y-m-d H:i'),
                'special_instructions' => $order->special_instructions,
                'staff_notes' => $order->staff_notes,
                'created_at' => $order->created_at->format('Y-m-d H:i:s'),
                'files' => $order->files->map(function ($file) use ($order) {
                    return [
                        'file_id' => $file->file_id,
                        'original_filename' => $file->original_filename,
                        'file_type' => $file->file_type,
                        'file_size' => $file->getHumanFileSize(),
                        'page_count' => $file->page_count,
                        'status' => $file->status,
                        'download_url' => "/api/v1/print-orders/{$order->print_order_id}/files/{$file->file_id}/download",
                    ];
                }),
                'status_history' => $order->statusHistory->map(function ($history) {
                    return [
                        'from_status' => $history->from_status,
                        'to_status' => $history->to_status,
                        'notes' => $history->notes,
                        'changed_by_name' => $history->changed_by_name,
                        'created_at' => $history->created_at->format('Y-m-d H:i:s'),
                    ];
                }),
            ],
        ]);
    }

    /**
     * Update print order status
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:submitted,reviewing,awaiting_payment,payment_confirmed,printing,ready_for_pickup,completed,cancelled',
            'notes' => 'nullable|string|max:500',
        ]);

        $order = PrintOrder::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Print order not found',
            ], 404);
        }

        $oldStatus = $order->status;
        $order->status = $validated['status'];
        
        // Update ready_at timestamp if status is ready_for_pickup
        if ($validated['status'] === 'ready_for_pickup' && !$order->ready_at) {
            $order->ready_at = now();
        }

        $order->save();

        // Record status change in history
        PrintOrderStatusHistory::create([
            'print_order_id' => $order->print_order_id,
            'from_status' => $oldStatus,
            'to_status' => $validated['status'],
            'notes' => $validated['notes'] ?? null,
            'changed_by_name' => auth()->user()->full_name ?? 'System',
            'changed_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Print order status updated successfully',
            'data' => [
                'print_order_id' => $order->print_order_id,
                'status' => $order->status,
                'updated_at' => $order->updated_at->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    /**
     * Cancel print order
     */
    public function cancel(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'cancellation_reason' => 'required|string|max:500',
        ]);

        $order = PrintOrder::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Print order not found',
            ], 404);
        }

        if (!$order->canCancel()) {
            return response()->json([
                'success' => false,
                'message' => 'This order cannot be cancelled',
            ], 400);
        }

        $oldStatus = $order->status;
        $order->status = 'cancelled';
        $order->cancellation_reason = $validated['cancellation_reason'];
        $order->cancelled_by = auth()->id();
        $order->cancelled_at = now();
        $order->save();

        // Record status change
        PrintOrderStatusHistory::create([
            'print_order_id' => $order->print_order_id,
            'from_status' => $oldStatus,
            'to_status' => 'cancelled',
            'notes' => 'Cancelled: ' . $validated['cancellation_reason'],
            'changed_by_name' => auth()->user()->full_name ?? 'System',
            'changed_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Print order cancelled successfully',
            'data' => [
                'print_order_id' => $order->print_order_id,
                'status' => $order->status,
                'cancelled_at' => $order->cancelled_at->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    /**
     * Record payment
     */
    public function recordPayment(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_reference' => 'nullable|string|max:100',
            'payment_date' => 'nullable|date',
        ]);

        $order = PrintOrder::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Print order not found',
            ], 404);
        }

        $order->amount_paid += $validated['amount'];
        $order->payment_reference = $validated['payment_reference'] ?? null;
        $order->payment_date = $validated['payment_date'] ?? now();

        // Update payment status
        if ($order->amount_paid >= $order->total_amount) {
            $order->payment_status = 'paid';
            $order->status = 'payment_confirmed';
        } else {
            $order->payment_status = 'partial';
        }

        $order->save();

        // Record status change if moved to payment_confirmed
        if ($order->status === 'payment_confirmed') {
            PrintOrderStatusHistory::create([
                'print_order_id' => $order->print_order_id,
                'from_status' => 'awaiting_payment',
                'to_status' => 'payment_confirmed',
                'notes' => 'Payment confirmed',
                'changed_by_name' => auth()->user()->full_name ?? 'System',
                'changed_by' => auth()->id(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Payment recorded successfully',
            'data' => [
                'print_order_id' => $order->print_order_id,
                'payment_status' => $order->payment_status,
                'amount_paid' => number_format($order->amount_paid, 2),
                'status' => $order->status,
            ],
        ]);
    }

    /**
     * Mark as ready for pickup
     */
    public function markReady($id): JsonResponse
    {
        $order = PrintOrder::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Print order not found',
            ], 404);
        }

        $oldStatus = $order->status;
        $order->status = 'ready_for_pickup';
        $order->ready_at = now();
        $order->save();

        PrintOrderStatusHistory::create([
            'print_order_id' => $order->print_order_id,
            'from_status' => $oldStatus,
            'to_status' => 'ready_for_pickup',
            'notes' => 'Order is ready for pickup',
            'changed_by_name' => auth()->user()->full_name ?? 'System',
            'changed_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Order marked as ready for pickup',
            'data' => [
                'print_order_id' => $order->print_order_id,
                'status' => $order->status,
                'ready_at' => $order->ready_at->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    /**
     * Mark as completed
     */
    public function markCompleted($id): JsonResponse
    {
        $order = PrintOrder::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Print order not found',
            ], 404);
        }

        $oldStatus = $order->status;
        $order->status = 'completed';
        $order->picked_up_at = now();
        $order->save();

        PrintOrderStatusHistory::create([
            'print_order_id' => $order->print_order_id,
            'from_status' => $oldStatus,
            'to_status' => 'completed',
            'notes' => 'Order picked up by student',
            'changed_by_name' => auth()->user()->full_name ?? 'System',
            'changed_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Order marked as completed',
            'data' => [
                'print_order_id' => $order->print_order_id,
                'status' => $order->status,
                'picked_up_at' => $order->picked_up_at->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    /**
     * Download file
     */
    public function downloadFile($orderId, $fileId): \Symfony\Component\HttpFoundation\BinaryFileResponse|JsonResponse
    {
        $order = PrintOrder::find($orderId);
        
        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Print order not found',
            ], 404);
        }

        if (!$order->canDownloadFiles()) {
            return response()->json([
                'success' => false,
                'message' => 'Files cannot be downloaded at this stage',
            ], 403);
        }

        $file = PrintOrderFile::where('file_id', $fileId)
            ->where('print_order_id', $orderId)
            ->first();

        if (!$file) {
            return response()->json([
                'success' => false,
                'message' => 'File not found',
            ], 404);
        }

        // Increment download count
        $file->incrementDownloadCount(auth()->id());

        return response()->download(storage_path('app/' . $file->file_path), $file->original_filename);
    }

    /**
     * Calculate pricing
     */
    private function calculatePricing(array $data): array
    {
        $config = PrintPricingConfig::getPrice(
            $data['color_type'],
            $data['paper_size'],
            $data['print_side']
        );

        if (!$config) {
            throw new \Exception('Pricing configuration not found');
        }

        $totalPages = $data['copies'] * $data['pages_per_document'];
        $pagesCost = $totalPages * $config->price_per_page;

        $bindingCost = $data['binding_type'] !== 'none' 
            ? $config->getBindingPrice($data['binding_type']) 
            : 0;

        // Only calculate lamination cost if lamination is true and type is not 'none'
        $laminationCost = 0;
        if ($data['lamination'] && isset($data['lamination_type']) && $data['lamination_type'] !== 'none') {
            $laminationCost = $config->getLaminationPrice($data['lamination_type']);
        }

        $totalAmount = $pagesCost + $bindingCost + $laminationCost;

        return [
            'price_per_page' => $config->price_per_page,
            'binding_cost' => $bindingCost,
            'lamination_cost' => $laminationCost,
            'total_amount' => $totalAmount,
        ];
    }

    /**
     * Handle file upload
     */
    private function handleFileUpload($file, $orderId): array
    {
        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $mimeType = $file->getMimeType();
        $size = $file->getSize();

        // Generate unique filename
        $storedName = 'print_order_' . $orderId . '_' . Str::random(20) . '.' . $extension;
        
        // Store file
        $path = $file->storeAs('print_orders/' . $orderId, $storedName, 'private');

        // Calculate file hash
        $hash = hash_file('sha256', $file->getRealPath());

        // Try to get page count for PDF files
        $pageCount = null;
        if ($extension === 'pdf') {
            try {
                // This is a basic implementation - you might want to use a PDF library
                $pageCount = $this->getPdfPageCount(storage_path('app/' . $path));
            } catch (\Exception $e) {
                // Ignore if we can't get page count
            }
        }

        return [
            'print_order_id' => $orderId,
            'original_filename' => $originalName,
            'stored_filename' => $storedName,
            'file_path' => $path,
            'file_type' => $extension,
            'mime_type' => $mimeType,
            'file_size' => $size,
            'page_count' => $pageCount,
            'file_hash' => $hash,
            'status' => 'uploaded',
        ];
    }

    /**
     * Get PDF page count (basic implementation)
     */
    private function getPdfPageCount($path): ?int
    {
        try {
            $content = file_get_contents($path);
            $pattern = "/\/Count\s+(\d+)/";
            preg_match($pattern, $content, $matches);
            return isset($matches[1]) ? (int)$matches[1] : null;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Generate order number
     */
    private function generateOrderNumber(): string
    {
        $year = date('Y');
        $lastOrder = PrintOrder::whereYear('created_at', $year)
            ->orderBy('print_order_id', 'desc')
            ->first();

        $number = $lastOrder ? ((int)substr($lastOrder->order_number, -3)) + 1 : 1;
        
        return sprintf('PO-%s-%03d', $year, $number);
    }

    /**
     * Handle payment proof upload
     */
    private function handlePaymentProofUpload($file): array
    {
        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        
        // Generate unique filename
        $storedName = 'payment_proof_' . time() . '_' . Str::random(10) . '.' . $extension;
        
        // Store file in payment_proofs directory
        $path = $file->storeAs('payment_proofs', $storedName, 'private');
        
        return [
            'file_path' => $path,
            'original_name' => $originalName,
            'uploaded_at' => now(),
        ];
    }
}
