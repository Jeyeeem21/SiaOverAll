<?php

use App\Http\Controllers\Api\StudentIdCardController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('/', function () {
    return view('welcome');
});

// Student ID Card preview and PDF routes
Route::get('/student-id-cards/{card}/preview', [StudentIdCardController::class, 'preview'])->name('student-id-cards.preview');
Route::get('/student-id-cards/{card}/pdf', [StudentIdCardController::class, 'generatePdf'])->name('student-id-cards.pdf');

// Serve storage files (photos and signatures)
Route::get('/storage/student-photos/{filename}', function ($filename) {
    $path = 'student-photos/' . $filename;
    
    if (!Storage::disk('public')->exists($path)) {
        abort(404);
    }
    
    $file = Storage::disk('public')->get($path);
    $mimeType = Storage::disk('public')->mimeType($path);
    
    return response($file, 200)->header('Content-Type', $mimeType);
});

Route::get('/storage/student-signatures/{filename}', function ($filename) {
    $path = 'student-signatures/' . $filename;
    
    if (!Storage::disk('public')->exists($path)) {
        abort(404);
    }
    
    $file = Storage::disk('public')->get($path);
    $mimeType = Storage::disk('public')->mimeType($path);
    
    return response($file, 200)->header('Content-Type', $mimeType);
});
