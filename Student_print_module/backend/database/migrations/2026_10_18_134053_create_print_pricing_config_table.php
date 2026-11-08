<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('print_pricing_config', function (Blueprint $table) {
            $table->id('config_id');
            
            // Pricing Configuration
            $table->enum('color_type', ['black_white', 'colored']);
            $table->enum('paper_size', ['A4', 'A3', 'Letter', 'Legal', 'Short', 'Long']);
            $table->enum('print_side', ['single', 'double']);
            
            $table->decimal('price_per_page', 8, 2)->default(0);
            
            // Binding Prices
            $table->decimal('binding_spiral', 8, 2)->default(0);
            $table->decimal('binding_staple', 8, 2)->default(0);
            $table->decimal('binding_plastic_comb', 8, 2)->default(0);
            
            // Lamination Prices
            $table->decimal('lamination_glossy', 8, 2)->default(0);
            $table->decimal('lamination_matte', 8, 2)->default(0);
            
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Unique constraint for pricing combination
            $table->unique(['color_type', 'paper_size', 'print_side'], 'unique_pricing_config');
            
            // Indexes
            $table->index('is_active');
        });
        
        // Insert default pricing
        DB::table('print_pricing_config')->insert([
            // Black & White - A4
            ['color_type' => 'black_white', 'paper_size' => 'A4', 'print_side' => 'single', 'price_per_page' => 1.00, 
             'binding_spiral' => 15.00, 'binding_staple' => 5.00, 'binding_plastic_comb' => 20.00,
             'lamination_glossy' => 10.00, 'lamination_matte' => 10.00, 'is_active' => true, 
             'created_at' => now(), 'updated_at' => now()],
            ['color_type' => 'black_white', 'paper_size' => 'A4', 'print_side' => 'double', 'price_per_page' => 1.50, 
             'binding_spiral' => 15.00, 'binding_staple' => 5.00, 'binding_plastic_comb' => 20.00,
             'lamination_glossy' => 10.00, 'lamination_matte' => 10.00, 'is_active' => true, 
             'created_at' => now(), 'updated_at' => now()],
            
            // Colored - A4
            ['color_type' => 'colored', 'paper_size' => 'A4', 'print_side' => 'single', 'price_per_page' => 5.00, 
             'binding_spiral' => 15.00, 'binding_staple' => 5.00, 'binding_plastic_comb' => 20.00,
             'lamination_glossy' => 15.00, 'lamination_matte' => 15.00, 'is_active' => true, 
             'created_at' => now(), 'updated_at' => now()],
            ['color_type' => 'colored', 'paper_size' => 'A4', 'print_side' => 'double', 'price_per_page' => 8.00, 
             'binding_spiral' => 15.00, 'binding_staple' => 5.00, 'binding_plastic_comb' => 20.00,
             'lamination_glossy' => 15.00, 'lamination_matte' => 15.00, 'is_active' => true, 
             'created_at' => now(), 'updated_at' => now()],
             
            // Black & White - Letter
            ['color_type' => 'black_white', 'paper_size' => 'Letter', 'print_side' => 'single', 'price_per_page' => 1.00, 
             'binding_spiral' => 15.00, 'binding_staple' => 5.00, 'binding_plastic_comb' => 20.00,
             'lamination_glossy' => 10.00, 'lamination_matte' => 10.00, 'is_active' => true, 
             'created_at' => now(), 'updated_at' => now()],
            ['color_type' => 'black_white', 'paper_size' => 'Letter', 'print_side' => 'double', 'price_per_page' => 1.50, 
             'binding_spiral' => 15.00, 'binding_staple' => 5.00, 'binding_plastic_comb' => 20.00,
             'lamination_glossy' => 10.00, 'lamination_matte' => 10.00, 'is_active' => true, 
             'created_at' => now(), 'updated_at' => now()],
             
            // Colored - Letter
            ['color_type' => 'colored', 'paper_size' => 'Letter', 'print_side' => 'single', 'price_per_page' => 5.00, 
             'binding_spiral' => 15.00, 'binding_staple' => 5.00, 'binding_plastic_comb' => 20.00,
             'lamination_glossy' => 15.00, 'lamination_matte' => 15.00, 'is_active' => true, 
             'created_at' => now(), 'updated_at' => now()],
            ['color_type' => 'colored', 'paper_size' => 'Letter', 'print_side' => 'double', 'price_per_page' => 8.00, 
             'binding_spiral' => 15.00, 'binding_staple' => 5.00, 'binding_plastic_comb' => 20.00,
             'lamination_glossy' => 15.00, 'lamination_matte' => 15.00, 'is_active' => true, 
             'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('print_pricing_config');
    }
};
