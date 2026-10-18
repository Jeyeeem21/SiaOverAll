<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\ApiKey;
use Symfony\Component\HttpFoundation\Response;

class ApiKeyMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string|null  $ability
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @throws \Illuminate\Auth\AuthenticationException
     */
    public function handle(Request $request, Closure $next, string $ability = null): Response
    {
        // Get API key from header
        $apiKeyHeader = config('services.core.api_key_header', 'X-API-KEY');
        $apiKeyScheme = config('services.core.api_key_scheme');

        $headerValue = $request->header($apiKeyHeader);

        if (!$headerValue) {
            return response()->json(['message' => 'API key required'], 401);
        }

        // Extract key from header (remove scheme if present)
        if ($apiKeyScheme && str_starts_with($headerValue, $apiKeyScheme . ' ')) {
            $apiKey = substr($headerValue, strlen($apiKeyScheme . ' '));
        } else {
            $apiKey = $headerValue;
        }

        // Validate API key format
        if (!preg_match('/^sia_[a-zA-Z0-9]{40}$/', $apiKey)) {
            return response()->json(['message' => 'Invalid API key format'], 401);
        }

        // Find API key by prefix
        $prefix = ApiKey::getPrefix($apiKey);
        $keyRecord = ApiKey::where('key_prefix', $prefix)->first();

        if (!$keyRecord) {
            return response()->json(['message' => 'Invalid API key'], 401);
        }

        // Verify the key hash
        $hashedKey = ApiKey::hash($apiKey);
        if (!hash_equals($keyRecord->key_hash, $hashedKey)) {
            return response()->json(['message' => 'Invalid API key'], 401);
        }

        // Check if key is valid
        if (!$keyRecord->isValid()) {
            return response()->json(['message' => 'API key is expired or revoked'], 401);
        }

        // Check IP restrictions
        if (!$keyRecord->isIpAllowed($request->ip())) {
            return response()->json(['message' => 'IP address not allowed'], 403);
        }

        // Check ability if specified
        if ($ability && !$keyRecord->hasAbility($ability)) {
            return response()->json(['message' => 'Insufficient permissions'], 403);
        }

        // Update last used at (throttled)
        $keyRecord->touchIfExpired();

        // Attach key record to request for use in controllers
        $request->attributes->add(['api_key' => $keyRecord]);

        return $next($request);
    }
}
