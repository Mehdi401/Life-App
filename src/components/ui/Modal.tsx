import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-xl',
}) => {
  const { theme } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        className={`relative w-full ${maxWidth} rounded-2xl shadow-2xl transition-all border my-8 z-10 ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-indigo-950/40'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            theme === 'dark' ? 'border-slate-800' : 'border-slate-100'
          }`}
        >
          <h3 id="modal-title" className="text-lg font-bold tracking-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              theme === 'dark'
                ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
            }`}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(85vh-120px)] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
