<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('orders')) {
            return;
        }

        if (! Schema::hasColumn('orders', 'student_id')) {
            Schema::table('orders', function (Blueprint $table): void {
                $table->unsignedBigInteger('student_id')->nullable()->index();
            });
        }

        if (! Schema::hasColumn('orders', 'payment_status')) {
            Schema::table('orders', function (Blueprint $table): void {
                $table->string('payment_status')->default('unpaid');
            });
        }

        if (! Schema::hasColumn('orders', 'payment_method')) {
            Schema::table('orders', function (Blueprint $table): void {
                $table->string('payment_method')->nullable();
            });
        }

        if (! Schema::hasColumn('orders', 'payment_reference')) {
            Schema::table('orders', function (Blueprint $table): void {
                $table->string('payment_reference')->nullable();
            });
        }

        if (! Schema::hasColumn('orders', 'subtotal')) {
            Schema::table('orders', function (Blueprint $table): void {
                $table->decimal('subtotal', 10, 2)->default(0);
            });
        }

        if (! Schema::hasColumn('orders', 'tax_amount')) {
            Schema::table('orders', function (Blueprint $table): void {
                $table->decimal('tax_amount', 10, 2)->default(0);
            });
        }

        if (! Schema::hasColumn('orders', 'discount_amount')) {
            Schema::table('orders', function (Blueprint $table): void {
                $table->decimal('discount_amount', 10, 2)->default(0);
            });
        }

        if (! Schema::hasColumn('orders', 'staff_notes')) {
            Schema::table('orders', function (Blueprint $table): void {
                $table->text('staff_notes')->nullable();
            });
        }

        if (! Schema::hasColumn('orders', 'processed_by')) {
            Schema::table('orders', function (Blueprint $table): void {
                $table->unsignedBigInteger('processed_by')->nullable();
            });
        }

        if (! Schema::hasColumn('orders', 'order_date')) {
            Schema::table('orders', function (Blueprint $table): void {
                $table->timestamp('order_date')->nullable();
            });
        }

        if (! Schema::hasColumn('orders', 'completed_at')) {
            Schema::table('orders', function (Blueprint $table): void {
                $table->timestamp('completed_at')->nullable();
            });
        }

        if (! Schema::hasColumn('orders', 'cancelled_at')) {
            Schema::table('orders', function (Blueprint $table): void {
                $table->timestamp('cancelled_at')->nullable();
            });
        }
    }

    public function down(): void
    {
        // The shared orders table is owned by multiple modules and must not
        // lose fields during a rollback of Student Account migrations.
    }
};
