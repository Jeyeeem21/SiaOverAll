<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\HttpFoundation\Response;

class RecordAuditTrail
{
    private const MODULE = 'Main System';

    private const SECRET_KEYS = [
        'password', 'current_password', 'new_password', 'new_password_confirmation',
        'token', 'authorization', 'file', 'photo', 'avatar', 'signature',
    ];

    private static ?bool $auditTableExists = null;

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($this->shouldRecord($request, $response)) {
            $this->record($request, $response);
        }

        return $response;
    }

    private function shouldRecord(Request $request, Response $response): bool
    {
        if (!in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
            return false;
        }

        if ($response->getStatusCode() >= 400 || str_contains($request->path(), 'check-email')) {
            return false;
        }

        return !str_contains($request->path(), 'login');
    }

    private function record(Request $request, Response $response): void
    {
        try {
            if (self::$auditTableExists ??= Schema::hasTable('audit_trail_logs')) {
                $actor = $request->user();
                $route = $request->route();
                $parameters = $route?->parametersWithoutNulls() ?? [];
                $entityId = collect($parameters)
                    ->map(fn ($value) => is_object($value) ? $value->getKey() : $value)
                    ->filter(fn ($value) => is_scalar($value))
                    ->first();

                AuditLog::create([
                    'actor_id' => $actor?->getAuthIdentifier(),
                    'actor_name' => $actor?->full_name ?? $actor?->name ?? $actor?->email ?? 'System',
                    'actor_role' => $actor?->role,
                    'module' => self::MODULE,
                    'action' => $this->actionName($request),
                    'entity_type' => $this->entityType($request),
                    'entity_id' => $entityId,
                    'method' => $request->method(),
                    'endpoint' => '/' . $request->path(),
                    'status_code' => $response->getStatusCode(),
                    'ip_address' => $request->ip(),
                    'user_agent' => substr((string) $request->userAgent(), 0, 1000),
                    'properties' => $this->auditProperties($request, $response),
                    'occurred_at' => now('Asia/Manila')->format('Y-m-d H:i:s'),
                ]);
            }
        } catch (\Throwable $exception) {
            report($exception);
        }
    }

    private function actionName(Request $request): string
    {
        $segment = collect(explode('/', trim($request->path(), '/')))
            ->reject(fn (string $value) => in_array($value, ['api', 'settings'], true) || is_numeric($value))
            ->last();

        return match ($request->method()) {
            'POST' => in_array($segment, ['complete', 'void', 'restock', 'release', 'reset-password', 'export'], true) ? str_replace('-', ' ', $segment) : 'created',
            'PUT', 'PATCH' => 'updated',
            'DELETE' => 'deleted',
            default => strtolower($request->method()),
        };
    }

    private function entityType(Request $request): string
    {
        return collect(explode('/', trim($request->path(), '/')))
            ->reject(fn (string $value) => in_array($value, ['api', 'settings'], true) || is_numeric($value))
            ->first() ?? 'system';
    }

    private function safeInput(Request $request): array
    {
        return collect($request->except(self::SECRET_KEYS))
            ->map(fn ($value) => is_string($value) ? substr($value, 0, 500) : $value)
            ->take(30)
            ->all();
    }

    private function auditProperties(Request $request, Response $response): array
    {
        $result = [];
        $payload = json_decode($response->getContent(), true);

        if (is_array($payload)) {
            $record = $payload['order'] ?? $payload['data'] ?? $payload;
            if (is_array($record)) {
                $result = collect($record)->only([
                    'id', 'order_id', 'order_number', 'student_number', 'reference_no',
                    'product_name', 'category_name', 'full_name', 'customer_name',
                    'total_amount', 'status', 'message',
                ])->all();
            }
        }

        return [
            'request' => $this->safeInput($request),
            'result' => $result,
        ];
    }
}
