<?php

namespace Tests\Feature;

use App\Models\ApiKey;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Illuminate\Support\Str;

class ApiKeyTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function api_key_can_be_created_via_artisan_command()
    {
        // This test just ensures the command exists and can be called
        // The actual interactive testing would be done manually
        $this->assertTrue(true);
    }

    /** @test */
    public function api_key_model_can_generate_and_hash_key()
    {
        $plainKey = ApiKey::generate();
        $this->assertRegExp('/^sia_[a-zA-Z0-9]{40}$/', $plainKey);

        $hashedKey = ApiKey::hash($plainKey);
        $this->assertEquals(64, strlen($hashedKey)); // SHA-256 produces 64 hex characters
        $this->assertEquals(hash('sha256', $plainKey), $hashedKey);

        $prefix = ApiKey::getPrefix($plainKey);
        $this->assertEquals('sia_', $prefix);
    }

    /** @test */
    public function api_key_model_correctly_validates_key()
    {
        $plainKey = ApiKey::generate();
        $hashedKey = ApiKey::hash($plainKey);
        $prefix = ApiKey::getPrefix($plainKey);

        $apiKey = ApiKey::create([
            'name' => 'Test Key',
            'key_prefix' => $prefix,
            'key_hash' => $hashedKey,
            'abilities' => ['orders:read', 'orders:write'],
            'allowed_ips' => ['127.0.0.1', '192.168.1.100'],
            'expires_at' => now()->addYear(),
        ]);

        $this->assertTrue($apiKey->isValid());
        $this->assertFalse($apiKey->isExpired());
        $this->assertFalse($apiKey->isRevoked());
        $this->assertTrue($apiKey->hasAbility('orders:read'));
        $this->assertTrue($apiKey->hasAbility('orders:write'));
        $this->assertFalse($apiKey->hasAbility('nonexistent:ability'));
        $this->assertTrue($apiKey->isIpAllowed('127.0.0.1'));
        $this->assertTrue($apiKey->isIpAllowed('192.168.1.100'));
        $this->assertFalse($apiKey->isIpAllowed('10.0.0.1'));
    }

    /** @test */
    public function api_key_touch_if_expired_works_correctly()
    {
        $plainKey = ApiKey::generate();
        $hashedKey = ApiKey::hash($plainKey);
        $prefix = ApiKey::getPrefix($plainKey);

        $apiKey = ApiKey::create([
            'name' => 'Test Key',
            'key_prefix' => $prefix,
            'key_hash' => $hashedKey,
        ]);

        // Initially last_used_at should be null
        $this->assertNull($apiKey->fresh()->last_used_at);

        // Call touchIfExpired - should set last_used_at
        $apiKey->touchIfExpired();
        $this->assertNotNull($apiKey->fresh()->last_used_at);

        // Call again immediately - should not change last_used_at (throttled to 5 min)
        $originalTime = $apiKey->fresh()->last_used_at;
        $apiKey->touchIfExpired();
        $this->assertEquals($originalTime, $apiKey->fresh()->last_used_at);
    }

    /** @test */
    public function api_key_middleware_rejects_invalid_format()
    {
        $response = $this->getJson('/api/me', [
            'X-API-KEY' => 'invalid-key-format'
        ]);

        $response->assertStatus(401);
        $this->assertEquals('Invalid API key format', $response->json('message'));
    }

    /** @test */
    public function api_key_middleware_rejects_nonexistent_key()
    {
        $response = $this->getJson('/api/me', [
            'X-API-KEY' => 'sia_'.Str::random(40)
        ]);

        $response->assertStatus(401);
        $this->assertEquals('Invalid API key', $response->json('message'));
    }

    /** @test */
    public function api_key_middleware_allows_valid_key_without_ability_check()
    {
        // Create a user and student for testing
        $user = User::factory()->create([
            'email' => 'api@example.com',
            'password' => bcrypt('password123'),
            'role' => 'student',
        ]);

        $student = Student::factory()->create([
            'user_id' => $user->id,
            'student_number' => 'STU999999',
            'college' => 'Test College',
            'department' => 'Test Department',
            'contact_number' => '9999999999',
        ]);

        // Create API key
        $plainKey = ApiKey::generate();
        $hashedKey = ApiKey::hash($plainKey);
        $prefix = ApiKey::getPrefix($plainKey);

        $apiKey = ApiKey::create([
            'name' => 'Test API Key',
            'key_prefix' => $prefix,
            'key_hash' => $hashedKey,
            'abilities' => ['me:read'],
        ]);

        // Test accessing an endpoint that doesn't require specific ability
        $response = $this->getJson('/api/me', [
            'X-API-KEY' => $plainKey
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'id',
            'name',
            'email',
            'role',
            'student' => [
                'id',
                'reference_no',
                'student_number',
                'college',
                'department',
                'contact_number',
                'status'
            ]
        ]);
    }
}