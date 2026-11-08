<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CoreApiClient
{
    /**
     * Base URL for the core API
     */
    protected string $baseUrl;

    /**
     * API key for authentication
     */
    protected string $apiKey;

    /**
     * API key header name
     */
    protected string $keyHeader;

    /**
     * API key scheme (Bearer, etc.)
     */
    protected ?string $keyScheme;

    /**
     * Request timeout in seconds
     */
    protected int $timeout;

    /**
     * Endpoint paths
     */
    protected array $endpoints = [];

    /**
     * Create a new CoreApiClient instance.
     */
    public function __construct()
    {
        $this->baseUrl = config('services.core.api_url');
        $this->apiKey = config('services.core.api_key');
        $this->keyHeader = config('services.core.api_key_header', 'X-API-KEY');
        $this->keyScheme = config('services.core.api_key_scheme');
        $this->timeout = config('services.core.timeout', 30);
        $this->endpoints = config('services.core.endpoints', []);
    }

    /**
     * Make a GET request to the core API.
     */
    public function get(string $endpoint, array $query = [], array $headers = []): \Illuminate\Http\Client\Response
    {
        return $this->request('GET', $endpoint, $query, [], $headers);
    }

    /**
     * Make a POST request to the core API.
     */
    public function post(string $endpoint, array $data = [], array $headers = []): \Illuminate\Http\Client\Response
    {
        return $this->request('POST', $endpoint, [], $data, $headers);
    }

    /**
     * Make a PUT request to the core API.
     */
    public function put(string $endpoint, array $data = [], array $headers = []): \Illuminate\Http\Client\Response
    {
        return $this->request('PUT', $endpoint, [], $data, $headers);
    }

    /**
     * Make a DELETE request to the core API.
     */
    public function delete(string $endpoint, array $headers = []): \Illuminate\Http\Client\Response
    {
        return $this->request('DELETE', $endpoint, [], [], $headers);
    }

    /**
     * Ping the core API to check connectivity.
     */
    public function ping(): bool
    {
        try {
            $response = $this->get('ping');
            return $response->successful();
        } catch (\Throwable $e) {
            Log::warning('Core API ping failed: '.$e->getMessage());
            return false;
        }
    }

    /**
     * Make an HTTP request to the core API.
     */
    protected function request(string $method, string $endpoint, array $query = [], array $body = [], array $headers = []): \Illuminate\Http\Client\Response
    {
        // Merge endpoint with base URL
        $url = $this->baseUrl . '/' . ltrim($endpoint, '/');

        // Prepare headers
        $requestHeaders = [
            'Accept' => 'application/json',
            $this->keyHeader => $this->apiKey,
        ];

        if ($this->keyScheme) {
            $requestHeaders[$this->keyHeader] = $this->keyScheme . ' ' . $this->apiKey;
        }

        // Merge custom headers
        $requestHeaders = array_merge($requestHeaders, $headers);

        // Make request with timeout and retry
        try {
            $response = Http::timeout($this->timeout)
                ->retry(2, 100) // Retry 2 times with 100ms delay
                ->headers($requestHeaders)
                ->when(count($query) > 0, fn ($http) => $http->withQueryParameters($query))
                ->when(count($body) > 0, fn ($http) => $http->withBody(json_encode($body), 'application/json'))
                ->{$method}($url);

            return $response;
        } catch (\Throwable $e) {
            Log::error('Core API request failed: '.$e->getMessage(), [
                'method' => $method,
                'url' => $url,
                'query' => $query,
                'body' => $body,
            ]);

            // Throw a generic exception to hide internal details
            throw new \RuntimeException('Unable to connect to core service');
        }
    }
}