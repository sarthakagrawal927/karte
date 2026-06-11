import assert from 'node:assert/strict';
import test from 'node:test';

import {
  generateApiKeyRaw,
  generateAuthCode,
  hashSecret,
  isApiKeyFormat,
} from '../src/lib/agent-crypto.ts';
import { normalizeAgentCapabilities } from '../src/lib/agent-capabilities.ts';

test('generateAuthCode returns a 6-digit string', () => {
  const code = generateAuthCode();
  assert.match(code, /^\d{6}$/);
});

test('generateApiKeyRaw uses kk_ prefix', () => {
  const key = generateApiKeyRaw();
  assert.ok(isApiKeyFormat(key));
});

test('hashSecret is deterministic for the same input', async () => {
  const a = await hashSecret('hello');
  const b = await hashSecret('hello');
  assert.equal(a, b);
});

test('normalizeAgentCapabilities accepts valid capability rows', () => {
  const result = normalizeAgentCapabilities([
    { id: 'check_inventory', description: 'Read inventory levels', label: 'Check inventory' },
  ]);
  assert.deepEqual(result, [
    {
      id: 'check_inventory',
      description: 'Read inventory levels',
      label: 'Check inventory',
    },
  ]);
});

test('normalizeAgentCapabilities rejects invalid payloads', () => {
  assert.equal(normalizeAgentCapabilities('nope'), null);
  assert.equal(normalizeAgentCapabilities([{ id: '', description: 'x' }]), null);
});
