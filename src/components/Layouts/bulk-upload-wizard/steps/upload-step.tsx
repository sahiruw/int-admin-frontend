// components/Layouts/steps/upload-step.tsx
'use client';
import { useCallback } from 'react';
import Papa from 'papaparse';

export function UploadStep({ onComplete }: { 
  onComplete: (data: any[], headers: string[]) => void 
}) {
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const filteredData = results.data.filter((row: any) =>
        headers.every((header) => row[header] !== undefined && row[header] !== null && row[header] !== '')
        );
        onComplete(filteredData, headers);
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
      }
    });
    }
  }, [onComplete]);

  return (
    <div className="border-2 border-dashed rounded-lg p-8 text-center min-h-36">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="hidden mt-8"
        id="csv-upload"
      />
      <label
        htmlFor="csv-upload"
        className="cursor-pointer p-4 rounded-lg bg-gray-50 hover:bg-gray-100"
      >
        Click to upload CSV or drag and drop
      </label>
      <p className="mt-8 text-sm text-gray-500">
        CSV should include headers matching your data columns
      </p>
    </div>
  );
}