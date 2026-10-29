<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PrintOrderController;
use App\Http\Controllers\Api\PrintPricingController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes (no authentication required for testing)
Route::prefix('v1')->group(function () {
    
    // Pricing endpoints
    Route::get('/print-orders/pricing', [PrintPricingController::class, 'index']);
    Route::post('/print-orders/calculate', [PrintPricingController::class, 'calculate']);
    
    // Print Order endpoints
    Route::get('/print-orders', [PrintOrderController::class, 'index']);
    Route::post('/print-orders', [PrintOrderController::class, 'store']);
    Route::get('/print-orders/{id}', [PrintOrderController::class, 'show']);
    Route::patch('/print-orders/{id}/status', [PrintOrderController::class, 'updateStatus']);
    Route::post('/print-orders/{id}/cancel', [PrintOrderController::class, 'cancel']);
    Route::post('/print-orders/{id}/payment', [PrintOrderController::class, 'recordPayment']);
    Route::post('/print-orders/{id}/ready', [PrintOrderController::class, 'markReady']);
    Route::post('/print-orders/{id}/complete', [PrintOrderController::class, 'markCompleted']);
    Route::get('/print-orders/{orderId}/files/{fileId}/download', [PrintOrderController::class, 'downloadFile']);
    
    // Pricing management (Admin only - add middleware later)
    Route::get('/print-orders/pricing/{id}', [PrintPricingController::class, 'show']);
    Route::put('/print-orders/pricing/{id}', [PrintPricingController::class, 'update']);
});

// Protected routes with authentication (uncomment when Sanctum is configured)
/*
Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    
    Route::prefix('print-orders')->group(function () {
        // Student endpoints
        Route::get('/', [PrintOrderController::class, 'index']);
        Route::post('/', [PrintOrderController::class, 'store']);
        Route::get('/{id}', [PrintOrderController::class, 'show']);
        Route::post('/{id}/cancel', [PrintOrderController::class, 'cancel']);
        
        // Staff/Admin endpoints
        Route::middleware('role:Staff,Admin')->group(function () {
            Route::patch('/{id}/status', [PrintOrderController::class, 'updateStatus']);
            Route::post('/{id}/payment', [PrintOrderController::class, 'recordPayment']);
            Route::post('/{id}/ready', [PrintOrderController::class, 'markReady']);
            Route::post('/{id}/complete', [PrintOrderController::class, 'markCompleted']);
            Route::get('/{orderId}/files/{fileId}/download', [PrintOrderController::class, 'downloadFile']);
        });
        
        // Pricing
        Route::get('/pricing', [PrintPricingController::class, 'index']);
        Route::post('/calculate', [PrintPricingController::class, 'calculate']);
        
        // Admin only
        Route::middleware('role:Admin')->group(function () {
            Route::put('/pricing/{id}', [PrintPricingController::class, 'update']);
        });
    });
});
*/
