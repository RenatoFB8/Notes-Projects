import { Modal } from './Modal';
import { useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string;
  confirmLabel?: string;
};

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm' }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    try {
      setLoading(true);
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} titleId="confirm-title">
      <div className="modal-header">
        <h3 id="confirm-title">{title}</h3>
        <button className="ghost" onClick={onClose} aria-label="Close">✕</button>
      </div>
      <div style={{ padding: '1rem 0' }}>{message}</div>
      <div className="modal-actions">
        <button className="ghost" onClick={onClose}>Cancel</button>
        <button className="danger" onClick={handleConfirm} disabled={loading} aria-busy={loading}>
          {loading ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
