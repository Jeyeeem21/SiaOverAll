<?php

namespace App\Http\Controllers;

use App\Models\Sticker;
use Illuminate\Http\JsonResponse;

class StickerController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function show(Sticker $sticker): JsonResponse
    {
        $this->authorize($sticker->request);

        return response()->json($sticker->load('request'));
    }

    public function verify($serialNumber): JsonResponse
    {
        $sticker = Sticker::where('serial_number', $serialNumber)->firstOrFail();

        if ($sticker->isExpired()) {
            return response()->json([
                'valid' => false,
                'status' => 'expired',
                'message' => 'This sticker has expired',
            ]);
        }

        if ($sticker->status !== 'active') {
            return response()->json([
                'valid' => false,
                'status' => $sticker->status,
                'message' => 'This sticker is not active',
            ]);
        }

        return response()->json([
            'valid' => true,
            'status' => 'active',
            'sticker' => $sticker->load(['request.stickerType']),
        ]);
    }

    private function authorize(StickerRequest $request): void
    {
        $user = auth()->user();
        if ($user->id !== $request->user_id && !in_array($user->role, ['admin', 'staff'])) {
            abort(403);
        }
    }
}
