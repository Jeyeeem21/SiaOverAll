<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserRoleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that role field exists and has default value
     */
    public function test_user_has_default_role(): void
    {
        $user = User::factory()->create();
        
        $this->assertNotNull($user->role);
        $this->assertEquals('user', $user->role);
    }

    /**
     * Test that role can be set to staff
     */
    public function test_user_can_be_staff(): void
    {
        $user = User::factory()->create([
            'role' => 'staff',
        ]);
        
        $this->assertEquals('staff', $user->role);
        $this->assertTrue($user->isStaff());
    }

    /**
     * Test that regular user is not staff
     */
    public function test_regular_user_is_not_staff(): void
    {
        $user = User::factory()->create([
            'role' => 'user',
        ]);
        
        $this->assertFalse($user->isStaff());
    }

    /**
     * Test that staff factory method works
     */
    public function test_staff_factory_method(): void
    {
        $user = User::factory()->staff()->create();
        
        $this->assertEquals('staff', $user->role);
        $this->assertTrue($user->isStaff());
    }

    /**
     * Test that role field is fillable
     */
    public function test_role_is_fillable(): void
    {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'role' => 'staff',
        ]);
        
        $this->assertEquals('staff', $user->role);
    }

    /**
     * Test that role index exists
     */
    public function test_role_column_has_index(): void
    {
        $indexes = \DB::select("SELECT * FROM sqlite_master WHERE type='index' AND tbl_name='users'");
        
        $roleIndexExists = collect($indexes)->contains(function ($index) {
            return str_contains($index->name, 'role');
        });
        
        $this->assertTrue($roleIndexExists, 'Role column should have an index');
    }
}
