"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui-elements/button";

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
        <div
            className="fixed inset-0 bg-black/50 dark:bg-white/10 flex items-center justify-center p-4 z-50"
            onClick={onCancel} // Close popup when background is clicked
        >
            <div
                className="bg-white dark:bg-dark-1 rounded-lg shadow-xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()} // Prevent click event from propagating to the background
            >
                {/* Header */}
                <div className="bg-[#F7F9FC] dark:bg-dark-2 px-6 py-4 rounded-t-lg">
                    <h3 className="text-lg font-semibold text-dark dark:text-white">{title}</h3>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
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
                </div>

                {/* Footer */}
                <div className="bg-[#F7F9FC] dark:bg-dark-2 px-6 py-4 rounded-b-lg flex justify-end gap-3">
                    <Button
                        label="Cancel"
                        variant="outlinePrimary"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        label="Okay"
                        onClick={handleSubmit}
                    >
                        Okay
                    </Button>
                </div>
            </div>
        </div>
    );
}