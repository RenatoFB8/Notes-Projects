import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type Toast = { id: string; message: string; type?: 'success' | 'error' };
type Ctx = { addToast: (message: string, type?: Toast['type']) => void };

const ToastCtx = createContext<Ctx | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type?: Toast['type']) => {
    const t: Toast = { id: crypto.randomUUID(), message, type };
    setToasts((prev) => [...prev, t]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 3000);
  }, []);

  const value = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div style={{
        position: 'fixed', right: 16, bottom: 16, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 50
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: t.type === 'error' ? '#3a1e22' : '#0f2722',
            border: `1px solid ${t.type === 'error' ? '#7f1d1d' : 'var(--accent)'}`,
            color: 'var(--text)',
            padding: '10px 12px',
            borderRadius: 10,
            minWidth: 220
          }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
