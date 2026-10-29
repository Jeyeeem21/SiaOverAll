<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrintPricingConfig extends Model
{
    protected $table = 'print_pricing_config';
    protected $primaryKey = 'config_id';

    protected $fillable = [
        'color_type',
        'paper_size',
        'print_side',
        'price_per_page',
        'binding_spiral',
        'binding_staple',
        'binding_plastic_comb',
        'lamination_glossy',
        'lamination_matte',
        'is_active',
    ];

    protected $casts = [
        'price_per_page' => 'decimal:2',
        'binding_spiral' => 'decimal:2',
        'binding_staple' => 'decimal:2',
        'binding_plastic_comb' => 'decimal:2',
        'lamination_glossy' => 'decimal:2',
        'lamination_matte' => 'decimal:2',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Helper methods
    public static function getPrice(string $colorType, string $paperSize, string $printSide): ?self
    {
        return self::where('color_type', $colorType)
            ->where('paper_size', $paperSize)
            ->where('print_side', $printSide)
            ->where('is_active', true)
            ->first();
    }

    public function getBindingPrice(string $bindingType): float
    {
        return match($bindingType) {
            'spiral' => (float) $this->binding_spiral,
            'staple' => (float) $this->binding_staple,
            'plastic_comb' => (float) $this->binding_plastic_comb,
            default => 0.00,
        };
    }

    public function getLaminationPrice(string $laminationType): float
    {
        return match($laminationType) {
            'glossy' => (float) $this->lamination_glossy,
            'matte' => (float) $this->lamination_matte,
            default => 0.00,
        };
    }
}

