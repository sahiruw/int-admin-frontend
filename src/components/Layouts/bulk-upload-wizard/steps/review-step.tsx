// components/Layouts/steps/review-step.tsx
'use client';
import { useEffect, useState } from 'react';

export function ReviewStep({ data, mappings, onComplete, onBack }: {
  data: any[];
  mappings: Record<string, string>;
  onComplete: (selected: number[]) => void;
  onBack: () => void;
}) {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  useEffect(() => {
    setSelectedRows(data.map((_, i) => i));
  }, [data]);


  const toggleRow = (index: number) => {
    setSelectedRows(prev => 
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const toggleAll = () => {
    setSelectedRows(prev => 
      prev.length === data.length ? [] : data.map((_, i) => i)
    );
  };

  return (
    <div>
      <div className="overflow-x-auto" 
        style={{ maxHeight: '53vh', overflow: 'auto' }}
        >

        <table className="w-full ">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedRows.length === data.length}
                  onChange={toggleAll}
                />
              </th>
              {Object.keys(mappings).map((fieldName) => (
                <th key={mappings[fieldName]} className="text-left p-2">{fieldName}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="border-t">
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(index)}
                    onChange={() => toggleRow(index)}
                  />
                </td>
                {Object.entries(mappings).map(([csvHeader, field]) => (
                  <td key={field} className="p-2">{row[csvHeader]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between mt-8">
        <button type="button" onClick={onBack} className="px-3 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-dark-3 disabled:opacity-50 disabled:cursor-not-allowed dark:border-dark-3"
        >
          Back
        </button>
        <button 
          type="button" 
          onClick={() => onComplete(selectedRows)} 
          className="px-3 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-dark-3 disabled:opacity-50 disabled:cursor-not-allowed dark:border-dark-3"

          disabled={selectedRows.length === 0}
        >
          Continue ({selectedRows.length} selected)
        </button>
      </div>
    </div>
  );
}