'use client';
import { useCallback, useState } from 'react';
import Papa from 'papaparse';

export function UploadStep({ onComplete }: {
  onComplete: (data: any[], headers: string[]) => void
}) {
  const [isDragging, setIsDragging] = useState(false);  const handleFile = (file: File) => {
    Papa.parse(file, {
      header: false, // Parse without headers first to skip rows
      complete: (results) => {
        // Skip the first 3 rows, then use the 4th row as headers
        const allRows = results.data as string[][];
        
        if (allRows.length < 4) {
          alert('CSV file must have at least 4 rows (3 to skip + 1 header row)');
          return;
        }
        
        // Use the 4th row (index 3) as headers
        const headers = allRows[3] || [];
        
        // Convert remaining rows to objects using the headers
        const dataRows = allRows.slice(4); // Skip first 3 rows + header row
        const dataObjects = dataRows.map(row => {
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] || '';
          });
          return obj;
        });
        
        // Filter data to only include rows with Picture ID
        const filteredData = dataObjects.filter((row: any) => {
          const pictureId = row["Picture ID"] || row["picture_id"] || row["PictureID"];
          return pictureId && pictureId.trim() !== '';
        });
        
        console.log(`Skipped first 3 rows. Loaded ${filteredData.length} rows with Picture ID from ${dataObjects.length} data rows`);
        onComplete(filteredData, headers);
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        alert('Error parsing CSV file: ' + error.message);
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
        />        <label
          htmlFor="csv-upload"
          className="cursor-pointer inline-block px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
        >
          Click to upload CSV or drag and drop here
        </label>        <p className="mt-4 text-xs text-gray-500">
          Upload a CSV file with the input format. The first 3 rows will be automatically skipped, and the 4th row will be used as headers.
          The file must include a "Picture ID" column and other koi data columns.
          Expected columns: Picture ID, Koi ID, Variety, Sex, Age, Size CM, Bre-ID, Breeder, PCS, JPY Cost, Sold to, Ship to, etc.
        </p>
        <p className="mt-2 text-xs text-gray-400">
          Note: Breeders and varieties will be matched automatically. Missing customers and shipping locations will be created.
        </p>
      </div>
    </div>
  );
}
