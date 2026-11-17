<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('audit_trail_logs')) {
            return;
        }

        Schema::create('audit_trail_logs', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('actor_id')->nullable()->index();
            $table->string('actor_name')->nullable();
            $table->string('actor_role')->nullable();
            $table->string('module')->index();
            $table->string('action')->index();
            $table->string('entity_type')->nullable()->index();
            $table->string('entity_id')->nullable()->index();
            $table->string('method', 10);
            $table->string('endpoint');
            $table->unsignedSmallInteger('status_code');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('properties')->nullable();
            $table->timestamp('occurred_at')->useCurrent()->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_trail_logs');
    }
};
