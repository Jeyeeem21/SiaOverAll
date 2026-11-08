<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PrintPricingConfig;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PrintPricingController extends Controller
{
    /**
     * Get all pricing configurations
     */
    public function index(): JsonResponse
    {
        $configs = PrintPricingConfig::where('is_active', true)
            ->orderBy('color_type')
            ->orderBy('paper_size')
            ->get();

        $formatted = $configs->map(function ($config) {
            return [
                'config_id' => $config->config_id,
                'color_type' => $config->color_type,
                'paper_size' => $config->paper_size,
                'print_side' => $config->print_side,
                'price_per_page' => number_format($config->price_per_page, 2),
                'binding' => [
                    'spiral' => number_format($config->binding_spiral, 2),
                    'staple' => number_format($config->binding_staple, 2),
                    'plastic_comb' => number_format($config->binding_plastic_comb, 2),
                ],
                'lamination' => [
                    'glossy' => number_format($config->lamination_glossy, 2),
                    'matte' => number_format($config->lamination_matte, 2),
                ],
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formatted,
        ]);
    }

    /**
     * Calculate print order cost estimate
     */
    public function calculate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'color_type' => 'required|in:black_white,colored',
            'paper_size' => 'required|in:A4,A3,Letter,Legal,Short,Long',
            'print_side' => 'required|in:single,double',
            'pages_per_document' => 'required|integer|min:1',
            'copies' => 'required|integer|min:1|max:1000',
            'binding_type' => 'required|in:none,spiral,staple,plastic_comb',
            'lamination' => 'required|boolean',
            'lamination_type' => 'required_if:lamination,true|in:none,glossy,matte',
        ]);

        // Get pricing config
        $config = PrintPricingConfig::getPrice(
            $validated['color_type'],
            $validated['paper_size'],
            $validated['print_side']
        );

        if (!$config) {
            return response()->json([
                'success' => false,
                'message' => 'Pricing configuration not found for the selected options',
            ], 404);
        }

        // Calculate costs
        $totalPages = $validated['copies'] * $validated['pages_per_document'];
        $pagesCost = $totalPages * $config->price_per_page;

        $bindingCost = $validated['binding_type'] !== 'none' 
            ? $config->getBindingPrice($validated['binding_type']) 
            : 0;

        $laminationCost = $validated['lamination'] && $validated['lamination_type'] !== 'none'
            ? $config->getLaminationPrice($validated['lamination_type'])
            : 0;

        $totalAmount = $pagesCost + $bindingCost + $laminationCost;

        // Create breakdown
        $breakdown = [
            'pages' => "{$totalPages} pages × ₱" . number_format($config->price_per_page, 2) . " = ₱" . number_format($pagesCost, 2),
        ];

        if ($bindingCost > 0) {
            $bindingLabel = ucfirst(str_replace('_', ' ', $validated['binding_type']));
            $breakdown['binding'] = "{$bindingLabel} binding = ₱" . number_format($bindingCost, 2);
        }

        if ($laminationCost > 0) {
            $laminationLabel = ucfirst($validated['lamination_type']);
            $breakdown['lamination'] = "{$laminationLabel} lamination = ₱" . number_format($laminationCost, 2);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'total_pages' => $totalPages,
                'price_per_page' => number_format($config->price_per_page, 2),
                'pages_cost' => number_format($pagesCost, 2),
                'binding_cost' => number_format($bindingCost, 2),
                'lamination_cost' => number_format($laminationCost, 2),
                'total_amount' => number_format($totalAmount, 2),
                'breakdown' => $breakdown,
            ],
        ]);
    }

    /**
     * Get specific pricing configuration
     */
    public function show($id): JsonResponse
    {
        $config = PrintPricingConfig::find($id);

        if (!$config) {
            return response()->json([
                'success' => false,
                'message' => 'Pricing configuration not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'config_id' => $config->config_id,
                'color_type' => $config->color_type,
                'paper_size' => $config->paper_size,
                'print_side' => $config->print_side,
                'price_per_page' => number_format($config->price_per_page, 2),
                'binding' => [
                    'spiral' => number_format($config->binding_spiral, 2),
                    'staple' => number_format($config->binding_staple, 2),
                    'plastic_comb' => number_format($config->binding_plastic_comb, 2),
                ],
                'lamination' => [
                    'glossy' => number_format($config->lamination_glossy, 2),
                    'matte' => number_format($config->lamination_matte, 2),
                ],
                'is_active' => $config->is_active,
            ],
        ]);
    }

    /**
     * Update pricing configuration (Admin only)
     */
    public function update(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'price_per_page' => 'sometimes|numeric|min:0',
            'binding_spiral' => 'sometimes|numeric|min:0',
            'binding_staple' => 'sometimes|numeric|min:0',
            'binding_plastic_comb' => 'sometimes|numeric|min:0',
            'lamination_glossy' => 'sometimes|numeric|min:0',
            'lamination_matte' => 'sometimes|numeric|min:0',
            'is_active' => 'sometimes|boolean',
        ]);

        $config = PrintPricingConfig::find($id);

        if (!$config) {
            return response()->json([
                'success' => false,
                'message' => 'Pricing configuration not found',
            ], 404);
        }

        $config->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Pricing configuration updated successfully',
            'data' => $config,
        ]);
    }
}
