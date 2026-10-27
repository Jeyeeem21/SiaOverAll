<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Student */
class StudentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'student_number' => $this->student_number,
            'first_name' => $this->first_name,
            'middle_name' => $this->middle_name,
            'last_name' => $this->last_name,
            'full_name' => collect([$this->first_name, $this->middle_name, $this->last_name])
                ->filter()
                ->join(' '),
            'program' => $this->program,
            'year_level' => $this->year_level,
            'section' => $this->section,
            'department' => $this->department,
            'email' => $this->email,
            'contact_number' => $this->contact_number,
            'verification_status' => $this->verification_status,
            'student_id_number' => $this->student_id_number,
            'photo_path' => $this->photo_path,
            'photo_url' => $this->photo_url,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
