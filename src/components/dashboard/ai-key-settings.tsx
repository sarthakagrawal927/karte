'use client';

import { useState } from 'react';

export function AiKeySettings({ hasKey }: { hasKey: boolean }) {
  const [aiKey, setAiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [configured, setConfigured] = useState(hasKey);

  async function handleSave() {
    if (!aiKey.trim()) return;
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/settings/ai-key', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiKey: aiKey.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error || 'Failed to save');
        return;
      }

      setMessage('AI key saved successfully');
      setConfigured(true);
      setAiKey('');
    } catch {
      setMessage('Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-xl">
      <h2 className="mb-1 text-lg font-semibold text-white">AI API Key</h2>
      <p className="mb-4 text-sm text-gray-400">
        {configured
          ? 'Your AI key is configured. Enter a new key to update it.'
          : 'Add your AI API key to enable the chat feature.'}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="password"
          value={aiKey}
          onChange={(e) => setAiKey(e.target.value)}
          placeholder={configured ? '••••••••••••••••' : 'Enter your AI API key'}
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-white/30"
        />
        <button
          onClick={handleSave}
          disabled={saving || !aiKey.trim()}
          className="w-full rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-100 disabled:opacity-50 sm:w-auto"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {message && (
        <p className={`mt-2 text-sm ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}

      {!configured && (
        <p className="mt-3 text-xs text-yellow-400/80">
          Chat will not work until an AI key is configured.
        </p>
      )}
    </div>
  );
}
