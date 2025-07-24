'use client';

import { Select } from "@/components/FormElements/select";
import { PermissionGuard } from "@/components/PermissionGuard";
import { useState, useEffect } from 'react';

const FIELD_OPTIONS = [
  { label: "Picture ID", value: "picture_id" },
  { label: 'Koi ID', value: 'koi_id' },
  { label: 'Breeder ID', value: 'breeder_id' },
  { label: 'Age', value: 'age' },
  { label: 'Size (cm)', value: 'size_cm' },
  { label: 'Sex', value: 'sex' },
  { label: 'Cost (JPY)', value: 'jpy_cost' },
  { label: "No Of Pcs", value: "pcs" },
  { label: "Sold To", value: "sold_to" },
  { label: "Ship To", value: "ship_to" },
  { label: 'Ignore', value: 'ignore' },
];


function guessField(header: string): string {
  const clean = header.toLowerCase().replace(/\s|-/g, '');
  console.log(clean);
  let match = FIELD_OPTIONS.find(option => clean.includes(option.value.replace(/_/g, '')));
  match = match ? match : clean.includes('breid') ? FIELD_OPTIONS[2] : undefined;

  return match ? match.value : 'ignore';
}

export function MappingStep({
  headers,
  onComplete,
  onBack,
}: {
  headers: string[];
  onComplete: (mappings: Record<string, string>) => void;
  onBack: () => void;
}) {
  const [mappings, setMappings] = useState<Record<string, string>>({});

  // Auto-map on initial render
  useEffect(() => {
    const initialMappings: Record<string, string> = {};
    headers.forEach(header => {
      initialMappings[header] = guessField(header);
    });

    setMappings(initialMappings);
  }, [headers]);

  const handleSubmit = () => {
    const filteredMappings = Object.fromEntries(
      Object.entries(mappings).filter(([_, value]) => value !== 'ignore')
    );
    onComplete(filteredMappings);
  };

  return (
    <div className="space-y-1">
      <div
        className="overflow-x-auto"
        style={{ maxHeight: '55vh', overflow: 'auto' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {headers.map((header) => (
            <div key={header} className="flex items-center gap-4">
              <span className="w-32">{header}</span>
              <Select
                items={FIELD_OPTIONS}
                onChange={(value) =>
                  setMappings((prev) => ({ ...prev, [header]: value }))
                }
                value={mappings[header] || 'ignore'}
              />
            </div>
          ))}
        </div>
      </div>      <div className="flex justify-between mt-12">
        <button
          type="button"
          onClick={onBack}
          className="mt-3 px-3 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-dark-3 disabled:opacity-50 disabled:cursor-not-allowed dark:border-dark-3"
        >
          Back
        </button>
        <PermissionGuard 
          resource="koi" 
          action="bulk_upload"
          fallback={
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-3 px-3 py-2">
              You don't have permission to upload data
            </div>
          }
        >
          <button
            type="button"
            onClick={handleSubmit}
            className="mt-3 px-3 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-dark-3 disabled:opacity-50 disabled:cursor-not-allowed dark:border-dark-3"
          >
            Continue
          </button>
        </PermissionGuard>
      </div>
    </div>
  );
}
