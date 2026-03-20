'use client';

import { useState } from 'react';

interface Link {
  id: string;
  pageId: string;
  title: string;
  url: string;
  icon: string | null;
  sortOrder: number | null;
  enabled: boolean | null;
}

export function LinkEditor({
  pageId,
  initialLinks,
}: {
  pageId: string;
  initialLinks: Link[];
}) {
  const [links, setLinks] = useState<Link[]>(
    [...initialLinks].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    ),
  );
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [draggingLinkId, setDraggingLinkId] = useState<string | null>(null);
  const [dropTargetLinkId, setDropTargetLinkId] = useState<string | null>(null);

  function normalizeLinks(items: Link[]) {
    return [...items].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    );
  }

  function reorderLinks(items: Link[], activeId: string, targetId: string) {
    const nextLinks = [...items];
    const currentIndex = nextLinks.findIndex((link) => link.id === activeId);
    const targetIndex = nextLinks.findIndex((link) => link.id === targetId);

    if (
      currentIndex < 0 ||
      targetIndex < 0 ||
      currentIndex === targetIndex
    ) {
      return items;
    }

    const [movedLink] = nextLinks.splice(currentIndex, 1);
    nextLinks.splice(targetIndex, 0, movedLink);

    return nextLinks;
  }

  async function persistOrder(nextLinks: Link[]) {
    const response = await fetch(`/api/pages/${pageId}/links`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderedLinkIds: nextLinks.map((link) => link.id),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to reorder links');
    }

    const updatedLinks = await response.json();
    setLinks(updatedLinks);
  }

  async function moveLink(linkId: string, direction: -1 | 1) {
    const currentIndex = links.findIndex((link) => link.id === linkId);
    const targetIndex = currentIndex + direction;

    if (
      currentIndex < 0 ||
      targetIndex < 0 ||
      targetIndex >= links.length ||
      reordering
    ) {
      return;
    }

    const previousLinks = [...links];
    const nextLinks = [...links];
    const [movedLink] = nextLinks.splice(currentIndex, 1);
    nextLinks.splice(targetIndex, 0, movedLink);

    setLinks(nextLinks);
    setReordering(true);

    try {
      await persistOrder(nextLinks);
    } catch {
      setLinks(previousLinks);
      alert('Failed to reorder links');
    } finally {
      setReordering(false);
    }
  }

  async function dropLink(targetLinkId: string) {
    if (!draggingLinkId || draggingLinkId === targetLinkId || reordering) {
      setDraggingLinkId(null);
      setDropTargetLinkId(null);
      return;
    }

    const previousLinks = links;
    const nextLinks = reorderLinks(links, draggingLinkId, targetLinkId);

    setLinks(nextLinks);
    setReordering(true);

    try {
      await persistOrder(nextLinks);
    } catch {
      setLinks(previousLinks);
      alert('Failed to reorder links');
    } finally {
      setReordering(false);
      setDraggingLinkId(null);
      setDropTargetLinkId(null);
    }
  }

  async function addLink(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/pages/${pageId}/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, url }),
      });

      if (!res.ok) throw new Error('Failed to add link');

      const newLink = await res.json();
      setLinks((prev) => normalizeLinks([...prev, newLink]));
      setTitle('');
      setUrl('');
    } catch {
      alert('Failed to add link');
    } finally {
      setLoading(false);
    }
  }

  async function removeLink(linkId: string) {
    try {
      const res = await fetch(`/api/pages/${pageId}/links/${linkId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete link');

      setLinks((prev) => prev.filter((l) => l.id !== linkId));
    } catch {
      alert('Failed to remove link');
    }
  }

  return (
    <div className="space-y-6">
      {/* Add link form */}
      <div className="rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-xl">
        <h2 className="mb-4 text-lg font-semibold text-white">Add a Link</h2>
        <p className="mb-4 text-sm text-gray-400">
          Drag cards to reorder them or use the move buttons.
        </p>
        <form onSubmit={addLink} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white placeholder-gray-400 outline-none focus:border-blue-400"
            required
          />
          <input
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white placeholder-gray-400 outline-none focus:border-blue-400"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-white px-6 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-100 disabled:opacity-50 sm:w-auto"
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </form>
      </div>

      {/* Links list */}
      {links.length === 0 ? (
        <div className="rounded-2xl border border-white/20 bg-white/5 p-8 text-center backdrop-blur-xl">
          <p className="text-gray-400">
            No links yet. Add your first link above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link, index) => (
            <div
              key={link.id}
              draggable={!reordering}
              onDragStart={() => setDraggingLinkId(link.id)}
              onDragEnd={() => {
                setDraggingLinkId(null);
                setDropTargetLinkId(null);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (draggingLinkId && draggingLinkId !== link.id) {
                  setDropTargetLinkId(link.id);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                void dropLink(link.id);
              }}
              className={`flex flex-col gap-4 rounded-2xl border bg-white/5 p-4 backdrop-blur-xl transition sm:flex-row sm:items-center sm:justify-between ${
                draggingLinkId === link.id
                  ? 'border-white/40 opacity-60'
                  : dropTargetLinkId === link.id
                    ? 'border-blue-300/60 bg-white/10'
                    : 'border-white/20'
              } ${reordering ? 'cursor-wait' : 'cursor-grab active:cursor-grabbing'}`}
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-gray-300">
                    #{index + 1}
                  </span>
                  <p className="truncate font-medium text-white">{link.title}</p>
                </div>
                <p className="truncate text-sm text-gray-400">{link.url}</p>
              </div>
              <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                <button
                  type="button"
                  onClick={() => moveLink(link.id, -1)}
                  disabled={index === 0 || reordering}
                  className="flex-1 rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                >
                  Move up
                </button>
                <button
                  type="button"
                  onClick={() => moveLink(link.id, 1)}
                  disabled={index === links.length - 1 || reordering}
                  className="flex-1 rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                >
                  Move down
                </button>
                <button
                  type="button"
                  onClick={() => removeLink(link.id)}
                  disabled={reordering}
                  className="flex-1 rounded-lg border border-white/20 px-3 py-1.5 text-sm text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
