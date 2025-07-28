// components/Layouts/steps/review-step.tsx
'use client';
import { useEffect, useState, useMemo } from 'react';

export function ReviewStep({ data, mappings, onComplete, onBack, validationResult }: {
  data: any[];
  mappings: Record<string, string>;
  onComplete: (selected: number[]) => void;
  onBack: () => void;
  validationResult?: any;
}) {  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [mappedData, setMappedData] = useState<any[]>([]);
  const [isMapping, setIsMapping] = useState(false);
  const [mappingError, setMappingError] = useState<string | null>(null);

  // Filter to show only valid rows if validation result is available
  const validRowIndices = useMemo(() => {
    return validationResult?.invalid ? 
      data.map((_, index) => index).filter(index => 
        !validationResult.invalid.some((invalid: any) => invalid.row - 1 === index)
      ) : 
      data.map((_, index) => index);
  }, [data, validationResult]);

  useEffect(() => {
    // Pre-select all valid rows
    setSelectedRows(validRowIndices);
  }, [data, validationResult]);

  // Map data to database format when component loads
  useEffect(() => {
    const mapDataToDbFormat = async () => {
      setIsMapping(true);
      setMappingError(null);
      
      try {
        // Get only valid data
        const validData = validRowIndices.map(index => data[index]);
        
        // Map the data using the CSV mapper
        const mapResponse = await fetch('/api/csv-mapper', {
          method: 'POST',
          body: JSON.stringify({ data: validData, action: 'map' }),
          headers: { 'Content-Type': 'application/json' }
        });
        const mapResult = await mapResponse.json();

        if (!mapResult.success) {
          throw new Error(mapResult.message || 'Failed to map data');
        }

        setMappedData(mapResult.mapped);
      } catch (error) {
        console.error('Error mapping data:', error);
        setMappingError(error instanceof Error ? error.message : 'Failed to map data');
      } finally {
        setIsMapping(false);
      }
    };

    if (validRowIndices.length > 0) {
      mapDataToDbFormat();
    }
  }, [data, validRowIndices]);

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

  // Database column headers (what will actually be stored)
  const dbColumns = [
    { key: 'picture_id', label: 'Picture ID' },
    { key: 'koi_id', label: 'Variety ID' },
    { key: 'sex', label: 'Sex' },
    { key: 'age', label: 'Age' },
    { key: 'size_cm', label: 'Size (cm)' },
    { key: 'breeder_id', label: 'Breeder ID' },
    { key: 'pcs', label: 'PCS' },
    { key: 'jpy_cost', label: 'JPY Cost' },
    { key: 'customer_id', label: 'Customer ID' },
    { key: 'ship_to', label: 'Ship To ID' },
    { key: 'sale_price_jpy', label: 'Sale Price JPY' },
    { key: 'sale_price_usd', label: 'Sale Price USD' },
    { key: 'comm', label: 'Commission Rate' },
    { key: 'rate', label: 'Exchange Rate' },
  ];

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

      {mappingError && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">Mapping Error</h3>
          <p className="text-sm text-red-600 dark:text-red-400">{mappingError}</p>
        </div>
      )}

      <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">Database Preview</h3>
        <p className="text-sm text-green-600 dark:text-green-400">
          This shows the data exactly as it will be stored in the database, with all transformations applied.
        </p>
      </div>

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
                  disabled={isMapping}
                />
              </th>
              {dbColumns.map((col) => (
                <th key={col.key} className="text-left p-2">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isMapping ? (
              <tr>
                <td colSpan={dbColumns.length + 1} className="p-4 text-center text-gray-500">
                  Mapping data to database format...
                </td>
              </tr>
            ) : mappedData.length > 0 ? (
              mappedData.map((item, index) => {
                const originalIndex = validRowIndices[index];
                return (
                  <tr key={index} className="border-t">
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(originalIndex)}
                        onChange={() => toggleRow(originalIndex)}
                      />
                    </td>
                    {dbColumns.map((col) => (
                      <td key={col.key} className="p-2">
                        {item[col.key] === null || item[col.key] === undefined 
                          ? '-' 
                          : typeof item[col.key] === 'number' 
                            ? item[col.key].toLocaleString() 
                            : String(item[col.key])
                        }
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={dbColumns.length + 1} className="p-4 text-center text-gray-500">
                  No data to display
                </td>
              </tr>
            )}
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

          disabled={selectedRows.length === 0 || isMapping}
        >
          Continue ({selectedRows.length} selected)
        </button>
      </div>
    </div>
  );
}