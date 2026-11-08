<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CatalogController extends Controller
{
    private function mainSystemUrl(): string
    {
        return rtrim(env('MAIN_SYSTEM_API_URL', 'http://main-backend:8000/api'), '/');
    }

    /**
     * The Main System owns the catalog. Student Account only exposes a
     * student-authenticated read-through endpoint for its own frontend.
     */
    public function products(Request $request)
    {
        return $this->forward('/products', $request->query(), $request->bearerToken());
    }

    public function product(Request $request, int $id)
    {
        return $this->forward("/products/{$id}", [], $request->bearerToken());
    }

    public function categories(Request $request)
    {
        return $this->forward('/categories', [], $request->bearerToken());
    }

    private function forward(string $path, array $query = [], ?string $token = null)
    {
        try {
            $response = Http::acceptJson()
                ->timeout(10)
                ->withToken($token)
                ->get($this->mainSystemUrl() . $path, $query);

            if (! $response->successful()) {
                Log::warning('Main System catalog request was rejected', [
                    'path' => $path,
                    'status' => $response->status(),
                ]);

                return response()->json([
                    'message' => 'Unable to load the centralized product catalog.',
                ], $response->status());
            }

            return response()->json(
                $response->json(),
                200
            );
        } catch (\Throwable $exception) {
            Log::error('Student catalog request failed', [
                'path' => $path,
                'error' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'Product catalog is temporarily unavailable. Please try again.',
            ], 503);
        }
    }
}
