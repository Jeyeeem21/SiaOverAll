<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'student_id_number' => ['required', 'string', 'max:100', 'unique:students,student_id_number'],
            'first_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'program' => ['required', 'string', 'max:255'],
            'year_level' => ['required', 'string', 'max:30'],
            'section' => ['required', 'string', 'max:50'],
            'department' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:30'],
            'verification_status' => ['required', Rule::in(['pending', 'verified', 'unverified'])],
        ];
    }
}
