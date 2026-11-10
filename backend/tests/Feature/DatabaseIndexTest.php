<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class DatabaseIndexTest extends TestCase
{
    /**
     * Test that all required indexes exist on sticker_requests table.
     */
    public function test_sticker_requests_table_has_required_indexes(): void
    {
        $indexes = $this->getTableIndexes('sticker_requests');
        
        // Single column indexes
        $this->assertContains('sticker_requests_status_index', $indexes, 'Missing status index');
        $this->assertContains('sticker_requests_student_id_index', $indexes, 'Missing student_id index');
        $this->assertContains('sticker_requests_created_at_index', $indexes, 'Missing created_at index');
        $this->assertContains('sticker_requests_vehicle_plate_number_index', $indexes, 'Missing vehicle_plate_number index');
        $this->assertContains('sticker_requests_reviewed_by_index', $indexes, 'Missing reviewed_by index');
        
        // Composite indexes
        $this->assertContains('sticker_requests_status_created_at_index', $indexes, 'Missing status+created_at composite index');
        $this->assertContains('idx_plate_status', $indexes, 'Missing vehicle_plate_number+status composite index');
        $this->assertContains('idx_created_status', $indexes, 'Missing created_at+status composite index');
    }

    /**
     * Test that all required indexes exist on stickers table.
     */
    public function test_stickers_table_has_required_indexes(): void
    {
        $indexes = $this->getTableIndexes('stickers');
        
        $this->assertContains('stickers_serial_number_unique', $indexes, 'Missing serial_number unique index');
        $this->assertContains('stickers_sticker_request_id_index', $indexes, 'Missing sticker_request_id index');
        $this->assertContains('stickers_generated_at_index', $indexes, 'Missing generated_at index');
        $this->assertContains('stickers_plate_number_index', $indexes, 'Missing plate_number index');
        $this->assertContains('stickers_student_id_number_index', $indexes, 'Missing student_id_number index');
        $this->assertContains('idx_generated_vehicle', $indexes, 'Missing generated_at+vehicle_type composite index');
    }

    /**
     * Test that all required indexes exist on users table.
     */
    public function test_users_table_has_required_indexes(): void
    {
        $indexes = $this->getTableIndexes('users');
        
        $this->assertContains('users_email_unique', $indexes, 'Missing email unique index');
        $this->assertContains('users_role_index', $indexes, 'Missing role index');
        $this->assertContains('users_name_index', $indexes, 'Missing name index');
    }

    /**
     * Test that all required indexes exist on request_documents table.
     */
    public function test_request_documents_table_has_required_indexes(): void
    {
        $indexes = $this->getTableIndexes('request_documents');
        
        $this->assertContains('request_documents_sticker_request_id_index', $indexes, 'Missing sticker_request_id index');
        $this->assertContains('request_documents_document_type_index', $indexes, 'Missing document_type index');
        $this->assertContains('request_documents_created_at_index', $indexes, 'Missing created_at index');
    }

    /**
     * Test that all required indexes exist on request_status_histories table.
     */
    public function test_request_status_histories_table_has_required_indexes(): void
    {
        $indexes = $this->getTableIndexes('request_status_histories');
        
        $this->assertContains('request_status_histories_sticker_request_id_index', $indexes, 'Missing sticker_request_id index');
        $this->assertContains('request_status_histories_changed_by_index', $indexes, 'Missing changed_by index');
        $this->assertContains('request_status_histories_created_at_index', $indexes, 'Missing created_at index');
        $this->assertContains('request_status_histories_sticker_request_id_created_at_index', $indexes, 'Missing sticker_request_id+created_at composite index');
    }

    /**
     * Get all indexes for a given table.
     *
     * @param string $tableName
     * @return array<string>
     */
    private function getTableIndexes(string $tableName): array
    {
        // For SQLite
        $indexes = DB::select("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name=?", [$tableName]);
        
        return array_map(fn($index) => $index->name, $indexes);
    }
}
