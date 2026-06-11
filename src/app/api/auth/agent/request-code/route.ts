import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/db';
import { agentAuthCodes } from '@/db/schema';
import { generateAuthCode, hashSecret } from '@/lib/agent-crypto';
import { sendAgentAuthCode } from '@/lib/agent-email';
import { rateLimit } from '@/lib/rate-limit';
import { isValidEmail } from '@/lib/validation';

const CODE_TTL_MS = 10 * 60 * 1000;

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const ipLimit = rateLimit(`agent-auth:ip:${ip}`, { maxRequests: 10, windowMs: 60 * 60 * 1000 });
  if (!ipLimit.ok) {
    return NextResponse.json(
      { error: 'Too many requests', retry_after: 3600 },
      { status: 429, headers: { 'Retry-After': '3600' } },
    );
  }

  let body: { email?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
  }

  const emailLimit = rateLimit(`agent-auth:email:${email}`, {
    maxRequests: 3,
    windowMs: 10 * 60 * 1000,
  });
  if (!emailLimit.ok) {
    return NextResponse.json(
      { error: 'Too many code requests for this email', retry_after: 600 },
      { status: 429, headers: { 'Retry-After': '600' } },
    );
  }

  const code = generateAuthCode();
  const codeHash = await hashSecret(code);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CODE_TTL_MS);

  await db.delete(agentAuthCodes).where(eq(agentAuthCodes.email, email));
  await db.insert(agentAuthCodes).values({
    id: crypto.randomUUID(),
    email,
    codeHash,
    expiresAt,
    createdAt: now,
  });

  try {
    await sendAgentAuthCode(email, code);
  } catch (error) {
    console.error('[agent-auth] failed to send code email', error);
    return NextResponse.json({ error: 'Could not send sign-in email' }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    email,
    expires_in_seconds: CODE_TTL_MS / 1000,
    message: 'Sign-in code sent. Check your email.',
  });
}
