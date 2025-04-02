'use client'

import { useLoading } from "@/app/loading-context";

export default function LoadingScreen() {
    const { isLoading } = useLoading();

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-50 bg-white/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500" />
        </div>
    );
}
