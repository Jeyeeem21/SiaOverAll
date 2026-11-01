<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sticker_types', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('color')->default('#000000');
            $table->decimal('price', 8, 2)->default(0);
            $table->integer('validity_days')->default(365);
            $table->boolean('requires_vehicle_details')->default(false);
            $table->boolean('requires_approval')->default(true);
            $table->json('allowed_file_types')->default('["pdf","jpg","png","jpeg"]');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sticker_types');
    }
};
