import 'server-only';
import { headers } from 'next/headers';
import { connection } from 'next/server';
import { createAuth } from './auth';

/**
 * Returns the current session from server context
 * (RSC, Route Handlers, Server Actions). Server-only.
 */
export async function getSession() {
  await connection();
  return createAuth().api.getSession({ headers: await headers() });
}
