import { useEffect, useState } from 'react';
import { Modal } from '../Modal';
import { z } from 'zod';
import { api } from '../../lib/api';

const schema = z.object({
  title: z.string().min(3, 'Title must have at least 3 characters'),
  content: z.string().min(1, 'Content is required'),
});

type Props = {
  mode: 'create' | 'edit';
  open: boolean;
  onClose: () => void;
  projectId: string;
  note?: { id: string; title: string; content: string };
  onCreated?: (note: any) => void;
  onUpdated?: (note: any) => void;
};

export function NoteModal({ mode, open, onClose, projectId, note, onCreated, onUpdated }: Props) {
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(note?.title ?? '');
      setContent(note?.content ?? '');
      setError(null);
    }
  }, [open, note]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse({ title, content });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);

    try {
      if (mode === 'create') {
        const optimistic = { id: `tmp-${crypto.randomUUID()}`, title, content, createdAt: new Date().toISOString() };
        onCreated?.(optimistic);
        const { data } = await api<any>('/notes', {
          method: 'POST',
          body: JSON.stringify({ ...parsed.data, projectId }),
        });
        // Replace the optimistic note with the real one
        onCreated?.({ ...data, __replace: optimistic.id });
      } else {
        if (!note) return;
        const { data } = await api<any>(`/notes/${note.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ title, content }),
        });
        onUpdated?.(data);
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} titleId="note-modal-title">
      <div className="modal-header">
        <h3 id="note-modal-title">{mode === 'create' ? 'Add note' : 'Edit note'}</h3>
        <button className="ghost" onClick={onClose} aria-label="Close">✕</button>
      </div>

      <form onSubmit={submit}>
        <label htmlFor="n-title">Title</label>
        <input id="n-title" value={title} onChange={(e) => setTitle(e.target.value)} minLength={3} required />

        <label htmlFor="n-content" style={{ marginTop: 8 }}>Content</label>
        <textarea id="n-content" value={content} onChange={(e) => setContent(e.target.value)} rows={6} required />

        {error && <div role="alert" style={{ color: 'salmon', marginTop: 8 }}>{error}</div>}

        <div className="modal-actions">
          <button type="button" className="ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary" disabled={submitting} aria-busy={submitting}>
            {submitting ? (mode === 'create' ? 'Creating…' : 'Saving…') : (mode === 'create' ? 'Create' : 'Save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
