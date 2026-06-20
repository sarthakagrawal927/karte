import { getCloudflareContext } from '@opennextjs/cloudflare';

const API_URL = process.env.SAASMAKER_API_URL!;
const ADMIN_KEY = process.env.SAASMAKER_ADMIN_KEY!;
const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || 'https://knowledgebase.sarthakagrawal927.workers.dev';

interface SaasMakerOptions {
  apiKey?: string;
}

type RagSearchResult = {
  document_id: string;
  chunk_id: string;
  chunk_content: string;
  score: number;
  metadata: Record<string, unknown>;
};

type ServiceBinding = {
  fetch(request: Request): Promise<Response>;
};

type CloudflareEnv = {
  RAG_SERVICE?: ServiceBinding;
  RAG_SERVICE_KEY?: string;
};

function headers(opts?: SaasMakerOptions): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-Project-Key': opts?.apiKey || ADMIN_KEY,
  };
}

function cloudflareEnv(): CloudflareEnv {
  try {
    const { env } = getCloudflareContext();
    return env as CloudflareEnv;
  } catch {
    return {};
  }
}

function ragServiceKey(): string {
  return process.env.RAG_SERVICE_KEY?.trim() || cloudflareEnv().RAG_SERVICE_KEY?.trim() || '';
}

function ragServiceBinding(): ServiceBinding | null {
  return cloudflareEnv().RAG_SERVICE ?? null;
}

async function ragFetch(path: string, init: RequestInit): Promise<Response> {
  const key = ragServiceKey();
  if (!key) throw new Error('RAG service key is not configured');
  const requestInit: RequestInit = {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      ...(init.headers ?? {}),
    },
  };
  const binding = ragServiceBinding();
  if (binding) return binding.fetch(new Request(`https://knowledgebase.internal${path}`, requestInit));
  return fetch(`${RAG_SERVICE_URL.replace(/\/+$/, '')}${path}`, requestInit);
}

function ragServiceConfigured(): boolean {
  return Boolean(ragServiceKey());
}

export async function createIndex(apiKey: string, name: string): Promise<{ id: string }> {
  if (ragServiceConfigured()) {
    const res = await ragFetch('/v1/indexes', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error(`Failed to create RAG index: ${await res.text()}`);
    return res.json();
  }

  const res = await fetch(`${API_URL}/v1/indexes`, {
    method: 'POST',
    headers: headers({ apiKey }),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(`Failed to create index: ${await res.text()}`);
  return res.json();
}

export async function ingestDocument(
  apiKey: string,
  indexId: string,
  content: string,
  metadata?: Record<string, unknown>
): Promise<{ id: string; chunks_created: number }> {
  if (ragServiceConfigured()) {
    const res = await ragFetch(`/v1/indexes/${indexId}/ingest`, {
      method: 'POST',
      body: JSON.stringify({ documents: [{ content, metadata }] }),
    });
    if (res.ok) {
      const data = await res.json() as { documents?: Array<{ document_id: string; chunks_created: number }> };
      const document = data.documents?.[0];
      if (!document) throw new Error('RAG ingest response was empty');
      return { id: document.document_id, chunks_created: document.chunks_created };
    }
    if (res.status !== 404) throw new Error(`Failed to ingest RAG document: ${await res.text()}`);
  }

  const res = await fetch(`${API_URL}/v1/indexes/${indexId}/documents`, {
    method: 'POST',
    headers: headers({ apiKey }),
    body: JSON.stringify({ content, metadata }),
  });
  if (!res.ok) throw new Error(`Failed to ingest document: ${await res.text()}`);
  return res.json();
}

export async function deleteDocument(apiKey: string, indexId: string, docId: string): Promise<void> {
  if (ragServiceConfigured()) {
    const res = await ragFetch(`/v1/documents/${docId}`, { method: 'DELETE' });
    if (res.ok) return;
    if (res.status !== 404) throw new Error(`Failed to delete RAG document: ${await res.text()}`);
  }

  const res = await fetch(`${API_URL}/v1/indexes/${indexId}/documents/${docId}`, {
    method: 'DELETE',
    headers: headers({ apiKey }),
  });
  if (!res.ok) throw new Error(`Failed to delete document: ${await res.text()}`);
}

export async function search(
  apiKey: string,
  indexId: string,
  query: string,
  topK = 5
): Promise<{ results: { document_id: string; chunk_content: string; score: number }[] }> {
  if (ragServiceConfigured()) {
    const res = await ragFetch(`/v1/indexes/${indexId}/query`, {
      method: 'POST',
      body: JSON.stringify({ query, top_k: topK }),
    });
    if (res.ok) {
      const data = await res.json() as { data?: RagSearchResult[] };
      return {
        results: (data.data ?? []).map((result) => ({
          document_id: result.document_id,
          chunk_content: result.chunk_content,
          score: result.score,
        })),
      };
    }
    if (res.status !== 404) throw new Error(`Failed to search RAG index: ${await res.text()}`);
  }

  const res = await fetch(`${API_URL}/v1/indexes/${indexId}/search`, {
    method: 'POST',
    headers: headers({ apiKey }),
    body: JSON.stringify({ query, top_k: topK }),
  });
  if (!res.ok) throw new Error(`Failed to search: ${await res.text()}`);
  return res.json();
}

export async function chatCompletion(
  apiKey: string,
  indexId: string,
  query: string,
  systemPrompt?: string
): Promise<ReadableStream> {
  const res = await fetch(`${API_URL}/v1/ai/rag`, {
    method: 'POST',
    headers: headers({ apiKey }),
    body: JSON.stringify({
      index_id: indexId,
      query,
      system_prompt: systemPrompt,
      stream: true,
    }),
  });
  if (!res.ok) throw new Error(`Chat failed: ${await res.text()}`);
  return res.body!;
}

export async function generateCompletion(
  apiKey: string,
  indexId: string,
  query: string,
  systemPrompt: string
): Promise<string> {
  const res = await fetch(`${API_URL}/v1/ai/rag`, {
    method: 'POST',
    headers: headers({ apiKey }),
    body: JSON.stringify({
      index_id: indexId,
      query,
      system_prompt: systemPrompt,
      stream: false,
    }),
  });
  if (!res.ok) throw new Error(`Generation failed: ${await res.text()}`);
  const data = await res.json();
  return data.response ?? data.text ?? JSON.stringify(data);
}

export function parseAIResponse<T>(raw: string): T {
  // Try direct JSON parse first
  try {
    return JSON.parse(raw);
  } catch {
    // Extract JSON from markdown code blocks
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) return JSON.parse(match[1].trim());
    // Try finding first { to last }
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start !== -1 && end > start) return JSON.parse(raw.slice(start, end + 1));
    throw new Error('Could not parse AI response as JSON');
  }
}
