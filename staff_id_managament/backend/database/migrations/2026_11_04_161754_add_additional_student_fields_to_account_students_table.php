<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('account_students') && 
            !Schema::hasColumn('account_students', 'birthdate')) {
            Schema::table('account_students', function (Blueprint $table) {
                $table->date('birthdate')->nullable()->after('section');
                $table->text('address')->nullable()->after('birthdate');
                $table->string('emergency_contact_name')->nullable()->after('address');
                $table->string('emergency_contact_number')->nullable()->after('emergency_contact_name');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('account_students')) {
            Schema::table('account_students', function (Blueprint $table) {
                $columns = ['birthdate', 'address', 'emergency_contact_name', 'emergency_contact_number'];
                $columnsToRemove = [];
                foreach ($columns as $column) {
                    if (Schema::hasColumn('account_students', $column)) {
                        $columnsToRemove[] = $column;
                    }
                }
                if (!empty($columnsToRemove)) {
                    $table->dropColumn($columnsToRemove);
                }
            });
        }
    }
};
