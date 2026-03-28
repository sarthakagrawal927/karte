'use client';

import { useState, useCallback } from 'react';
import type { EncyclopediaContent } from '@/lib/generated-page-types';

interface EncyclopediaEditorProps {
  pageId: string;
  initialContent: EncyclopediaContent | null;
}

const inputClass =
  'w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 backdrop-blur-sm transition focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20';
const cardClass =
  'rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-xl';
const labelClass = 'mb-2 block text-sm font-medium text-white';
const descClass = 'mb-2 text-xs text-gray-400';
const btnPrimary =
  'rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-gray-100 disabled:opacity-50';
const btnSecondary =
  'rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50';
const btnDanger =
  'rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20';
const btnSmall =
  'rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10';

function emptyContent(): EncyclopediaContent {
  return {
    leadParagraph: '',
    infobox: {},
    sections: [{ heading: '', content: '' }],
    categories: [],
  };
}

export function EncyclopediaEditor({
  pageId,
  initialContent,
}: EncyclopediaEditorProps) {
  const [content, setContent] = useState<EncyclopediaContent>(
    initialContent ?? emptyContent(),
  );
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // ── Lead paragraph ──────────────────────────────────────────────────

  const setLeadParagraph = useCallback((value: string) => {
    setContent((c) => ({ ...c, leadParagraph: value }));
  }, []);

  // ── Infobox helpers ─────────────────────────────────────────────────

  const infoboxEntries = Object.entries(content.infobox);

  function setInfoboxKey(oldKey: string, newKey: string) {
    setContent((c) => {
      const entries = Object.entries(c.infobox);
      const updated = entries.map(([k, v]) =>
        k === oldKey ? [newKey, v] : [k, v],
      );
      return { ...c, infobox: Object.fromEntries(updated) };
    });
  }

  function setInfoboxValue(key: string, value: string) {
    setContent((c) => ({
      ...c,
      infobox: { ...c.infobox, [key]: value },
    }));
  }

  function addInfoboxRow() {
    setContent((c) => ({
      ...c,
      infobox: { ...c.infobox, '': '' },
    }));
  }

  function removeInfoboxRow(key: string) {
    setContent((c) => {
      const copy = { ...c.infobox };
      delete copy[key];
      return { ...c, infobox: copy };
    });
  }

  // ── Sections helpers ────────────────────────────────────────────────

  function setSectionHeading(index: number, heading: string) {
    setContent((c) => {
      const sections = [...c.sections];
      sections[index] = { ...sections[index], heading };
      return { ...c, sections };
    });
  }

  function setSectionContent(index: number, value: string) {
    setContent((c) => {
      const sections = [...c.sections];
      sections[index] = { ...sections[index], content: value };
      return { ...c, sections };
    });
  }

  function addSection() {
    setContent((c) => ({
      ...c,
      sections: [...c.sections, { heading: '', content: '' }],
    }));
  }

  function removeSection(index: number) {
    if (deleteConfirm !== index) {
      setDeleteConfirm(index);
      return;
    }
    setContent((c) => ({
      ...c,
      sections: c.sections.filter((_, i) => i !== index),
    }));
    setDeleteConfirm(null);
  }

  function moveSection(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= content.sections.length) return;
    setContent((c) => {
      const sections = [...c.sections];
      [sections[index], sections[target]] = [sections[target], sections[index]];
      return { ...c, sections };
    });
  }

  // ── Categories helpers ──────────────────────────────────────────────

  function addCategory() {
    const trimmed = categoryInput.trim();
    if (!trimmed) return;
    // Support comma-separated input
    const newCats = trimmed
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c && !content.categories.includes(c));
    if (newCats.length === 0) return;
    setContent((c) => ({
      ...c,
      categories: [...c.categories, ...newCats],
    }));
    setCategoryInput('');
  }

  function removeCategory(cat: string) {
    setContent((c) => ({
      ...c,
      categories: c.categories.filter((x) => x !== cat),
    }));
  }

  // ── Save ────────────────────────────────────────────────────────────

  async function handleSave() {
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch(`/api/pages/${pageId}/encyclopedia-content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
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

  // ── Regenerate ──────────────────────────────────────────────────────

  async function handleRegenerate() {
    if (!confirm('This will replace all your edits with a fresh AI generation. Continue?')) {
      return;
    }

    setRegenerating(true);
    setMessage('');

    try {
      const res = await fetch(`/api/pages/${pageId}/generate/encyclopedia`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error || 'Failed to regenerate');
        return;
      }

      const newContent: EncyclopediaContent = await res.json();
      setContent(newContent);
      setMessage('Regenerated successfully');
    } catch {
      setMessage('Failed to regenerate');
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-white">
        Encyclopedia Editor
      </h1>

      <div className="space-y-6">
        {/* ── Lead Paragraph ──────────────────────────────────── */}
        <div className={cardClass}>
          <label htmlFor="leadParagraph" className={labelClass}>
            Lead Paragraph
          </label>
          <p className={descClass}>
            The opening paragraph that summarizes the article
          </p>
          <textarea
            id="leadParagraph"
            rows={5}
            value={content.leadParagraph}
            onChange={(e) => setLeadParagraph(e.target.value)}
            placeholder="A summary paragraph about this person..."
            className={inputClass}
          />
        </div>

        {/* ── Infobox ─────────────────────────────────────────── */}
        <div className={cardClass}>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white">Infobox</h3>
              <p className={descClass}>
                Key facts displayed in the sidebar info panel
              </p>
            </div>
            <button type="button" onClick={addInfoboxRow} className={btnSmall}>
              + Add Row
            </button>
          </div>

          {infoboxEntries.length === 0 && (
            <p className="text-xs text-gray-500">
              No entries yet. Click &quot;+ Add Row&quot; to start.
            </p>
          )}

          <div className="space-y-3">
            {infoboxEntries.map(([key, value], i) => (
              <div key={i} className="flex items-start gap-2">
                <input
                  type="text"
                  value={key}
                  onChange={(e) => setInfoboxKey(key, e.target.value)}
                  placeholder="Label"
                  className={`${inputClass} flex-[2]`}
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setInfoboxValue(key, e.target.value)}
                  placeholder="Value"
                  className={`${inputClass} flex-[3]`}
                />
                <button
                  type="button"
                  onClick={() => removeInfoboxRow(key)}
                  className="mt-1.5 shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-red-500/10 hover:text-red-400"
                  aria-label={`Remove ${key}`}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Sections ────────────────────────────────────────── */}
        <div className={cardClass}>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white">Sections</h3>
              <p className={descClass}>
                Article sections with headings and content
              </p>
            </div>
            <button type="button" onClick={addSection} className={btnSmall}>
              + Add Section
            </button>
          </div>

          {content.sections.length === 0 && (
            <p className="text-xs text-gray-500">
              No sections yet. Click &quot;+ Add Section&quot; to start.
            </p>
          )}

          <div className="space-y-4">
            {content.sections.map((section, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-gray-400">
                    Section {i + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveSection(i, -1)}
                      disabled={i === 0}
                      className={`${btnSmall} disabled:opacity-30`}
                      aria-label="Move section up"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(i, 1)}
                      disabled={i === content.sections.length - 1}
                      className={`${btnSmall} disabled:opacity-30`}
                      aria-label="Move section down"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSection(i)}
                      className={
                        deleteConfirm === i ? btnDanger : `${btnSmall} hover:!bg-red-500/10 hover:!text-red-400`
                      }
                    >
                      {deleteConfirm === i ? 'Confirm' : 'Delete'}
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={section.heading}
                  onChange={(e) => setSectionHeading(i, e.target.value)}
                  placeholder="Section heading"
                  className={`${inputClass} mb-3`}
                />
                <textarea
                  rows={4}
                  value={section.content}
                  onChange={(e) => setSectionContent(i, e.target.value)}
                  placeholder="Section content..."
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Categories ──────────────────────────────────────── */}
        <div className={cardClass}>
          <label htmlFor="categoryInput" className={labelClass}>
            Categories
          </label>
          <p className={descClass}>
            Tags for the article. Type and press Enter or click Add. Comma-separated values also work.
          </p>

          {content.categories.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {content.categories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white"
                >
                  {cat}
                  <button
                    type="button"
                    onClick={() => removeCategory(cat)}
                    className="text-gray-400 transition hover:text-red-400"
                    aria-label={`Remove category ${cat}`}
                  >
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              id="categoryInput"
              type="text"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCategory();
                }
              }}
              placeholder="e.g. Software Engineer, Open Source"
              className={`${inputClass} flex-1`}
            />
            <button type="button" onClick={addCategory} className={btnSmall}>
              Add
            </button>
          </div>
        </div>

        {/* ── Actions ─────────────────────────────────────────── */}
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <button
            onClick={handleSave}
            disabled={saving || regenerating}
            className={btnPrimary}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={handleRegenerate}
            disabled={saving || regenerating}
            className={btnSecondary}
          >
            {regenerating ? 'Regenerating...' : 'Regenerate with AI'}
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
