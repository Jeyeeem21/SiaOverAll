<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\StaffVerificationController;
use App\Http\Controllers\AdminStudentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Public routes (throttled)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me/profile', [StudentController::class, 'updateProfile']);
    Route::post('/verifications', [StudentController::class, 'uploadVerification']);
    Route::get('/verifications/{id}/file', [StudentController::class, 'getVerificationFile'])->where('id', '[0-9]+');
    Route::get('/notifications', [StudentController::class, 'notifications']);
    Route::post('/notifications/read', [StudentController::class, 'markNotificationsAsRead']);
    Route::get('/me/orders', [StudentController::class, 'orders']);
    
    // Order management routes
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show'])->where('id', '[0-9]+');
    Route::put('/orders/{id}', [OrderController::class, 'update'])->where('id', '[0-9]+');
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel'])->where('id', '[0-9]+');
});

// Staff/Admin routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/staff/verifications', [StaffVerificationController::class, 'index']);
    Route::post('/staff/verifications/{id}/approve', [StaffVerificationController::class, 'approve'])->where('id', '[0-9]+');
    Route::post('/staff/verifications/{id}/reject', [StaffVerificationController::class, 'reject'])->where('id', '[0-9]+');
});

// Admin only routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/admin/students/{id}/suspend', [AdminStudentController::class, 'suspend'])->where('id', '[0-9]+');
    Route::post('/admin/students/{id}/reinstate', [AdminStudentController::class, 'reinstate'])->where('id', '[0-9]+');
});