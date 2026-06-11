import { and, eq, gt } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/db';
import { agentAuthCodes } from '@/db/schema';
import { createApiKey, findOrCreateOperator } from '@/lib/agent-api-auth';
import { hashSecret } from '@/lib/agent-crypto';
import { rateLimit } from '@/lib/rate-limit';
import { isValidEmail } from '@/lib/validation';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const ipLimit = rateLimit(`agent-auth-verify:ip:${ip}`, {
    maxRequests: 20,
    windowMs: 60 * 60 * 1000,
  });
  if (!ipLimit.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: { email?: unknown; code?: unknown; keyName?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const code = typeof body.code === 'string' ? body.code.trim() : '';
  const keyName =
    typeof body.keyName === 'string' && body.keyName.trim()
      ? body.keyName.trim().slice(0, 64)
      : `agent-${crypto.randomUUID().slice(0, 8)}`;

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
  }

  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: 'A 6-digit code is required' }, { status: 400 });
  }

  const now = new Date();
  const codeHash = await hashSecret(code);
  const [stored] = await db
    .select()
    .from(agentAuthCodes)
    .where(
      and(
        eq(agentAuthCodes.email, email),
        eq(agentAuthCodes.codeHash, codeHash),
        gt(agentAuthCodes.expiresAt, now),
      ),
    )
    .limit(1);

  if (!stored) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 });
  }

  await db.delete(agentAuthCodes).where(eq(agentAuthCodes.email, email));

  const operator = await findOrCreateOperator(email);
  const { row, rawKey } = await createApiKey(operator.id, keyName);

  return NextResponse.json({
    apiKey: rawKey,
    apiKeyId: row.id,
    userId: operator.id,
    email: operator.email,
    keyName,
    docs_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://karte.cc'}/llms.txt`,
    message: 'Save this API key now. It will not be shown again.',
  });
}
