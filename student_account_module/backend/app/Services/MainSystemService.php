<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MainSystemService
{
    private $baseUrl;
    private $timeout;

    public function __construct()
    {
        // Main system API endpoint
        $this->baseUrl = env('MAIN_SYSTEM_API_URL', 'http://localhost:8000/api');
        $this->timeout = 10; // seconds
    }

    /**
     * Create a student user in the main system after successful registration
     * 
     * @param array $userData User data to sync
     * @return array Response from main system
     */
    public function createStudentUser(array $userData)
    {
        try {
            Log::info('Syncing student user to main system', ['email' => $userData['email']]);

            $response = Http::timeout($this->timeout)
                ->post("{$this->baseUrl}/settings/users", [
                    'full_name' => $userData['name'],
                    'email' => $userData['email'],
                    'password' => $userData['password'], // Already hashed
                    'role' => 'Customer',
                    'phone' => $userData['contact_number'] ?? null,
                    'status' => 'active',
                ]);

            if ($response->successful()) {
                Log::info('Successfully synced student to main system', ['email' => $userData['email']]);
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            Log::warning('Failed to sync student to main system', [
                'email' => $userData['email'],
                'status' => $response->status(),
                'response' => $response->body(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to sync with main system',
                'status' => $response->status(),
            ];

        } catch (\Exception $e) {
            Log::error('Exception while syncing to main system', [
                'email' => $userData['email'],
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Check if email exists in main system
     * 
     * @param string $email
     * @return bool
     */
    public function emailExists(string $email): bool
    {
        try {
            $response = Http::timeout($this->timeout)
                ->post("{$this->baseUrl}/settings/check-email", [
                    'email' => $email,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['exists'] ?? false;
            }

            return false;

        } catch (\Exception $e) {
            Log::error('Exception while checking email in main system', [
                'email' => $email,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Validate token against main system
     * 
     * @param string $token
     * @return array|null User data if valid, null otherwise
     */
    public function validateToken(string $token): ?array
    {
        try {
            $response = Http::timeout($this->timeout)
                ->withToken($token)
                ->get("{$this->baseUrl}/user");

            if ($response->successful()) {
                return $response->json();
            }

            return null;

        } catch (\Exception $e) {
            Log::error('Exception while validating token', [
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }
}
