<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class StaffMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user || !in_array($user->role, ['admin', 'staff'])) {
            return response()->json([
                'message' => 'Unauthorized. Staff access required.',
            ], 403);
        }

        return $next($request);
    }
}
