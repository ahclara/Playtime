'use client';

import { ReactNode, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
  wide?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  danger = false,
  loading = false,
  wide = false,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box paper" style={wide ? { maxWidth: 640 } : undefined} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button onClick={onClose} className="modal-close" aria-label="Fechar">
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-foot">
          <button onClick={onClose} className="btn btn-outline btn-sm">
            {onConfirm ? cancelText : 'Fechar'}
          </button>
          {onConfirm && (
            <button onClick={onConfirm} disabled={loading} className={`btn btn-sm ${danger ? 'btn-danger' : 'btn-primary'}`}>
              {loading ? 'Aguarde...' : confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
