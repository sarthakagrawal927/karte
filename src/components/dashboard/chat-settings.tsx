'use client';

import { useState } from 'react';
import {
  CHAT_POSITIONS,
  type ChatPosition,
} from '@/lib/themes';

interface ChatSettingsProps {
  pageId: string;
  initialChatEnabled: boolean;
  initialSystemPrompt: string;
  initialChatPosition: ChatPosition;
}

export function ChatSettings({
  pageId,
  initialChatEnabled,
  initialSystemPrompt,
  initialChatPosition,
}: ChatSettingsProps) {
  const [chatEnabled, setChatEnabled] = useState(initialChatEnabled);
  const [systemPrompt, setSystemPrompt] = useState(initialSystemPrompt);
  const [chatPosition, setChatPosition] = useState(initialChatPosition);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSave() {
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch(`/api/pages/${pageId}/chat-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatEnabled,
          chatSystemPrompt: systemPrompt,
          chatPosition,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error || 'Failed to save');
        return;
      }

      setMessage('Saved successfully');
    } catch {
      setMessage('Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-white">Chat Settings</h1>

      <div className="space-y-6 rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-xl">
        {/* Enable Chat Toggle */}
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-medium text-white">Enable Chat</h3>
            <p className="text-xs text-gray-400">
              Allow visitors to chat with your AI assistant
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={chatEnabled}
            onClick={() => setChatEnabled(!chatEnabled)}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-gray-950 ${
              chatEnabled ? 'bg-blue-500' : 'bg-white/20'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-lg transition-transform duration-200 ${
                chatEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* System Prompt */}
        <div>
          <label
            htmlFor="chatPosition"
            className="mb-2 block text-sm font-medium text-white"
          >
            Chat Position
          </label>
          <p className="mb-2 text-xs text-gray-400">
            Keep the widget anchored at the bottom, with your preferred side.
          </p>
          <select
            id="chatPosition"
            value={chatPosition}
            onChange={(e) => setChatPosition(e.target.value as ChatPosition)}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm text-white backdrop-blur-sm transition focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20"
          >
            {CHAT_POSITIONS.map((position) => (
              <option
                key={position.value}
                value={position.value}
                className="bg-gray-900"
              >
                {position.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="systemPrompt"
            className="mb-2 block text-sm font-medium text-white"
          >
            System Prompt
          </label>
          <p className="mb-2 text-xs text-gray-400">
            Instructions for how the AI should behave when chatting with
            visitors
          </p>
          <textarea
            id="systemPrompt"
            rows={6}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="e.g. You are a helpful assistant representing [name]. Answer questions based on the info blocks provided..."
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 backdrop-blur-sm transition focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20"
          />
        </div>

        {/* Save Button */}
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-gray-100 disabled:opacity-50 sm:w-auto"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          {message && (
            <p
              className={`text-sm ${
                message.includes('success')
                  ? 'text-green-400'
                  : 'text-red-400'
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
