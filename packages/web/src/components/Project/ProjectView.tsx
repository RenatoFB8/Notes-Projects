import { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api';
import { useNotes } from '../../hooks/useNotes';
import { NoteCard } from '../Note/NoteCard';
import { NoteModal } from '../Note/NoteModal';
import { useToast } from '../ToasterProvider';

type Project = { id: string; title: string; description?: string; createdAt: string; updatedAt: string };

type Props = { projectId?: string | null };

export function ProjectView({ projectId }: Props) {
  const [project, setProject] = useState<Project | null>(null);
  const [, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // pageSize = 3
  const {
    items: notes,
    loading: loadingNotes,
    q, setQ,
    page, hasNext, hasPrev,
    nextPage, prevPage,
    optimisticAdd, update, remove,
  } = useNotes(projectId ?? undefined, 3);

  const [modalOpen, setModalOpen] = useState(false);
  const [editNoteId, setEditNoteId] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (!projectId) { setProject(null); return; }
    setLoading(true); setError(null);
    api<Project>(`/projects/${projectId}`)
      .then(({ data }) => setProject(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [projectId, refreshKey]);

  // Listen for project updates via custom event
  useEffect(() => {
    const handleProjectUpdate = (event: CustomEvent) => {
      if (event.detail.projectId === projectId) {
        setRefreshKey(prev => prev + 1);
      }
    };

    window.addEventListener('projectUpdated', handleProjectUpdate as EventListener);
    return () => window.removeEventListener('projectUpdated', handleProjectUpdate as EventListener);
  }, [projectId]);

  const headerTitle = useMemo(() => project?.title ?? 'Select a project', [project]);
  const noteBeingEdited = editNoteId ? notes.find(n => n.id === editNoteId) : undefined;

  async function onDeleteNote(id: string) {
    try {
      await remove(id);
      addToast('Note deleted', 'success');
    } catch (e: any) {
      addToast(e.message || 'Delete failed', 'error');
    }
  }

  return (
    <section className="main" aria-labelledby="project-title">
      <header className="main-header">
        <div>
          <h2 id="project-title" style={{ margin: 0 }}>{headerTitle}</h2>
          {project?.description && <div style={{ color: 'var(--text-dim)' }}>{project.description}</div>}
        </div>

        {project && (
          <div className="toolbar">
            <input
              placeholder="Search notes…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search notes"
            />
            <button className="primary w-32" onClick={() => setModalOpen(true)}>New note</button>
          </div>
        )}
      </header>

      <div className="content-scroll">
        {!projectId && (
          <div className="empty">Pick a project from the sidebar to get started.</div>
        )}

        {error && <div role="alert" style={{ color: 'salmon' }}>{error}</div>}

        {project && (
          <>
            {notes.length === 0 && !loadingNotes ? (
              <div className="empty">No notes yet. Create your first note!</div>
            ) : (
              <>
                <div className="notes-grid" aria-live="polite">
                  {notes.map((n) => (
                    <NoteCard
                      key={n.id}
                      note={n}
                      onEdit={(id) => setEditNoteId(id)}
                      onDelete={onDeleteNote}
                    />
                  ))}
                </div>

                {/* Pagination controls */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
                  <button className="ghost" onClick={prevPage} disabled={!hasPrev || loadingNotes} aria-busy={loadingNotes}>
                    ‹ Prev
                  </button>
                  <span style={{ opacity: 0.7 }}>Page {page + 1}</span>
                  <button className="ghost" onClick={nextPage} disabled={!hasNext || loadingNotes} aria-busy={loadingNotes}>
                    Next ›
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {project && (
        <>
          <NoteModal
            mode="create"
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            projectId={project.id}
            onCreated={(n) => {
              if ('__rollback' in n) { optimisticAdd(n as any); return; }
              if ('__replace' in n) {
                // Replace optimistic note with real one
                optimisticAdd({ __rollback: true } as any);
                optimisticAdd(n);
                addToast('Note created', 'success');
                return;
              }
              optimisticAdd(n);
            }}
          />
          <NoteModal
            mode="edit"
            open={!!editNoteId}
            onClose={() => setEditNoteId(null)}
            projectId={project.id}
            note={noteBeingEdited ? { id: noteBeingEdited.id, title: noteBeingEdited.title, content: noteBeingEdited.content } : undefined}
            onUpdated={(saved) => {
              update(saved.id, { title: saved.title, content: saved.content });
              addToast('Note updated', 'success');
              setEditNoteId(null);
            }}
          />
        </>
      )}
    </section>
  );
}
