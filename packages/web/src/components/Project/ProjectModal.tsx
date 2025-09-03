import { useEffect, useState } from 'react';
import { Modal } from '../../components/Modal';
import { z } from 'zod';
import { api } from '../../lib/api';

const schema = z.object({
  title: z.string().min(3, 'Title must have at least 3 characters').max(25, 'Title must have at most 25 characters'),
  description: z.string().max(50, 'Description must have at most 50 characters').optional(),
});

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (project: any) => void;
  initial?: { title?: string; description?: string };
};

export function ProjectModal({ open, onClose, onCreated, initial }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? '');
      setDescription(initial?.description ?? '');
      setError(null);
    }
  }, [open, initial]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = schema.safeParse({ title: title.trim(), description: description.trim() ? description : undefined });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api<any>('/projects', {
        method: 'POST',
        body: JSON.stringify(parsed.data),
      });
      onCreated(data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} titleId="project-modal-title">
      <div className="modal-header">
        <h3 id="project-modal-title">New project</h3>
        <button className="ghost" onClick={onClose} aria-label="Close">✕</button>
      </div>

      <form onSubmit={submit}>
        <label htmlFor="p-title">Title</label>
        <div style={{ position: 'relative' }}>
          <input 
            id="p-title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value.slice(0, 25))} 
            minLength={3} 
            maxLength={25}
            required 
          />
          <div style={{ 
            fontSize: '12px', 
            color: title.length > 20 ? '#ff6b6b' : '#666', 
            textAlign: 'right', 
            marginTop: '4px' 
          }}>
            {title.length}/25
          </div>
        </div>

        <label htmlFor="p-desc" style={{ marginTop: 8 }}>Description (optional)</label>
        <div style={{ position: 'relative' }}>
          <textarea 
            id="p-desc" 
            value={description} 
            onChange={(e) => setDescription(e.target.value.slice(0, 50))} 
            rows={4} 
            maxLength={50}
          />
          <div style={{ 
            fontSize: '12px', 
            color: description.length > 45 ? '#ff6b6b' : '#666', 
            textAlign: 'right', 
            marginTop: '4px' 
          }}>
            {description.length}/50
          </div>
        </div>

        {error && <div role="alert" style={{ color: 'salmon', marginTop: 8 }}>{error}</div>}

        <div className="modal-actions">
          <button type="button" className="ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary" disabled={submitting} aria-busy={submitting}>
            {submitting ? 'Creating…' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
