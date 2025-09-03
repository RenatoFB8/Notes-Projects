import { useEffect, useState, useRef } from 'react';
import { api } from '../lib/api';

export type Note = { id: string; title: string; content: string; createdAt: string; updatedAt: string };

export function useNotes(projectId?: string, pageSize = 3) {
  const [items, setItems] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);

  // cursors[i] = token usado para carregar a página i (página 0 não tem cursor)
  const cursorsRef = useRef<(string | null)[]>([null]);
  const [hasNext, setHasNext] = useState(false);

  async function loadPage(targetPage: number) {
    if (!projectId) {
      setItems([]);
      setHasNext(false);
      setPage(0);
      cursorsRef.current = [null];
      return;
    }
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set('projectId', projectId);
      if (q) qs.set('q', q);
      qs.set('limit', String(pageSize));

      const cursor = cursorsRef.current[targetPage] ?? null;
      if (cursor) qs.set('cursor', cursor);

      const { data } = await api<{ items: Note[]; nextCursor: string | null }>(`/notes?${qs.toString()}`);
      // substitui a página atual pelos 3 itens vindos
      setItems(data.items);
      setPage(targetPage);

      // guarda o cursor da próxima página (se veio)
      const nextCursor = data.nextCursor ?? null;
      cursorsRef.current[targetPage + 1] = nextCursor;
      setHasNext(!!nextCursor);
      // limpa qualquer “rastro” de páginas à frente se voltamos
      cursorsRef.current = cursorsRef.current.slice(0, targetPage + 2);
    } finally {
      setLoading(false);
    }
  }

  // mudar busca ou projeto: reset para página 0
  useEffect(() => {
    cursorsRef.current = [null];
    setPage(0);
    loadPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, projectId, pageSize]);

  async function nextPage() {
    if (!hasNext) return;
    await loadPage(page + 1);
  }

  async function prevPage() {
    if (page === 0) return;
    await loadPage(page - 1);
  }

  // otimista/CRUD mantidos
  function optimisticAdd(n: Note | (Note & { __rollback?: true })) {
    // mesmo com paginação, mantemos UX de inserir no topo visualmente
    if ('__rollback' in n && n.__rollback) {
      setItems((prev) => prev.filter((it) => !it.id.startsWith('tmp-')));
      return;
    }
    setItems((prev) => [n as Note, ...prev].slice(0, pageSize)); // garante no máx. 3 visíveis
    // como a lista mudou, invalide o cursor futuro simples (vai se recomputar em reload)
    cursorsRef.current = [null];
    
    // Refresh pagination after adding a real note (not temporary)
    if (!n.id.startsWith('tmp-')) {
      // Reset to page 0 and refresh to show the new note and update pagination
      setPage(0);
      setTimeout(() => loadPage(0), 100); // Small delay to ensure the API has processed the note
    }
  }

  async function update(id: string, payload: Partial<Pick<Note, 'title' | 'content'>>) {
    const before = items;
    setItems(prev => prev.map(it => it.id === id ? { ...it, ...payload } : it));
    try {
      const { data } = await api<Note>(`/notes/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      setItems(prev => prev.map(it => it.id === id ? data : it));
      return true;
    } catch (e) {
      setItems(before);
      throw e;
    }
  }

  async function remove(id: string) {
    const before = items;
    setItems(prev => prev.filter(it => it.id !== id));
    try {
      await api(`/notes/${id}`, { method: 'DELETE' });
      // após deletar, recarrega a página atual para preencher “buraco”
      await loadPage(page);
      return true;
    } catch (e) {
      setItems(before);
      throw e;
    }
  }

  async function refresh() {
    await loadPage(page);
  }

  return {
    items,
    loading,
    q,
    setQ,
    page,
    hasNext,
    hasPrev: page > 0,
    nextPage,
    prevPage,
    loadPage,   // se quiser pular para uma página específica
    optimisticAdd,
    update,
    remove,
    refresh,
  };
}
