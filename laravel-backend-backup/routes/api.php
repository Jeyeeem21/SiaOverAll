<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StickerRequestController;
use App\Http\Controllers\StickerTypeController;
use App\Http\Controllers\StickerController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Public routes
Route::get('/sticker-types', [StickerTypeController::class, 'index']);
Route::get('/stickers/verify/{serialNumber}', [StickerController::class, 'verify']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Sticker Requests
    Route::get('/sticker-requests', [StickerRequestController::class, 'index']);
    Route::post('/sticker-requests', [StickerRequestController::class, 'store']);
    Route::get('/sticker-requests/{stickerRequest}', [StickerRequestController::class, 'show']);
    Route::post('/sticker-requests/{stickerRequest}/upload', [StickerRequestController::class, 'uploadAttachment']);
    Route::post('/sticker-requests/{stickerRequest}/cancel', [StickerRequestController::class, 'cancel']);
    
    // Sticker details
    Route::get('/stickers/{sticker}', [StickerController::class, 'show']);
    Route::post('/stickers/{sticker}/reprint', [StickerRequestController::class, 'reprint']);
});

// Staff/Admin routes
Route::middleware('auth:sanctum', 'staff')->group(function () {
    Route::post('/sticker-requests/{stickerRequest}/approve', [StickerRequestController::class, 'approve']);
    Route::post('/sticker-requests/{stickerRequest}/reject', [StickerRequestController::class, 'reject']);
    Route::post('/sticker-requests/{stickerRequest}/mark-paid', [StickerRequestController::class, 'markAsPaid']);
    Route::post('/sticker-requests/{stickerRequest}/print', [StickerRequestController::class, 'markAsPrinted']);
    Route::post('/sticker-requests/{stickerRequest}/release', [StickerRequestController::class, 'release']);
});

// Admin only routes
Route::middleware('auth:sanctum', 'admin')->group(function () {
    Route::post('/sticker-types', [StickerTypeController::class, 'store']);
    Route::get('/sticker-types/{stickerType}', [StickerTypeController::class, 'show']);
    Route::put('/sticker-types/{stickerType}', [StickerTypeController::class, 'update']);
    Route::delete('/sticker-types/{stickerType}', [StickerTypeController::class, 'destroy']);
});
