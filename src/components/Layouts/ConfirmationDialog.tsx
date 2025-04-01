"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui-elements/button";
import { ConfirmationDialogProps } from "@/types/ui";

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
        <div
            className=" z-50 fixed inset-0 bg-black/50 dark:bg-white/10 flex items-center justify-center p-4"
            onClick={onCancel} // Close dialog when clicking the outer area
        >
            <div
                className="bg-white dark:bg-dark-1 rounded-lg shadow-xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                {/* Header */}
                <div className="bg-[#F7F9FC] dark:bg-dark-2 px-6 py-4 rounded-t-lg">
                    <h3 className="text-lg font-semibold text-dark dark:text-white">{title}</h3>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="text-dark dark:text-gray-300 text-sm">
                        {message}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-[#F7F9FC] dark:bg-dark-2 px-6 py-4 rounded-b-lg flex justify-end gap-3">
                    <Button
                        variant="ghost"
                        onClick={onCancel}
                        className="text-dark dark:text-gray-300  hover:opacity-80"
                        label={cancelText}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className={cn(
                            "text-white",
                            variant === "destructive"
                                ? "bg-red-600  dark:bg-red-700  hover:opacity-80"
                                : "bg-blue-600  dark:bg-blue-700  hover:opacity-80"
                        )}
                        label={confirmText}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}