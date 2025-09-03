import { useEffect, useState } from 'react';
import { Modal } from '../../components/Modal';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(3, 'Title must have at least 3 characters').max(25, 'Title must have at most 25 characters'),
  description: z.string().max(50, 'Description must have at most 50 characters').optional(),
});

type Props = {
  open: boolean;
  onClose: () => void;
  initial: { id: string; title: string; description?: string };
  onSave: (data: { title: string; description?: string }) => Promise<void>;
};

export function EditProjectModal({ open, onClose, initial, onSave }: Props) {
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(initial.title);
      setDescription(initial.description ?? '');
      setError(null);
    }
  }, [open, initial]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ title: title.trim(), description: description.trim() ? description : undefined });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      await onSave(parsed.data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} titleId="edit-project-title">
      <div className="modal-header">
        <h3 id="edit-project-title">Edit project</h3>
        <button className="ghost" onClick={onClose} aria-label="Close">✕</button>
      </div>
      <form onSubmit={submit}>
        <label htmlFor="ep-title">Title</label>
        <div style={{ position: 'relative' }}>
          <input 
            id="ep-title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value.slice(0, 25))} 
            required 
            minLength={3} 
            maxLength={25}
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

        <label htmlFor="ep-desc" style={{ marginTop: 8 }}>Description</label>
        <div style={{ position: 'relative' }}>
          <textarea 
            id="ep-desc" 
            value={description} 
            onChange={(e) => setDescription(e.target.value.slice(0, 50))} 
            rows={3} 
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
          <button type="submit" className="primary" disabled={loading} aria-busy={loading}>
            {loading ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
