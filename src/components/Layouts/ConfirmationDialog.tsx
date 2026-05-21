"use client";

import { cn } from "@/lib/utils";
import { ConfirmationDialogProps } from "@/types/ui";
import { Modal, ModalFooter, ConfirmButton, CancelButton } from "@/components/ui/Modal";

export function ConfirmationDialog({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Okay",
    cancelText = "Cancel",
    variant = "default",
}: ConfirmationDialogProps) {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onCancel} title={title} contentClassName="pb-0">
            <div className="text-dark dark:text-gray-300 text-sm">
                {message}
            </div>
            <ModalFooter className="-mx-6 mt-6 mb-0 rounded-b-lg">
                <CancelButton onClick={onCancel}>{cancelText}</CancelButton>
                <ConfirmButton
                    onClick={onConfirm}
                    variant={variant === "destructive" ? "danger" : "primary"}
                    className={cn("min-w-[96px]")}
                >
                    {confirmText}
                </ConfirmButton>
            </ModalFooter>
        </Modal>
    );
}
