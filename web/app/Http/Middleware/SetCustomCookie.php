<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SetCustomCookie
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $cookie_name = 'session_id';
        $cookie_value = 'your_session_value'; // Replace this with your session value

        $cookie = cookie($cookie_name, $cookie_value, 60, '/', null, true, true, false, 'None');

        // Add the cookie to the response
        $response = $next($request);
        return $response->withCookie($cookie);
    }
}
