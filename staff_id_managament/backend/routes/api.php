<?php

use App\Http\Controllers\Api\StaffIdCardController;
use App\Http\Controllers\Api\StaffInformationController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\StudentDocumentController;
use App\Http\Controllers\Api\StudentIdCardController;
use App\Http\Controllers\Api\StudentPhotoController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Authentication routes (public)
Route::post('login', [AuthController::class, 'login'])->name('login');

// Test endpoint to verify CORS and API connectivity
Route::get('/test', function () {
    return response()->json([
        'message' => 'Staff Module API is working!',
        'timestamp' => now()->toDateTimeString(),
        'cors' => 'enabled',
    ]);
});

// Public routes for ID card preview (no auth required for iframes)
Route::get('student-id-cards/{card}/preview', [StudentIdCardController::class, 'preview']);
Route::get('student-id-cards/{card}/pdf', [StudentIdCardController::class, 'generatePdf']);

// Public routes for student portal (cross-module access)
// Students can search by student_number to find their record
Route::get('public/students/search', [StudentController::class, 'searchByStudentNumber']);
Route::get('public/students/{studentNumber}/id-status', [StudentIdCardController::class, 'getPublicStudentStatus']);
Route::get('public/students/{studentNumber}/id-card-requirements', [StudentIdCardController::class, 'getPublicRequestRequirements']);
Route::post('public/students/{studentNumber}/id-card-request', [StudentIdCardController::class, 'publicRequest']);
Route::post('public/students/{studentNumber}/update-signature', [StudentController::class, 'updateSignature']);

// Protected routes requiring authentication
Route::middleware('auth:sanctum')->group(function () {
    // Auth endpoints
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('user', [AuthController::class, 'user']);

    // Students API
    Route::apiResource('students', StudentController::class)->only(['index', 'store', 'show', 'update', 'destroy']);

    // Student Photos API
    Route::post('students/{student}/photo', [StudentPhotoController::class, 'upload']);
    Route::delete('students/{student}/photo', [StudentPhotoController::class, 'delete']);
    Route::get('students/{student}/photo', [StudentPhotoController::class, 'show']);
    Route::get('students/{student}/photo/download', [StudentPhotoController::class, 'download']);

    // Student Signature API
    Route::post('students/{student}/signature', [StudentController::class, 'uploadSignature']);
    Route::delete('students/{student}/signature', [StudentController::class, 'deleteSignature']);

    // Student Documents API
    Route::get('students/{student}/documents', [StudentDocumentController::class, 'index']);
    Route::post('students/{student}/documents', [StudentDocumentController::class, 'store']);
    Route::get('students/{student}/documents/{document}', [StudentDocumentController::class, 'show']);
    Route::get('students/{student}/documents/{document}/download', [StudentDocumentController::class, 'download']);
    Route::delete('students/{student}/documents/{document}', [StudentDocumentController::class, 'destroy']);

    // Student ID Cards API - Students can request their own ID cards
    Route::post('students/{student}/id-card-request', [StudentIdCardController::class, 'request']);
    Route::get('students/{student}/id-status', [StudentIdCardController::class, 'getStudentStatus']);

    // Staff and Admin only - manage ID cards
    Route::middleware('role:Admin,Staff')->group(function () {
        Route::get('student-id-cards', [StudentIdCardController::class, 'index']);
        Route::get('student-id-cards/batch-pdf', [StudentIdCardController::class, 'generateBatchPdf']);
        Route::get('student-id-cards/{card}', [StudentIdCardController::class, 'show']);
        Route::patch('student-id-cards/{card}/status', [StudentIdCardController::class, 'updateStatus']);
        Route::post('student-id-cards/{card}/release', [StudentIdCardController::class, 'release']);
        Route::delete('student-id-cards/{card}', [StudentIdCardController::class, 'destroy']);
    });

    // Staff API
    Route::apiResource('staff', StaffInformationController::class);
    Route::get('staff-id-cards', [StaffIdCardController::class, 'index']);
    Route::post('staff/{staff}/id-card-request', [StaffIdCardController::class, 'request']);
    Route::patch('staff-id-cards/{card}/status', [StaffIdCardController::class, 'updateStatus']);
    Route::post('staff-id-cards/{card}/release', [StaffIdCardController::class, 'release']);
});
