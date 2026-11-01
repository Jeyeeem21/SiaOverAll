<?php

namespace App\Http\Controllers;

use App\Models\StickerType;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class StickerTypeController extends Controller
{
    public function index(): JsonResponse
    {
        $types = StickerType::all();
        return response()->json($types);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'name' => 'required|string|unique:sticker_types|max:100',
            'slug' => 'required|string|unique:sticker_types|max:100',
            'description' => 'required|string|max:1000',
            'color' => 'required|string|regex:/^#[0-9A-F]{6}$/i',
            'price' => 'required|numeric|min:0',
            'validity_days' => 'required|integer|min:1',
            'requires_vehicle_details' => 'required|boolean',
            'requires_approval' => 'required|boolean',
            'allowed_file_types' => 'nullable|array',
        ]);

        $stickerType = StickerType::create($validated);

        return response()->json($stickerType, 201);
    }

    public function show(StickerType $stickerType): JsonResponse
    {
        return response()->json($stickerType);
    }

    public function update(Request $request, StickerType $stickerType): JsonResponse
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'name' => 'sometimes|string|unique:sticker_types,name,' . $stickerType->id . '|max:100',
            'description' => 'sometimes|string|max:1000',
            'color' => 'sometimes|string|regex:/^#[0-9A-F]{6}$/i',
            'price' => 'sometimes|numeric|min:0',
            'validity_days' => 'sometimes|integer|min:1',
            'requires_vehicle_details' => 'sometimes|boolean',
            'requires_approval' => 'sometimes|boolean',
            'allowed_file_types' => 'sometimes|array',
        ]);

        $stickerType->update($validated);

        return response()->json($stickerType);
    }

    public function destroy(StickerType $stickerType): JsonResponse
    {
        $this->authorizeAdmin();

        $stickerType->delete();

        return response()->json(null, 204);
    }

    private function authorizeAdmin(): void
    {
        $user = auth()->user();
        if ($user->role !== 'admin') {
            abort(403);
        }
    }
}
