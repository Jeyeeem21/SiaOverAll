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
        $student = $this->route('student');
        $userId = $student ? $student->user_id : null;
        
        return [
            // Map form fields to account_students table
            'student_id_number' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],
            'student_number' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('account_students', 'student_number')->ignore($this->route('student')),
            ],
            'first_name' => ['sometimes', 'string'],
            'middle_name' => ['nullable', 'string'],
            'last_name' => ['sometimes', 'string'],
            'program' => ['sometimes', 'string'],
            'department' => ['sometimes', 'string', 'max:255'],
            'college' => ['sometimes', 'string', 'max:255'],
            'year_level' => ['nullable', 'string'],
            'section' => ['nullable', 'string'],
            'birthdate' => ['nullable', 'date'],
            'address' => ['nullable', 'string'],
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_number' => ['nullable', 'string', 'max:255'],
            'email' => [
                'nullable', 
                'email',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'contact_number' => ['nullable', 'string', 'max:255'],
            'verification_status' => ['sometimes', Rule::in(['pending', 'verified', 'rejected', 'suspended'])],
            'photo' => ['nullable', 'image'],
            'signature' => ['nullable', 'image', 'mimes:png'],
        ];
    }
}
