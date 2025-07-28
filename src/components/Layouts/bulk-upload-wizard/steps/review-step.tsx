// components/Layouts/steps/review-step.tsx
'use client';
import { useEffect, useState } from 'react';

export function ReviewStep({ data, mappings, onComplete, onBack, validationResult }: {
  data: any[];
  mappings: Record<string, string>;
  onComplete: (selected: number[]) => void;
  onBack: () => void;
  validationResult?: any;
}) {  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Filter to show only valid rows if validation result is available
  const validRowIndices = validationResult?.invalid ? 
    data.map((_, index) => index).filter(index => 
      !validationResult.invalid.some((invalid: any) => invalid.row - 1 === index)
    ) : 
    data.map((_, index) => index);

  const displayData = validRowIndices.map(index => ({ originalIndex: index, data: data[index] }));

  useEffect(() => {
    // Pre-select all valid rows
    setSelectedRows(validRowIndices);
  }, [data, validationResult]);

  const toggleRow = (originalIndex: number) => {
    setSelectedRows(prev => 
      prev.includes(originalIndex)
        ? prev.filter(i => i !== originalIndex)
        : [...prev, originalIndex]
    );
  };

  const toggleAll = () => {
    setSelectedRows(prev => 
      prev.length === validRowIndices.length ? [] : [...validRowIndices]
    );
  };
  return (
    <div>
      {validationResult && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Validation Summary</h3>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Showing {validRowIndices.length} valid records out of {data.length} total records.
            {validationResult.invalid?.length > 0 && (
              <span className="text-red-600 dark:text-red-400">
                {' '}({validationResult.invalid.length} invalid records hidden)
              </span>
            )}
          </p>
        </div>
      )}

      <div className="overflow-x-auto" 
        style={{ maxHeight: '53vh', overflow: 'auto' }}
        >

        <table className="w-full ">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedRows.length === validRowIndices.length && validRowIndices.length > 0}
                  onChange={toggleAll}
                />
              </th>
              {Object.keys(mappings).map((fieldName) => (
                <th key={mappings[fieldName]} className="text-left p-2">{fieldName}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.map((item, index) => (
              <tr key={index} className="border-t">
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(item.originalIndex)}
                    onChange={() => toggleRow(item.originalIndex)}
                  />
                </td>
                {Object.entries(mappings).map(([csvHeader, field]) => (
                  <td key={field} className="p-2">{item.data[csvHeader]}</td>
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