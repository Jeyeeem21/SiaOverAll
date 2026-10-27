<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'student_id_number' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                Rule::unique('students', 'student_id_number')->ignore($this->route('student')),
            ],
            'first_name' => ['sometimes', 'required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['sometimes', 'required', 'string', 'max:100'],
            'program' => ['sometimes', 'required', 'string', 'max:255'],
            'year_level' => ['sometimes', 'required', 'string', 'max:30'],
            'section' => ['sometimes', 'required', 'string', 'max:50'],
            'department' => ['sometimes', 'required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'birthdate' => ['nullable', 'date', 'before:today'],
            'email' => ['nullable', 'email', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:30'],
            'emergency_contact_name' => ['nullable', 'string', 'max:200'],
            'emergency_contact_number' => ['nullable', 'string', 'max:30'],
            'verification_status' => ['sometimes', Rule::in(['pending', 'verified', 'unverified'])],
            'photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg', 'max:5120'],
            'signature' => ['nullable', 'image', 'mimes:jpeg,png,jpg', 'max:2048'],
        ];
    }
}
