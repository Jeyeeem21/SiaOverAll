<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Student */
class StudentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Parse full_name into parts for display
        $nameParts = $this->user?->full_name ? explode(' ', trim($this->user->full_name)) : [];
        $firstName = $nameParts[0] ?? '';
        $lastName = count($nameParts) > 2 ? $nameParts[count($nameParts) - 1] : ($nameParts[1] ?? '');
        $middleName = count($nameParts) > 2 ? $nameParts[1] : '';
        
        return [
            'id' => $this->id,
            'student_number' => $this->student_number,
            'student_id_number' => $this->student_number, // Map for compatibility
            'reference_no' => $this->reference_no,
            'first_name' => $firstName,
            'middle_name' => $middleName,
            'last_name' => $lastName,
            'full_name' => $this->user?->full_name ?? 'N/A',
            'program' => $this->department, // Map department to program for compatibility
            'year_level' => $this->year_level,
            'section' => $this->section,
            'birthdate' => $this->birthdate ? $this->birthdate->format('Y-m-d') : null,
            'address' => $this->address,
            'emergency_contact_name' => $this->emergency_contact_name,
            'emergency_contact_number' => $this->emergency_contact_number,
            'department' => $this->department,
            'college' => $this->college,
            'email' => $this->user?->email,
            'contact_number' => $this->contact_number,
            'verification_status' => $this->status, // Map status to verification_status
            'status' => $this->status,
            'photo_path' => $this->photo_path,
            'photo_url' => $this->photoUrl, // Priority: photo_path > user.avatar
            'avatar_url' => $this->avatarUrl, // Direct user.avatar URL
            'signature_path' => $this->signature_path,
            'signature_url' => $this->signatureUrl,
            'verified_at' => $this->verified_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
