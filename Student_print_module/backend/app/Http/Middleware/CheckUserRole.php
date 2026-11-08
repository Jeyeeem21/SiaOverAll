<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // Get authenticated user from Sanctum
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }
        
        // Check if user has required role
        if (!in_array($user->role, $roles)) {
            return response()->json([
                'message' => 'Unauthorized. You do not have permission to perform this action.',
                'required_roles' => $roles,
                'your_role' => $user->role
            ], 403);
        }

        // Add role to request for controller use
        $request->merge(['user_role' => $user->role]);
        
        return $next($request);
    }
}
