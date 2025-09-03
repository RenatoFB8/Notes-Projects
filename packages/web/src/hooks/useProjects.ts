import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export type Project = { id: string; title: string; description?: string; createdAt: string; updatedAt: string; notes?: any[] };

export function useProjects() {
  const [items, setItems] = useState<Project[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');

  async function loadMore(reset = false) {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (q) qs.set('q', q);
      if (!reset && cursor) qs.set('cursor', cursor);
      const { data } = await api<{ items: Project[]; nextCursor: string | null }>(`/projects?${qs.toString()}`);
      setItems(reset ? data.items : [...items, ...data.items]);
      setCursor(data.nextCursor);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadMore(true); }, [q]);

  function optimisticAdd(p: Project | (Project & { __rollback?: true })) {
    if ('__rollback' in p && p.__rollback) {
      setItems((prev) => prev.filter((it) => !it.id.startsWith('tmp-')));
      return;
    }
    setItems((prev) => [p as Project, ...prev.filter((it) => !it.id.startsWith('tmp-'))]);
  }

  async function rename(id: string, payload: { title?: string; description?: string }) {
    // otimista
    setItems(prev => prev.map(it => it.id === id ? { ...it, ...payload } : it));
    try {
      const { data } = await api<Project>(`/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      setItems(prev => prev.map(it => it.id === id ? data : it));
      return true;
    } catch (e) {
      // rollback (simplificado: recarregar lista)
      await loadMore(true);
      throw e;
    }
  }

  async function remove(id: string) {
    const old = items;
    setItems(prev => prev.filter(it => it.id !== id));
    try {
      await api(`/projects/${id}`, { method: 'DELETE' });
      return true;
    } catch (e) {
      setItems(old); // rollback
      throw e;
    }
  }

  // ...restante do arquivo igual

  function addFromServer(p: Project) {
    setItems(prev => [p, ...prev.filter(it => it.id !== p.id)]);
  }

  // export:
  return { items, loading, hasMore: !!cursor, loadMore, q, setQ, setItems, optimisticAdd, rename, remove, addFromServer };

}
