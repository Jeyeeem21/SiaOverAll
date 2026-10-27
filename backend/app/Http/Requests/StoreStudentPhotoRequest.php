<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentPhotoRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authorization is handled in controller
        return true;
    }

    public function rules(): array
    {
        return [
            'photo' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png',  // Only JPG, JPEG, PNG as specified
                'max:5120',  // 5MB max file size
                'dimensions:min_width=200,min_height=200,max_width=4000,max_height=4000',  // Reasonable dimensions
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'photo.required' => 'Please select a photo to upload.',
            'photo.image' => 'The file must be an image.',
            'photo.mimes' => 'Only JPG, JPEG, and PNG formats are accepted.',
            'photo.max' => 'The photo size must not exceed 5MB.',
            'photo.dimensions' => 'The photo dimensions must be between 200x200 and 4000x4000 pixels.',
        ];
    }
}
