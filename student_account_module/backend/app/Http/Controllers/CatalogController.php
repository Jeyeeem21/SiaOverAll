<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    /**
     * The catalog is shared by every module through the common MySQL database.
     * Query it directly so student browsing does not depend on a second
     * Railway service being reachable over the private network.
     */
    public function products(Request $request): JsonResponse
    {
        $query = Product::query()->with('category');

        if ($request->filled('search')) {
            $query->where('barcode', $request->input('search'));
        }

        return response()->json(
            $query->orderByDesc('created_at')->get()
        );
    }

    public function product(int $id): JsonResponse
    {
        return response()->json(
            Product::query()->with('category')->findOrFail($id)
        );
    }

    public function categories(): JsonResponse
    {
        return response()->json(
            Category::query()->withCount('products')->orderByDesc('created_at')->get()
        );
    }
}
