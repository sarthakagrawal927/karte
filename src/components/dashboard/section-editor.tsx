'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PAGE_SECTION_TYPES,
  getPageSectionLabel,
  type PageSectionType,
} from '@/lib/page-sections';

type Section = {
  id: string;
  pageId: string;
  type: string;
  title: string;
  content: string | null;
  buttonLabel: string | null;
  buttonUrl: string | null;
  sortOrder: number | null;
  enabled: boolean | null;
};

function sortSections(items: Section[]) {
  return [...items].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );
}

export function SectionEditor({
  pageId,
  initialSections,
}: {
  pageId: string;
  initialSections: Section[];
}) {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>(sortSections(initialSections));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [type, setType] = useState<PageSectionType>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [buttonLabel, setButtonLabel] = useState('');
  const [buttonUrl, setButtonUrl] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);

  function resetForm() {
    setEditingId(null);
    setType('text');
    setTitle('');
    setContent('');
    setButtonLabel('');
    setButtonUrl('');
    setEnabled(true);
  }

  function startEdit(section: Section) {
    setEditingId(section.id);
    setType(section.type as PageSectionType);
    setTitle(section.title);
    setContent(section.content ?? '');
    setButtonLabel(section.buttonLabel ?? '');
    setButtonUrl(section.buttonUrl ?? '');
    setEnabled(section.enabled ?? true);
  }

  async function persistOrder(nextSections: Section[]) {
    const response = await fetch(`/api/pages/${pageId}/sections`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderedSectionIds: nextSections.map((section) => section.id),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to reorder sections');
    }

    const updated = (await response.json()) as Section[];
    setSections(sortSections(updated));
    router.refresh();
  }

  async function moveSection(sectionId: string, direction: -1 | 1) {
    const index = sections.findIndex((section) => section.id === sectionId);
    const targetIndex = index + direction;

    if (index < 0 || targetIndex < 0 || targetIndex >= sections.length) {
      return;
    }

    const nextSections = [...sections];
    [nextSections[index], nextSections[targetIndex]] = [
      nextSections[targetIndex],
      nextSections[index],
    ];

    setReordering(true);
    setSections(nextSections);

    try {
      await persistOrder(nextSections);
    } catch {
      setSections(sortSections(sections));
      alert('Failed to reorder sections');
    } finally {
      setReordering(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    const trimmedButtonLabel = buttonLabel.trim();
    const trimmedButtonUrl = buttonUrl.trim();

    if (!trimmedTitle || !trimmedContent) {
      return;
    }

    if (type === 'cta' && (!trimmedButtonLabel || !trimmedButtonUrl)) {
      alert('CTA sections need both a button label and URL');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        type,
        title: trimmedTitle,
        content: trimmedContent,
        buttonLabel: type === 'cta' ? trimmedButtonLabel : null,
        buttonUrl: type === 'cta' ? trimmedButtonUrl : null,
        enabled,
      };

      const response = await fetch(
        editingId
          ? `/api/pages/${pageId}/sections/${editingId}`
          : `/api/pages/${pageId}/sections`,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save section');
      }

      const saved = (await response.json()) as Section;
      if (editingId) {
        setSections((prev) =>
          sortSections(prev.map((section) => (section.id === saved.id ? saved : section))),
        );
      } else {
        setSections((prev) => sortSections([...prev, saved]));
      }

      resetForm();
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save section');
    } finally {
      setSaving(false);
    }
  }

  async function removeSection(sectionId: string) {
    const response = await fetch(`/api/pages/${pageId}/sections/${sectionId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      alert('Failed to delete section');
      return;
    }

    setSections((prev) => prev.filter((section) => section.id !== sectionId));
    if (editingId === sectionId) {
      resetForm();
    }
    router.refresh();
  }

  const isCta = type === 'cta';
  const isSocial = type === 'social';

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-xl">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {editingId ? 'Edit Section' : 'Add a Section'}
            </h2>
            <p className="text-sm text-gray-400">
              Build structured blocks for the public page.
            </p>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="w-full rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white transition hover:bg-white/10 sm:w-auto"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as PageSectionType)}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white/40"
              >
                {PAGE_SECTION_TYPES.map((item) => (
                  <option key={item.value} value={item.value} className="bg-gray-900">
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400">
                Enabled
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={() => setEnabled(!enabled)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  enabled ? 'bg-blue-500' : 'bg-white/20'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-lg transition-transform duration-200 ${
                    enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-400">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Section heading"
              className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-white/40"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-400">
              Content
            </label>
            {isSocial && (
              <p className="mb-2 text-xs text-gray-500">
                One social link per line using `Label | https://example.com`.
              </p>
            )}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder={
                type === 'social'
                  ? 'X | https://x.com/yourname\nLinkedIn | https://linkedin.com/in/yourname'
                  : type === 'testimonial'
                  ? 'A short testimonial quote...'
                  : type === 'contact'
                    ? 'Tell visitors what to send you...'
                    : 'Section body copy...'
              }
              className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-white/40"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400">
                Button Label {isCta ? '' : '(CTA only)'}
              </label>
              <input
                value={buttonLabel}
                onChange={(e) => setButtonLabel(e.target.value)}
                disabled={!isCta}
                placeholder="e.g. View Case Study"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-white/40 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400">
                Button URL {isCta ? '' : '(CTA only)'}
              </label>
              <input
                value={buttonUrl}
                onChange={(e) => setButtonUrl(e.target.value)}
                disabled={!isCta}
                placeholder="https://example.com"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-white/40 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-white px-5 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-100 disabled:opacity-50 sm:w-auto"
            >
              {saving ? 'Saving...' : editingId ? 'Save Section' : 'Add Section'}
            </button>
          </div>
        </form>
      </div>

      {sections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/20 bg-white/[0.03] p-8 text-center">
          <p className="text-gray-400">No sections yet. Add the first one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className={`rounded-2xl border bg-white/5 p-5 backdrop-blur-xl transition ${
                section.id === editingId
                  ? 'border-white/40'
                  : 'border-white/20'
              } ${reordering ? 'opacity-80' : ''}`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-gray-300">
                      #{index + 1}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-cyan-200">
                      {getPageSectionLabel(section.type)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        section.enabled ? 'bg-green-500/15 text-green-300' : 'bg-gray-500/15 text-gray-400'
                      }`}
                    >
                      {section.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className="truncate text-lg font-semibold text-white">
                    {section.title}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-300">
                    {section.content}
                  </p>
                  {section.type === 'cta' && section.buttonLabel && section.buttonUrl && (
                    <p className="mt-3 text-sm text-blue-300">
                      Button: {section.buttonLabel} - {section.buttonUrl}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(section)}
                    className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white transition hover:bg-white/10"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(section.id, -1)}
                    disabled={index === 0 || reordering}
                    className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(section.id, 1)}
                    disabled={index === sections.length - 1 || reordering}
                    className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSection(section.id)}
                    className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-red-400 transition hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
