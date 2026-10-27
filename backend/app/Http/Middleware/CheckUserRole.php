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
        // For testing, get role from query parameter or default to Admin
        $userRole = $request->query('role', 'Admin');
        
        // You can also get from session or authenticated user
        // $userRole = $request->user()?->role ?? 'Student';
        
        // Check if user has required role
        if (!in_array($userRole, $roles)) {
            return response()->json([
                'message' => 'Unauthorized. You do not have permission to perform this action.',
                'required_roles' => $roles,
                'your_role' => $userRole
            ], 403);
        }

        // Add role to request for controller use
        $request->merge(['user_role' => $userRole]);
        
        return $next($request);
    }
}
