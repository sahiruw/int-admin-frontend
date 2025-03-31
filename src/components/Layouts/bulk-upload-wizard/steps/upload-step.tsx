'use client';
import { useCallback, useState } from 'react';
import Papa from 'papaparse';

export function UploadStep({ onComplete }: {
  onComplete: (data: any[], headers: string[]) => void
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        // const filteredData = results.data.filter((row: any) =>
        //   headers.every((header) => row[header] !== undefined && row[header] !== null && row[header] !== '')
        // );
        const filteredData = results.data.filter((row: any) => "Picture ID" in row && row["Picture ID"] !== null && row["Picture ID"] !== '');
        onComplete(filteredData, headers);
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
      }
    });
  };

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, []);

  return (
    <div className="flex items-center justify-center">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`w-full p-8 border-2 border-dashed rounded-lg text-center transition
          ${isDragging ? 'border-primary bg-gray-50' : 'border-gray-300'}`}

          style={{ height: '60vh', overflow: 'auto' }}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
          id="csv-upload"
        />
        <label
          htmlFor="csv-upload"
          className="cursor-pointer inline-block px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
        >
          Click to upload CSV or drag and drop here
        </label>
        <p className="mt-4 text-xs text-gray-500">
          The CSV must include headers that match your expected data columns.
        </p>
      </div>
    </div>
  );
}
