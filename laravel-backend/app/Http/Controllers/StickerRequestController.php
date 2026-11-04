<?php

namespace App\Http\Controllers;

use App\Models\StickerRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class StickerRequestController extends Controller
{
    /**
     * Display a listing of all sticker requests (for staff)
     */
    public function index(Request $request)
    {
        $query = StickerRequest::query();

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Sort by date (newest first by default)
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $requests = $query->paginate(20);

        return response()->json($requests);
    }

    /**
     * Store a newly created sticker request
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'plate_number' => 'required|string|max:255',
            'vehicle_type' => 'required|in:car,motorcycle,other',
            'vehicle_model' => 'nullable|string|max:255',
            'vehicle_color' => 'nullable|string|max:255',
            'license' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'official_receipt' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'certificate_of_registration' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Store uploaded files
            $licensePath = $request->file('license')->store('sticker-requests/licenses', 'public');
            $receiptPath = $request->file('official_receipt')->store('sticker-requests/receipts', 'public');
            $certPath = $request->file('certificate_of_registration')->store('sticker-requests/certificates', 'public');

            // Create sticker request
            $stickerRequest = StickerRequest::create([
                'plate_number' => $request->plate_number,
                'vehicle_type' => $request->vehicle_type,
                'vehicle_model' => $request->vehicle_model,
                'vehicle_color' => $request->vehicle_color,
                'license_path' => $licensePath,
                'official_receipt_path' => $receiptPath,
                'certificate_of_registration_path' => $certPath,
                'status' => 'pending',
            ]);

            return response()->json([
                'message' => 'Sticker request submitted successfully',
                'data' => $stickerRequest
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to submit sticker request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified sticker request
     */
    public function show($id)
    {
        $stickerRequest = StickerRequest::findOrFail($id);
        return response()->json($stickerRequest);
    }

    /**
     * Update the specified sticker request (approve/reject)
     */
    public function update(Request $request, $id)
    {
        $stickerRequest = StickerRequest::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $stickerRequest->status = $request->status;

        if ($request->status === 'approved') {
            $stickerRequest->approved_at = now();
            $stickerRequest->rejected_at = null;
            $stickerRequest->rejection_reason = null;
        } elseif ($request->status === 'rejected') {
            $stickerRequest->rejected_at = now();
            $stickerRequest->approved_at = null;
            $stickerRequest->rejection_reason = $request->rejection_reason;
        }

        $stickerRequest->save();

        return response()->json([
            'message' => 'Sticker request updated successfully',
            'data' => $stickerRequest
        ]);
    }

    /**
     * Remove the specified sticker request
     */
    public function destroy($id)
    {
        $stickerRequest = StickerRequest::findOrFail($id);

        // Delete associated files
        if ($stickerRequest->license_path) {
            Storage::disk('public')->delete($stickerRequest->license_path);
        }
        if ($stickerRequest->official_receipt_path) {
            Storage::disk('public')->delete($stickerRequest->official_receipt_path);
        }
        if ($stickerRequest->certificate_of_registration_path) {
            Storage::disk('public')->delete($stickerRequest->certificate_of_registration_path);
        }

        $stickerRequest->delete();

        return response()->json([
            'message' => 'Sticker request deleted successfully'
        ]);
    }

    /**
     * Get pending requests count
     */
    public function pendingCount()
    {
        $count = StickerRequest::pending()->count();
        return response()->json(['count' => $count]);
    }
}
