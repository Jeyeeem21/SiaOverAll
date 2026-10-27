<?php

use App\Http\Controllers\Api\StaffIdCardController;
use App\Http\Controllers\Api\StaffInformationController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\StudentDocumentController;
use App\Http\Controllers\Api\StudentIdCardController;
use App\Http\Controllers\Api\StudentPhotoController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Mock user endpoint for testing (returns fake user based on role query parameter)
Route::get('/user', function (Request $request) {
    if ($user = $request->user()) {
        return $user;
    }
    
    // Get role from query parameter or default to Admin
    $role = $request->query('role', 'Admin');
    
    // Return mock user based on role
    if ($role === 'Student') {
        return response()->json([
            'id' => 100,
            'full_name' => 'John Doe',
            'email' => 'student@test.com',
            'role' => 'Student',
            'status' => 'active',
        ]);
    }
    
    if ($role === 'Staff') {
        return response()->json([
            'id' => 2,
            'full_name' => 'Jane Smith',
            'email' => 'staff@test.com',
            'role' => 'Staff',
            'status' => 'active',
        ]);
    }
    
    // Default to Admin
    return response()->json([
        'id' => 1,
        'full_name' => 'Test Admin',
        'email' => 'admin@test.com',
        'role' => 'Admin',
        'status' => 'active',
    ]);
});

// Test endpoint to verify CORS and API connectivity
Route::get('/test', function () {
    return response()->json([
        'message' => 'API is working!',
        'timestamp' => now()->toDateTimeString(),
        'cors' => 'enabled',
    ]);
});

// Students API - temporarily public for testing
// TODO: Move back to auth:sanctum middleware in production
Route::apiResource('students', StudentController::class)->only(['index', 'store', 'show', 'update', 'destroy']);

// Student Photos API
Route::post('students/{student}/photo', [StudentPhotoController::class, 'upload']);
Route::delete('students/{student}/photo', [StudentPhotoController::class, 'delete']);
Route::get('students/{student}/photo', [StudentPhotoController::class, 'show']);
Route::get('students/{student}/photo/download', [StudentPhotoController::class, 'download']);

// Student Documents API
Route::get('students/{student}/documents', [StudentDocumentController::class, 'index']);
Route::post('students/{student}/documents', [StudentDocumentController::class, 'store']);
Route::get('students/{student}/documents/{document}', [StudentDocumentController::class, 'show']);
Route::get('students/{student}/documents/{document}/download', [StudentDocumentController::class, 'download']);
Route::delete('students/{student}/documents/{document}', [StudentDocumentController::class, 'destroy']);

// Student ID Cards API

// Students can request their own ID cards and check status
Route::post('students/{student}/id-card-request', [StudentIdCardController::class, 'request']);
Route::get('students/{student}/id-status', [StudentIdCardController::class, 'getStudentStatus']);

// Staff and Admin only - manage ID cards
Route::middleware('role:Admin,Staff')->group(function () {
    Route::get('student-id-cards', [StudentIdCardController::class, 'index']);
    Route::get('student-id-cards/batch-pdf', [StudentIdCardController::class, 'generateBatchPdf']);
    Route::get('student-id-cards/{card}', [StudentIdCardController::class, 'show']);
    Route::get('student-id-cards/{card}/preview', [StudentIdCardController::class, 'preview']);
    Route::get('student-id-cards/{card}/pdf', [StudentIdCardController::class, 'generatePdf']);
    Route::patch('student-id-cards/{card}/status', [StudentIdCardController::class, 'updateStatus']);
    Route::post('student-id-cards/{card}/release', [StudentIdCardController::class, 'release']);
    Route::delete('student-id-cards/{card}', [StudentIdCardController::class, 'destroy']);
});
Route::get('students/{student}/id-status', [StudentIdCardController::class, 'getStudentStatus']);

// Staff API - temporarily public for testing
Route::apiResource('staff', StaffInformationController::class);
Route::get('staff-id-cards', [StaffIdCardController::class, 'index']);
Route::post('staff/{staff}/id-card-request', [StaffIdCardController::class, 'request']);
Route::patch('staff-id-cards/{card}/status', [StaffIdCardController::class, 'updateStatus']);
Route::post('staff-id-cards/{card}/release', [StaffIdCardController::class, 'release']);

Route::middleware('auth:sanctum')->group(function (): void {
    // Protected routes (currently empty, all endpoints are public for testing)
});
