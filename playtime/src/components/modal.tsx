'use client';

import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
}

export default function Modal({ isOpen, onClose, title, children, onConfirm, confirmText = 'Confirmar' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <div className="p-4">{children}</div>
        <div className="flex justify-end gap-2 border-t p-4">
          <button onClick={onClose} className="btn btn-outline">Cancelar</button>
          {onConfirm && (
            <button onClick={onConfirm} className="btn btn-primary">{confirmText}</button>
          )}
        </div>
      </div>
    </div>
  );
}