import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { useApp } from '../../context/AppContext';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  isDestructive = true,
}) => {
  const { t } = useApp();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-sm opacity-90 leading-relaxed pt-1">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-700/50 hover:bg-slate-800/40 transition-colors cursor-pointer"
          >
            {cancelText || t.actions.cancel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm font-medium rounded-xl text-white transition-all shadow-sm cursor-pointer ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-900/30'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-900/30'
            }`}
          >
            {confirmText || t.actions.confirm}
          </button>
        </div>
      </div>
    </Modal>
  );
};
