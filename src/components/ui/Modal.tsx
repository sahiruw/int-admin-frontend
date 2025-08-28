"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    className?: string;
    children: React.ReactNode;
};

export function Modal({ isOpen, onClose, title, className, children }: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleEscape);
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" 
            onClick={onClose}
        >
            <div 
                ref={modalRef}
                className={cn(
                    "bg-white dark:bg-dark-1 rounded-lg shadow-xl max-w-md w-full",
                    className
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {title && (
                    <div className="bg-[#F7F9FC] dark:bg-dark-2 px-6 py-4 rounded-t-lg">
                        <h3 className="text-lg font-semibold text-dark dark:text-white">{title}</h3>
                    </div>
                )}
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

type ConfirmButtonProps = {
    onClick: () => void;
    className?: string;
    disabled?: boolean;
    variant?: "primary" | "danger" | "success";
    children: React.ReactNode;
}

export function ConfirmButton({ onClick, className, disabled, variant = "primary", children }: ConfirmButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "px-4 py-2 rounded-md font-medium text-white",
                {
                    "bg-blue-600 hover:bg-blue-700": variant === "primary",
                    "bg-red-600 hover:bg-red-700": variant === "danger",
                    "bg-green-600 hover:bg-green-700": variant === "success",
                },
                "disabled:opacity-50 disabled:cursor-not-allowed",
                className
            )}
        >
            {children}
        </button>
    );
}

export function CancelButton({ onClick, className, disabled, children }: Omit<ConfirmButtonProps, 'variant'>) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "px-4 py-2 rounded-md font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                className
            )}
        >
            {children}
        </button>
    );
}

export function ModalFooter({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn("bg-[#F7F9FC] dark:bg-dark-2 px-6 py-4 rounded-b-lg flex justify-end gap-3", className)}>
            {children}
        </div>
    );
}

export function InputField({ 
    label, 
    type = "text", 
    value, 
    onChange, 
    placeholder, 
    required = false,
    onKeyDown
}: { 
    label: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-dark dark:text-gray-300 mb-2">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={onChange}                placeholder={placeholder}
                required={required}
                onKeyDown={onKeyDown}
                className={cn(
                    "w-full px-3 py-2 border rounded-md",
                    "border-[#eee] dark:border-dark-3",
                    "bg-white dark:bg-dark-2",
                    "text-dark dark:text-white",
                    "focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                )}
            />
        </div>
    );
}
