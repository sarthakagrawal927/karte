'use client';

import { useState } from 'react';
import { ImageUploadField } from '@/components/dashboard/image-upload-field';

interface Project {
  id: string;
  pageId: string;
  title: string;
  url: string;
  imageUrl: string | null;
  description: string;
  sortOrder: number | null;
  enabled: boolean | null;
}

export function ProjectEditor({
  pageId,
  initialProjects,
}: {
  pageId: string;
  initialProjects: Project[];
}) {
  const [projects, setProjects] = useState<Project[]>(
    [...initialProjects].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    ),
  );
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [reorderingProjectId, setReorderingProjectId] = useState<string | null>(
    null,
  );
  const [draggingProjectId, setDraggingProjectId] = useState<string | null>(
    null,
  );
  const [dropTargetProjectId, setDropTargetProjectId] = useState<string | null>(
    null,
  );

  function normalizeProjects(items: Project[]) {
    return [...items].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    );
  }

  function reorderProjects(items: Project[], activeId: string, targetId: string) {
    const nextProjects = [...items];
    const currentIndex = nextProjects.findIndex((project) => project.id === activeId);
    const targetIndex = nextProjects.findIndex((project) => project.id === targetId);

    if (
      currentIndex < 0 ||
      targetIndex < 0 ||
      currentIndex === targetIndex
    ) {
      return items;
    }

    const [movedProject] = nextProjects.splice(currentIndex, 1);
    nextProjects.splice(targetIndex, 0, movedProject);

    return nextProjects;
  }

  async function persistOrder(nextProjects: Project[]) {
    const res = await fetch(`/api/pages/${pageId}/projects`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderedProjectIds: nextProjects.map((project) => project.id),
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to reorder projects');
    }

    setProjects(
      nextProjects.map((project, index) => ({
        ...project,
        sortOrder: index,
      })),
    );
  }

  async function addProject(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !url.trim() || !description.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/pages/${pageId}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          url,
          imageUrl: imageUrl.trim() || undefined,
          description,
        }),
      });

      if (!res.ok) throw new Error('Failed to add project');

      const newProject = await res.json();
      setProjects((prev) => normalizeProjects([...prev, newProject]));
      setTitle('');
      setUrl('');
      setImageUrl('');
      setDescription('');
    } catch {
      alert('Failed to add project');
    } finally {
      setLoading(false);
    }
  }

  async function removeProject(projectId: string) {
    try {
      const res = await fetch(`/api/pages/${pageId}/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete project');

      setProjects((prev) => prev.filter((project) => project.id !== projectId));
    } catch {
      alert('Failed to remove project');
    }
  }

  async function moveProject(projectId: string, direction: -1 | 1) {
    const index = projects.findIndex((project) => project.id === projectId);
    const targetIndex = index + direction;

    if (index < 0 || targetIndex < 0 || targetIndex >= projects.length) {
      return;
    }

    const previousProjects = [...projects];
    const nextProjects = [...projects];
    [nextProjects[index], nextProjects[targetIndex]] = [
      nextProjects[targetIndex],
      nextProjects[index],
    ];

    setReorderingProjectId(projectId);

    try {
      await persistOrder(nextProjects);
    } catch {
      setProjects(previousProjects);
      alert('Failed to reorder projects');
    } finally {
      setReorderingProjectId(null);
    }
  }

  async function dropProject(targetProjectId: string) {
    if (
      !draggingProjectId ||
      draggingProjectId === targetProjectId ||
      reorderingProjectId
    ) {
      setDraggingProjectId(null);
      setDropTargetProjectId(null);
      return;
    }

    const previousProjects = projects;
    const nextProjects = reorderProjects(
      projects,
      draggingProjectId,
      targetProjectId,
    );

    setProjects(nextProjects);
    setReorderingProjectId(draggingProjectId);

    try {
      await persistOrder(nextProjects);
    } catch {
      setProjects(previousProjects);
      alert('Failed to reorder projects');
    } finally {
      setReorderingProjectId(null);
      setDraggingProjectId(null);
      setDropTargetProjectId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-xl">
        <h2 className="mb-1 text-lg font-semibold text-white">
          Add a Project
        </h2>
        <p className="mb-4 text-sm text-gray-400">
          Showcase work with a title, link, image, and short description.
          Drag cards to reorder them or use the move buttons.
        </p>

        <form onSubmit={addProject} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Project title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-gray-400 outline-none focus:border-blue-400"
              required
            />
            <input
              type="url"
              placeholder="https://example.com/project"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-gray-400 outline-none focus:border-blue-400"
              required
            />
          </div>

          <ImageUploadField
            pageId={pageId}
            kind="project"
            label="Project Image"
            value={imageUrl}
            onChange={setImageUrl}
            onUploadingChange={setUploadingImage}
            placeholder="https://example.com/project.jpg"
            helpText="Upload a local screenshot or cover image, or paste a public URL."
          />

          <textarea
            rows={4}
            placeholder="What is this project? What should visitors know?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-gray-400 outline-none focus:border-blue-400"
            required
          />

          <button
            type="submit"
            disabled={loading || uploadingImage}
            className="w-full rounded-lg bg-white px-6 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-100 disabled:opacity-50 sm:w-auto"
          >
            {uploadingImage ? 'Uploading image...' : loading ? 'Adding...' : 'Add Project'}
          </button>
        </form>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/20 bg-white/[0.03] p-8 text-center">
          <p className="text-gray-400">
            No projects yet. Add your first one above.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {projects.map((project, index) => (
            <div
              key={project.id}
              draggable={!reorderingProjectId}
              onDragStart={() => setDraggingProjectId(project.id)}
              onDragEnd={() => {
                setDraggingProjectId(null);
                setDropTargetProjectId(null);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (draggingProjectId && draggingProjectId !== project.id) {
                  setDropTargetProjectId(project.id);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                void dropProject(project.id);
              }}
              className={`rounded-2xl border bg-white/5 p-5 backdrop-blur-xl transition ${
                draggingProjectId === project.id
                  ? 'border-white/40 opacity-60'
                  : dropTargetProjectId === project.id
                    ? 'border-blue-300/60 bg-white/10'
                    : 'border-white/20'
              } ${reorderingProjectId ? 'cursor-wait' : 'cursor-grab active:cursor-grabbing'}`}
            >
              {project.imageUrl && (
                <div
                  className="mb-4 h-40 w-full rounded-xl bg-cover bg-center"
                  style={{ backgroundImage: `url(${project.imageUrl})` }}
                />
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold text-white">
                    {project.title}
                  </p>
                  <p className="break-all text-sm text-blue-300 sm:truncate">
                    {project.url}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeProject(project.id)}
                  className="shrink-0 rounded-lg border border-white/20 px-3 py-1.5 text-sm text-red-400 transition hover:bg-red-500/10"
                >
                  Remove
                </button>
              </div>

              <p className="mt-4 text-sm leading-6 text-gray-300">
                {project.description}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => moveProject(project.id, -1)}
                  disabled={reorderingProjectId !== null || index === 0}
                  className="flex-1 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10 disabled:opacity-50 sm:flex-none"
                >
                  Move Up
                </button>
                <button
                  type="button"
                  onClick={() => moveProject(project.id, 1)}
                  disabled={
                    reorderingProjectId !== null ||
                    index === projects.length - 1
                  }
                  className="flex-1 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10 disabled:opacity-50 sm:flex-none"
                >
                  Move Down
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
