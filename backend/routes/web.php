<?php

use App\Http\Controllers\Api\StudentIdCardController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Student ID Card preview and PDF routes
Route::get('/student-id-cards/{card}/preview', [StudentIdCardController::class, 'preview'])->name('student-id-cards.preview');
Route::get('/student-id-cards/{card}/pdf', [StudentIdCardController::class, 'generatePdf'])->name('student-id-cards.pdf');
