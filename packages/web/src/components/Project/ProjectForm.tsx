import { useState } from 'react';
import { z } from 'zod';
import { api } from '../../lib/api';

const schema = z.object({
  title: z.string().min(3, 'Title must have at least 3 characters'),
  description: z.string().optional(),
});

export function ProjectForm({ onCreated }: { onCreated: (p: any) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = schema.safeParse({ title, description });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    // UI otimista
    const optimistic = { id: `tmp-${crypto.randomUUID()}`, title, description, notes: [] };
    onCreated(optimistic);

    setSubmitting(true);
    try {
      const { data } = await api<any>('/projects', {
        method: 'POST',
        body: JSON.stringify(parsed.data),
      });
      onCreated(data); // substitua o optimista pelo real na lista do pai
    } catch (err: any) {
      setError(err.message);
      // rollback: avise o pai para remover o item otimista se necessário
      onCreated({ ...optimistic, __rollback: true } as any);
    } finally {
      setSubmitting(false);
      setTitle('');
      setDesc('');
    }
  }

  return (
    <form aria-labelledby="create-project" onSubmit={onSubmit} className="max-w-md">
      <h2 id="create-project">Create project</h2>

      <label htmlFor="p-title">Title</label>
      <input
        id="p-title"
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        minLength={3}
        aria-invalid={!!error}
        aria-describedby={error ? 'p-error' : undefined}
      />

      <label htmlFor="p-desc">Description (optional)</label>
      <textarea id="p-desc" value={description} onChange={(e) => setDesc(e.target.value)} />

      {error && <div id="p-error" role="alert">{error}</div>}

      <button type="submit" disabled={submitting} aria-busy={submitting}>
        {submitting ? 'Creating…' : 'Create'}
      </button>
    </form>
  );
}
