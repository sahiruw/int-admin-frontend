import React from 'react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  type = 'danger'
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  // Define color schemes based on type
const colors = {
    danger: {
        button: 'bg-red-600 hover:bg-red-700',
        icon: 'text-red-600',
    },
    warning: {
        button: 'bg-yellow-500 hover:bg-yellow-600',
        icon: 'text-yellow-500',
    },
    info: {
        button: 'bg-blue-600 hover:bg-blue-700',
        icon: 'text-blue-600',
    },
};

  // Icons for different dialog types
  const icons = {
    danger: (
      <svg className="w-12 h-12 mx-auto text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    warning: (
      <svg className="w-12 h-12 mx-auto text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-12 h-12 mx-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark animate-fadeIn">
        <div className="mb-5 text-center">
          <div className="mb-4">
            {icons[type]}
          </div>
          <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {message}
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded border border-stroke px-6 py-2.5 text-black hover:shadow-1 dark:border-strokedark dark:text-white"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded px-6 py-2.5 font-medium text-white ${colors[type].button}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
