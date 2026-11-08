<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'document' => [
                'required',
                'file',
                'mimes:pdf,jpg,jpeg,png,doc,docx',  // Common document formats
                'max:10240',  // 10MB max for documents
            ],
            'document_type' => [
                'required',
                'string',
                'in:birth_certificate,transcript,clearance,medical_record,id_copy,other',
            ],
            'document_name' => [
                'nullable',
                'string',
                'max:255',
            ],
            'notes' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'document.required' => 'Please select a document to upload.',
            'document.file' => 'The uploaded file must be a valid document.',
            'document.mimes' => 'Only PDF, JPG, JPEG, PNG, DOC, and DOCX files are accepted.',
            'document.max' => 'The document size must not exceed 10MB.',
            'document_type.required' => 'Please select a document type.',
            'document_type.in' => 'Invalid document type selected.',
        ];
    }
}
