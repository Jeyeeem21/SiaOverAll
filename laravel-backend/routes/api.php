<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StickerRequestController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Sticker Request Routes
Route::prefix('sticker-requests')->group(function () {
    // Public routes (for users to submit requests)
    Route::post('/', [StickerRequestController::class, 'store']);
    
    // Staff routes (for viewing and managing requests)
    Route::get('/', [StickerRequestController::class, 'index']);
    Route::get('/pending-count', [StickerRequestController::class, 'pendingCount']);
    Route::get('/{id}', [StickerRequestController::class, 'show']);
    Route::put('/{id}', [StickerRequestController::class, 'update']);
    Route::delete('/{id}', [StickerRequestController::class, 'destroy']);
});

// Health check
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'message' => 'API is running']);
});
