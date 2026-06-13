import 'server-only';

import { and, eq, isNull } from 'drizzle-orm';

import { db } from '@/db';
import { apiKeys, user } from '@/db/schema';

import {
  apiKeyPrefix,
  generateApiKeyRaw,
  hashSecret,
  isApiKeyFormat,
} from './agent-crypto';

export async function authenticateApiKey(
  authorization: string | null,
): Promise<{ userId: string; apiKeyId: string } | null> {
  if (!authorization?.startsWith('Bearer ')) return null;

  const rawKey = authorization.slice('Bearer '.length).trim();
  if (!isApiKeyFormat(rawKey)) return null;

  const keyHash = await hashSecret(rawKey);
  const row = await db.query.apiKeys.findFirst({
    where: and(eq(apiKeys.keyHash, keyHash), isNull(apiKeys.revokedAt)),
  });

  if (!row) return null;
  return { userId: row.userId, apiKeyId: row.id };
}

export async function createApiKey(userId: string, name: string) {
  const rawKey = generateApiKeyRaw();
  const keyHash = await hashSecret(rawKey);
  const now = new Date();

  const [row] = await db
    .insert(apiKeys)
    .values({
      userId,
      name,
      keyPrefix: apiKeyPrefix(rawKey),
      keyHash,
      createdAt: now,
    })
    .returning();

  return { row, rawKey };
}

export async function findOrCreateOperator(email: string) {
  const normalized = email.trim().toLowerCase();
  const existing = await db.query.user.findFirst({
    where: eq(user.email, normalized),
  });

  if (existing) return existing;

  const now = new Date();
  const localPart = normalized.split('@')[0] ?? 'operator';

  const [created] = await db
    .insert(user)
    .values({
      id: crypto.randomUUID(),
      name: localPart,
      email: normalized,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return created;
}
