<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Support\Str;

#[Fillable([
    'name',
    'key_prefix',
    'key_hash',
    'abilities',
    'allowed_ips',
    'expires_at',
    'revoked_at',
    'last_used_at'
])]
class ApiKey extends Model
{
    /**
     * Generate a new API key.
     *
     * @return string The generated API key (sia_ + 40 random chars)
     */
    public static function generate(): string
    {
        // Generate 40 random characters
        $random = Str::random(40);
        // Prefix with "sia_" as specified
        return 'sia_' . $random;
    }

    /**
     * Hash an API key for storage.
     *
     * @param string $key The API key to hash
     * @return string SHA-256 hash of the key
     */
    public static function hash(string $key): string
    {
        return hash('sha256', $key);
    }

    /**
     * Get the prefix (first 8 chars) of an API key.
     *
     * @param string $key The API key
     * @return string First 8 characters of the key
     */
    public static function getPrefix(string $key): string
    {
        return substr($key, 0, 8);
    }

    /**
     * Check if the API key has expired.
     *
     * @return bool True if expired, false otherwise
     */
    public function isExpired(): bool
    {
        return ! is_null($this->expires_at) && $this->expires_at->isPast();
    }

    /**
     * Check if the API key has been revoked.
     *
     * @return bool True if revoked, false otherwise
     */
    public function isRevoked(): bool
    {
        return ! is_null($this->revoked_at);
    }

    /**
     * Check if the API key is valid (not expired and not revoked).
     *
     * @return bool True if valid, false otherwise
     */
    public function isValid(): bool
    {
        return ! $this->isExpired() && ! $this->isRevoked();
    }

    /**
     * Check if the API key has the required ability.
     *
     * @param string $ability The ability to check
     * @return bool True if has ability, false otherwise
     */
    public function hasAbility(string $ability): bool
    {
        $abilities = $this->abilities ?? [];
        return is_array($abilities) && in_array($ability, $abilities);
    }

    /**
     * Check if the IP address is allowed.
     *
     * @param string $ipAddress The IP address to check
     * @return bool True if allowed or no restrictions, false otherwise
     */
    public function isIpAllowed(string $ipAddress): bool
    {
        $allowedIps = $this->allowed_ips ?? [];

        // If no IP restrictions, allow all
        if (empty($allowedIps)) {
            return true;
        }

        return is_array($allowedIps) && in_array($ipAddress, $allowedIps);
    }

    /**
     * Update the last used timestamp (throttled to max once every 5 minutes).
     */
    public function touchIfExpired(): void
    {
        $now = now();
        $fiveMinutesAgo = $now->subtractMinutes(5);

        if (is_null($this->last_used_at) || $this->last_used_at->isBefore($fiveMinutesAgo)) {
            $this->last_used_at = $now;
            $this->save();
        }
    }
}
