<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\HttpFoundation\Response;

class RecordAuditTrail
{
    private const MODULE = 'Student Account';
    private const SECRET_KEYS = ['password', 'current_password', 'new_password', 'new_password_confirmation', 'token', 'authorization', 'file', 'photo', 'avatar', 'signature'];
    private static ?bool $auditTableExists = null;

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'], true)
            && $response->getStatusCode() < 400
            && !str_contains($request->path(), 'login')
            && !str_contains($request->path(), 'check-email')
            && !str_contains($request->path(), 'check-student-number')) {
            $this->record($request, $response);
        }
        return $response;
    }

    private function record(Request $request, Response $response): void
    {
        try {
            if (!(self::$auditTableExists ??= Schema::hasTable('audit_trail_logs'))) return;
            $actor = $request->user();
            $parameters = $request->route()?->parametersWithoutNulls() ?? [];
            $entityId = collect($parameters)->map(fn ($value) => is_object($value) ? $value->getKey() : $value)->filter(fn ($value) => is_scalar($value))->first();
            $segments = collect(explode('/', trim($request->path(), '/')))->reject(fn ($value) => in_array($value, ['api', 'me', 'staff', 'admin'], true) || is_numeric($value));
            $tail = $segments->last();
            $action = match ($request->method()) { 'POST' => in_array($tail, ['approve', 'reject', 'cancel', 'mark-printed', 'generate'], true) ? str_replace('-', ' ', $tail) : 'created', 'PUT', 'PATCH' => 'updated', 'DELETE' => 'deleted', default => strtolower($request->method()) };
            DB::table('audit_trail_logs')->insert([
                'actor_id' => $actor?->getAuthIdentifier(), 'actor_name' => $actor?->full_name ?? $actor?->name ?? $actor?->email ?? 'Student/System', 'actor_role' => $actor?->role,
                'module' => self::MODULE, 'action' => $action, 'entity_type' => $segments->first() ?? 'system', 'entity_id' => $entityId,
                'method' => $request->method(), 'endpoint' => '/' . $request->path(), 'status_code' => $response->getStatusCode(), 'ip_address' => $request->ip(), 'user_agent' => substr((string) $request->userAgent(), 0, 1000),
                'properties' => json_encode($this->auditProperties($request, $response)), 'occurred_at' => now('Asia/Manila')->format('Y-m-d H:i:s'),
            ]);
        } catch (\Throwable $exception) { report($exception); }
    }

    private function auditProperties(Request $request, Response $response): array
    {
        $payload = json_decode($response->getContent(), true);
        $record = is_array($payload) ? ($payload['student'] ?? $payload['order'] ?? $payload['data'] ?? $payload) : [];

        return [
            'request' => collect($request->except(self::SECRET_KEYS))->map(fn ($value) => is_string($value) ? substr($value, 0, 500) : $value)->take(30)->all(),
            'result' => is_array($record) ? collect($record)->only(['id', 'student_number', 'reference_no', 'order_number', 'full_name', 'total_amount', 'status', 'message'])->all() : [],
        ];
    }
}
