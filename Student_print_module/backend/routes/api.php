<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PrintOrderController;
use App\Http\Controllers\Api\PrintPricingController;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes (no authentication required)
Route::prefix('v1')->group(function () {
    // Authentication
    Route::post('/login', [AuthController::class, 'login']);
    
    // Public pricing endpoints - students need to see pricing before logging in
    Route::get('/print-orders/pricing', [PrintPricingController::class, 'index']);
    Route::post('/print-orders/calculate', [PrintPricingController::class, 'calculate']);
    
    // Public order endpoints - students access these from student account module
    Route::get('/print-orders', [PrintOrderController::class, 'index']); // View all orders (filtered by student_email)
    Route::post('/print-orders', [PrintOrderController::class, 'store']); // Create order
    Route::get('/print-orders/{id}', [PrintOrderController::class, 'show']); // View single order
    Route::post('/print-orders/{id}/cancel', [PrintOrderController::class, 'cancel']); // Cancel order
    
    // Public file download - staff can download files without auth
    Route::get('/print-orders/{orderId}/files/{fileId}/download', [PrintOrderController::class, 'downloadFile']);
});

// Protected routes with authentication
Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    // Auth endpoints
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    Route::prefix('print-orders')->group(function () {
        // Staff/Admin endpoints for managing orders
        Route::middleware('role:Staff,Admin')->group(function () {
            Route::patch('/{id}/status', [PrintOrderController::class, 'updateStatus']);
            Route::post('/{id}/payment', [PrintOrderController::class, 'recordPayment']);
            Route::post('/{id}/ready', [PrintOrderController::class, 'markReady']);
            Route::post('/{id}/complete', [PrintOrderController::class, 'markCompleted']);
        });
        
        // Admin only - pricing management
        Route::middleware('role:Admin')->group(function () {
            Route::get('/pricing/{id}', [PrintPricingController::class, 'show']);
            Route::put('/pricing/{id}', [PrintPricingController::class, 'update']);
        });
    });
});
