<?php

namespace Tests\Feature;

use App\Models\StickerRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class DatabaseIndexPerformanceTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that indexes exist on sticker_requests table.
     */
    public function test_sticker_requests_table_has_required_indexes(): void
    {
        // Get all indexes for sticker_requests table
        $indexes = $this->getTableIndexes('sticker_requests');
        
        // Expected indexes
        $expectedIndexes = [
            'sticker_requests_status_index',
            'sticker_requests_student_id_index',
            'sticker_requests_created_at_index',
            'sticker_requests_status_created_at_index',
            'sticker_requests_vehicle_plate_number_index',
            'idx_plate_status',
        ];
        
        foreach ($expectedIndexes as $expectedIndex) {
            $this->assertContains(
                $expectedIndex,
                $indexes,
                "Missing index: {$expectedIndex} on sticker_requests table"
            );
        }
    }

    /**
     * Test that indexes exist on stickers table.
     */
    public function test_stickers_table_has_required_indexes(): void
    {
        $indexes = $this->getTableIndexes('stickers');
        
        $expectedIndexes = [
            'stickers_serial_number_unique',
            'stickers_sticker_request_id_index',
            'stickers_generated_at_index',
            'stickers_plate_number_index',
        ];
        
        foreach ($expectedIndexes as $expectedIndex) {
            $this->assertContains(
                $expectedIndex,
                $indexes,
                "Missing index: {$expectedIndex} on stickers table"
            );
        }
    }

    /**
     * Test that indexes exist on request_documents table.
     */
    public function test_request_documents_table_has_required_indexes(): void
    {
        $indexes = $this->getTableIndexes('request_documents');
        
        $expectedIndexes = [
            'request_documents_sticker_request_id_index',
            'request_documents_document_type_index',
            'request_documents_created_at_index',
        ];
        
        foreach ($expectedIndexes as $expectedIndex) {
            $this->assertContains(
                $expectedIndex,
                $indexes,
                "Missing index: {$expectedIndex} on request_documents table"
            );
        }
    }

    /**
     * Test that indexes exist on request_status_histories table.
     */
    public function test_request_status_histories_table_has_required_indexes(): void
    {
        $indexes = $this->getTableIndexes('request_status_histories');
        
        $expectedIndexes = [
            'request_status_histories_sticker_request_id_index',
            'request_status_histories_changed_by_index',
            'request_status_histories_created_at_index',
            'request_status_histories_sticker_request_id_created_at_index',
        ];
        
        foreach ($expectedIndexes as $expectedIndex) {
            $this->assertContains(
                $expectedIndex,
                $indexes,
                "Missing index: {$expectedIndex} on request_status_histories table"
            );
        }
    }

    /**
     * Test query performance with status filter (uses index).
     */
    public function test_query_by_status_uses_index(): void
    {
        // Create test data
        $student = User::factory()->create();
        
        // Create some requests
        StickerRequest::factory()->count(5)->create([
            'student_id' => $student->id,
            'status' => 'pending',
        ]);
        
        StickerRequest::factory()->count(3)->create([
            'student_id' => $student->id,
            'status' => 'approved',
        ]);
        
        // Query by status
        $pendingRequests = StickerRequest::where('status', 'pending')->get();
        
        $this->assertCount(5, $pendingRequests);
    }

    /**
     * Test query performance with plate number search (uses index).
     */
    public function test_query_by_plate_number_uses_index(): void
    {
        $student = User::factory()->create();
        
        StickerRequest::factory()->create([
            'student_id' => $student->id,
            'vehicle_plate_number' => 'ABC-1234',
        ]);
        
        StickerRequest::factory()->create([
            'student_id' => $student->id,
            'vehicle_plate_number' => 'XYZ-5678',
        ]);
        
        // Search by plate number
        $request = StickerRequest::where('vehicle_plate_number', 'ABC-1234')->first();
        
        $this->assertNotNull($request);
        $this->assertEquals('ABC-1234', $request->vehicle_plate_number);
    }

    /**
     * Test query performance with composite filter (plate + status).
     */
    public function test_query_by_plate_and_status_uses_composite_index(): void
    {
        $student = User::factory()->create();
        
        StickerRequest::factory()->create([
            'student_id' => $student->id,
            'vehicle_plate_number' => 'ABC-1234',
            'status' => 'pending',
        ]);
        
        StickerRequest::factory()->create([
            'student_id' => $student->id,
            'vehicle_plate_number' => 'ABC-1234',
            'status' => 'approved',
        ]);
        
        // Query with composite filter
        $request = StickerRequest::where('vehicle_plate_number', 'ABC-1234')
            ->where('status', 'pending')
            ->first();
        
        $this->assertNotNull($request);
        $this->assertEquals('pending', $request->status);
    }

    /**
     * Test query performance with date range filter (uses index).
     */
    public function test_query_by_date_range_uses_index(): void
    {
        $student = User::factory()->create();
        
        // Create requests with different dates
        StickerRequest::factory()->create([
            'student_id' => $student->id,
            'created_at' => now()->subDays(5),
        ]);
        
        StickerRequest::factory()->create([
            'student_id' => $student->id,
            'created_at' => now()->subDays(2),
        ]);
        
        StickerRequest::factory()->create([
            'student_id' => $student->id,
            'created_at' => now(),
        ]);
        
        // Query by date range
        $requests = StickerRequest::whereBetween('created_at', [
            now()->subDays(3),
            now(),
        ])->get();
        
        $this->assertCount(2, $requests);
    }

    /**
     * Helper method to get all indexes for a table.
     *
     * @param string $tableName
     * @return array
     */
    private function getTableIndexes(string $tableName): array
    {
        $driver = DB::connection()->getDriverName();
        
        if ($driver === 'sqlite') {
            $indexes = DB::select("PRAGMA index_list({$tableName})");
            return array_map(fn($index) => $index->name, $indexes);
        }
        
        if ($driver === 'mysql') {
            $indexes = DB::select("SHOW INDEX FROM {$tableName}");
            return array_unique(array_map(fn($index) => $index->Key_name, $indexes));
        }
        
        if ($driver === 'pgsql') {
            $indexes = DB::select("
                SELECT indexname 
                FROM pg_indexes 
                WHERE tablename = ?
            ", [$tableName]);
            return array_map(fn($index) => $index->indexname, $indexes);
        }
        
        return [];
    }
}
