// lib/api-helpers.ts
// Shared utilities for API route handlers
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

/** Returns the authenticated session or a 401 response */
export async function requireAuth() {
  const session = await auth();
  if (!session) {
    return {
      session: null,
      error: NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      ),
    };
  }
  return { session, error: null };
}

/** Returns 403 if the user role is not in the allowed list */
export function requireRole(
  role: string,
  allowed: string[]
): NextResponse | null {
  if (!allowed.includes(role)) {
    return NextResponse.json(
      { success: false, error: 'Forbidden. Insufficient permissions.' },
      { status: 403 }
    );
  }
  return null;
}

/** Standard success response — wraps payload in { success: true, data } */
export function ok(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

/** Standard error response — wraps payload in { success: false, error } */
export function fail(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}
