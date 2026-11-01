<?php

namespace App\Services;

use App\Models\StickerRequest;
use App\Models\Sticker;
use App\Models\RequestAttachment;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Carbon\Carbon;

class StickerService
{
    public function uploadAttachment(StickerRequest $request, UploadedFile $file, string $uploadType): RequestAttachment
    {
        $fileName = $file->getClientOriginalName();
        $filePath = $file->store("sticker-requests/{$request->id}", 'public');
        $fileSize = $file->getSize();
        $fileType = $file->getClientOriginalExtension();

        return RequestAttachment::create([
            'sticker_request_id' => $request->id,
            'file_name' => $fileName,
            'file_path' => $filePath,
            'file_type' => $fileType,
            'file_size' => $fileSize,
            'upload_type' => $uploadType,
        ]);
    }

    public function approveRequest(StickerRequest $request, User $approver, ?string $notes): StickerRequest
    {
        $request->update([
            'status' => 'approved',
            'approved_by' => $approver->id,
            'approval_notes' => $notes,
            'approved_at' => now(),
        ]);

        return $request;
    }

    public function rejectRequest(StickerRequest $request, string $reason): StickerRequest
    {
        $request->update([
            'status' => 'rejected',
            'rejection_reason' => $reason,
            'rejected_at' => now(),
        ]);

        return $request;
    }

    public function generateStickers(StickerRequest $request): StickerRequest
    {
        if ($request->status !== 'paid') {
            throw new \Exception('Request must be paid before generating stickers');
        }

        $stickerType = $request->stickerType;
        $issueDate = Carbon::now();
        $expiryDate = $issueDate->addDays($stickerType->validity_days);

        for ($i = 0; $i < $request->quantity; $i++) {
            $serialNumber = $this->generateSerialNumber($stickerType->id);
            $qrCode = $this->generateQRCode($serialNumber);
            $filePath = $this->saveQRCodeImage($serialNumber, $qrCode);

            Sticker::create([
                'sticker_request_id' => $request->id,
                'serial_number' => $serialNumber,
                'qr_code' => $qrCode,
                'issue_date' => $issueDate,
                'expiry_date' => $expiryDate,
                'status' => 'active',
                'file_path' => $filePath,
            ]);
        }

        $request->update([
            'status' => 'printed',
            'printed_at' => now(),
        ]);

        return $request;
    }

    public function reprintSticker(Sticker $sticker): Sticker
    {
        if ($sticker->reprint_count >= 3) {
            throw new \Exception('Maximum reprint limit reached');
        }

        // Generate new QR code
        $qrCode = $this->generateQRCode($sticker->serial_number);
        $filePath = $this->saveQRCodeImage($sticker->serial_number, $qrCode);

        $sticker->update([
            'qr_code' => $qrCode,
            'file_path' => $filePath,
            'reprint_count' => $sticker->reprint_count + 1,
            'last_reprinted_at' => now(),
        ]);

        return $sticker;
    }

    private function generateSerialNumber(int $typeId): string
    {
        $timestamp = now()->format('YmdHis');
        $randomPart = Str::random(6);
        $serialNumber = "STK-{$typeId}-{$timestamp}-{$randomPart}";

        // Ensure uniqueness
        while (Sticker::where('serial_number', $serialNumber)->exists()) {
            $randomPart = Str::random(6);
            $serialNumber = "STK-{$typeId}-{$timestamp}-{$randomPart}";
        }

        return $serialNumber;
    }

    private function generateQRCode(string $serialNumber): string
    {
        // Generate QR code data
        $qrData = [
            'serial' => $serialNumber,
            'issued' => now()->toIso8601String(),
        ];

        return json_encode($qrData);
    }

    private function saveQRCodeImage(string $serialNumber, string $qrCode): string
    {
        try {
            $fileName = "stickers/{$serialNumber}.png";
            $filePath = storage_path("app/public/{$fileName}");

            // Ensure directory exists
            if (!is_dir(dirname($filePath))) {
                mkdir(dirname($filePath), 0755, true);
            }

            // Generate QR code image
            QrCode::size(200)
                ->format('png')
                ->generate($qrCode, $filePath);

            return $fileName;
        } catch (\Exception $e) {
            // Fallback: return a placeholder path
            return "stickers/{$serialNumber}.png";
        }
    }
}
