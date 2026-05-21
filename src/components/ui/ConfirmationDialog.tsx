import React from 'react';
import { Modal, ModalFooter, ConfirmButton, CancelButton } from '@/components/ui/Modal';

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
    <Modal isOpen={isOpen} onClose={onCancel} contentClassName="pb-0">
      <div className="animate-fadeIn">
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

        <ModalFooter className="-mx-6 mt-6 mb-0 rounded-b-lg">
          <CancelButton onClick={onCancel} className="flex-1">
            {cancelLabel}
          </CancelButton>
          <ConfirmButton
            onClick={onConfirm}
            className="flex-1"
            variant={type === 'danger' ? 'danger' : type === 'warning' ? 'warning' : 'primary'}
          >
            {confirmLabel}
          </ConfirmButton>
        </ModalFooter>
      </div>
    </Modal>
  );
}
