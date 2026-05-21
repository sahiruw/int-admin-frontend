"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Modal, ModalFooter, ConfirmButton, CancelButton } from "@/components/ui/Modal";

type Field = {
    key: string;
    header: string;
    type?: "text" | "number" | "email" | "password" | "date";
    required?: boolean;
};

interface PopupProps {
    title: string;
    fields: Field[];
    initialData?: Record<string, any>;
    onOkay: (data: Record<string, any>) => void;
    onCancel: () => void;
}

export function FormPopup({ title, fields, initialData = {}, onOkay, onCancel }: PopupProps) {
    const [formData, setFormData] = useState<Record<string, any>>(initialData);

    const handleChange = (key: string, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = () => {
        if (fields.some((field) => field.required && !formData[field.key])) return;
        onOkay(formData);
    };

    return (
        <Modal isOpen={true} onClose={onCancel} title={title} contentClassName="space-y-4 pb-0">
            {fields.map((field) => (
                <div key={field.key}>
                    <label className="block text-sm font-medium text-dark dark:text-gray-300 mb-2">
                        {field.header}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <input
                        type={field.type || "text"}
                        value={formData[field.key] || ""}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className={cn(
                            "w-full px-3 py-2 border rounded-md",
                            "border-[#eee] dark:border-dark-3",
                            "bg-white dark:bg-dark-2",
                            "text-dark dark:text-white",
                            "focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        )}
                        required={field.required}
                    />
                </div>
            ))}

            <ModalFooter className="-mx-6 mt-6 mb-0 rounded-b-lg">
                <CancelButton onClick={onCancel}>Cancel</CancelButton>
                <ConfirmButton onClick={handleSubmit}>Okay</ConfirmButton>
            </ModalFooter>
        </Modal>
    );
}
