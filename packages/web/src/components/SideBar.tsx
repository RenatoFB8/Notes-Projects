import { useEffect, useRef, useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useToast } from './ToasterProvider';
import { ProjectModal } from './Project/ProjectModal';
import { EditProjectModal } from './Project/EditProjectModal';
import { ConfirmDialog } from './ConfirmDiaog';
import { useAuth } from '../contexts/AuthContext';
import { UserHeader } from './Auth/UserHeader';

type Props = {
  selectedId?: string | null;
  onSelect: (id: string | null) => void;
  onCreated: (p: any) => void;
  isOpen?: boolean;
  onClose?: () => void;
};

export function Sidebar({ selectedId, onSelect, onCreated, isOpen = true, onClose }: Props) {
  const { items, loading, hasMore, loadMore, q, setQ, rename, remove, addFromServer } = useProjects();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<{ id: string; title: string; description?: string } | null>(null);
  const [deleteOpen, setDeleteOpen] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`} aria-label="Projects sidebar">
      <div className="sidebar-header">
        <button className="primary" onClick={() => setAddOpen(true)}>New project</button>
        <button className="ghost" onClick={() => loadMore(true)} disabled={loading} aria-busy={loading} title="Refresh">↻</button>
      </div>

      <div className="sidebar-search">
        <input
          id="search-projects"
          ref={inputRef}
          placeholder="Search projects… (Ctrl+K)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="project-list" role="listbox" aria-label="Projects">
        {items.map((p) => (
          <div
            key={p.id}
            role="option"
            aria-selected={selectedId === p.id}
            tabIndex={0}
            className="project-item"
            onClick={() => onSelect(p.id)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(p.id)}
            title={p.description || ''}
          >
            <div className="project-item-content">
              <div className="project-title">{p.title}</div>
              <div className="project-sub">{new Date(p.createdAt).toLocaleString()}</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="ghost"
                onClick={(e) => { e.stopPropagation(); setEditOpen(p); }}
                aria-label="Rename"
              >✎</button>
              <button
                className="ghost"
                onClick={(e) => { e.stopPropagation(); setDeleteOpen(p.id); }}
                aria-label="Delete"
              >🗑</button>
            </div>
          </div>
        ))}
        {hasMore && (
          <button className="ghost" onClick={() => loadMore()} disabled={loading} aria-busy={loading}>
            {loading ? 'Loading…' : 'Load more'}
          </button>
        )}
      </div>

      <div className="user-footer">
        <UserHeader />
      </div>

      <ProjectModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={(proj) => {
          addFromServer(proj);
          onCreated(proj);
          onSelect(proj.id);
          addToast('Project created', 'success');
        }}
      />

      {editOpen && (
        <EditProjectModal
          open={!!editOpen}
          onClose={() => setEditOpen(null)}
          initial={editOpen}
          onSave={async (data) => {
            try {
              await rename(editOpen.id, data);
              addToast('Project renamed', 'success');
              window.dispatchEvent(new CustomEvent('projectUpdated', { 
                detail: { projectId: editOpen.id } 
              }));
            } catch (e: any) {
              addToast(e.message || 'Rename failed', 'error');
            }
          }}
        />
      )}
      
      {deleteOpen && (
        <ConfirmDialog
          open={!!deleteOpen}
          onClose={() => setDeleteOpen(null)}
          onConfirm={async () => {
            try {
              await remove(deleteOpen);
              addToast('Project deleted', 'success');
              if (selectedId === deleteOpen) onSelect(null);
            } catch (e: any) {
              addToast(e.message || 'Delete failed', 'error');
            }
          }}
          title="Delete project"
          message="Are you sure you want to delete this project and all its notes?"
          confirmLabel="Delete"
        />
      )}
    </aside>
    </>
  );
}
