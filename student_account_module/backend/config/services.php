<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'core' => [
        'api_url' => env('CORE_API_URL', 'http://localhost:8000/api'),
        'api_key' => env('CORE_API_KEY'),
        'api_key_header' => env('CORE_API_KEY_HEADER', 'X-API-KEY'),
        'api_key_scheme' => env('CORE_API_KEY_SCHEME'),
        'timeout' => env('CORE_API_TIMEOUT', 30),
        'endpoints' => [
            'orders' => env('CORE_API_ORDERS_ENDPOINT', '/orders'),
            'ping' => env('CORE_API_PING_ENDPOINT', '/ping'),
        ],
    ],

];
