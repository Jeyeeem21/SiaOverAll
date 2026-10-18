<?php

namespace App\Console\Commands;

use App\Models\ApiKey;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

#[Signature('apikey:create')]
#[Description('Create a new API key')]
class ApiKeyCreate extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $name = $this->ask('Enter a name for the API key');

        $abilitiesInput = $this->ask('Enter abilities (comma-separated, or leave empty for none)');
        $abilities = $abilitiesInput ? array_map('trim', explode(',', $abilitiesInput)) : [];

        $ipsInput = $this->ask('Enter allowed IPs (comma-separated, or leave empty for any)');
        $allowedIps = $ipsInput ? array_map('trim', explode(',', $ipsInput)) : [];

        $expiresInput = $this->ask('Enter expiration date (Y-m-d H:i:s, or leave empty for none)');
        $expiresAt = $expiresInput ? \Illuminate\Support\Carbon::parse($expiresInput) : null;

        // Generate the API key
        $plainKey = ApiKey::generate();
        $keyHash = ApiKey::hash($plainKey);
        $keyPrefix = ApiKey::getPrefix($plainKey);

        // Create the API key record
        $apiKey = ApiKey::create([
            'name' => $name,
            'key_prefix' => $keyPrefix,
            'key_hash' => $keyHash,
            'abilities' => $abilities,
            'allowed_ips' => $allowedIps,
            'expires_at' => $expiresAt,
        ]);

        $this->info('API key created successfully!');
        $this->line('Name: '.$apiKey->name);
        $this->line('Key: '.$plainKey);
        $this->line('Key Prefix: '.$apiKey->key_prefix);
        $this->line('Abilities: '.implode(', ', $abilities));
        $this->line('Allowed IPs: '.implode(', ', $allowedIps));
        $this->line('Expires at: '.$expiresAt?->toDateTimeString() : 'Never');
        $this->warn('⚠️  This is the only time the key will be displayed. Store it securely!');

        return 0;
    }
}
