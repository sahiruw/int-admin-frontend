'use client';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface ValidationResult {
  valid: number;
  invalid: Array<{ row: number; issues: string[]; data: any }>;
  missingEntities: {
    breeders: string[];
    varieties: string[];
  };
}

export function ValidationStep({ 
  data, 
  onComplete, 
  onBack 
}: {
  data: any[];
  onComplete: (validationResult: ValidationResult) => void;
  onBack: () => void;
}) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  useEffect(() => {
    validateData();
  }, [data]);

  const validateData = async () => {
    setIsValidating(true);
    try {
      const response = await fetch('/api/csv-mapper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, action: 'validate' })
      });

      const result = await response.json();
      
      if (result.success) {
        setValidationResult(result.validation);
      } else {
        toast.error(result.message || 'Validation failed');
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Failed to validate data');
    } finally {
      setIsValidating(false);
    }
  };

  const handleContinue = () => {
    if (validationResult) {
      onComplete(validationResult);
    }
  };

  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Validating data...</p>
        </div>
      </div>
    );
  }

  if (!validationResult) {
    return (
      <div className="text-center">
        <p className="text-red-600">Validation failed. Please try again.</p>
        <button 
          onClick={validateData}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600"
        >
          Retry Validation
        </button>
      </div>
    );
  }

  const { valid, invalid, missingEntities } = validationResult;
  const hasErrors = invalid.length > 0 || missingEntities.breeders.length > 0 || missingEntities.varieties.length > 0;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="font-medium text-lg mb-2">Validation Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-green-600 font-semibold text-2xl">{valid}</span>
            <p className="text-sm text-gray-600 dark:text-gray-400">Valid records</p>
          </div>
          <div>
            <span className="text-red-600 font-semibold text-2xl">{invalid.length}</span>
            <p className="text-sm text-gray-600 dark:text-gray-400">Invalid records</p>
          </div>
        </div>
      </div>

      {/* Missing Entities */}
      {(missingEntities.breeders.length > 0 || missingEntities.varieties.length > 0) && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            Missing Reference Data
          </h4>
          {missingEntities.breeders.length > 0 && (
            <div className="mb-2">
              <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">Unknown Breeders:</p>
              <ul className="text-xs text-yellow-600 dark:text-yellow-400 list-disc list-inside">
                {missingEntities.breeders.map((breeder, i) => (
                  <li key={i}>{breeder}</li>
                ))}
              </ul>
            </div>
          )}
          {missingEntities.varieties.length > 0 && (
            <div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">Unknown Varieties:</p>
              <ul className="text-xs text-yellow-600 dark:text-yellow-400 list-disc list-inside">
                {missingEntities.varieties.map((variety, i) => (
                  <li key={i}>{variety}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
            Note: Missing customers and shipping locations will be created automatically.
          </p>
        </div>
      )}

      {/* Invalid Records */}
      {invalid.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
            Invalid Records ({invalid.length})
          </h4>
          <div 
            className="max-h-60 overflow-y-auto space-y-2"
          >
            {invalid.map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-2 rounded border">
                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                  Row {item.row}: {item.data['Picture ID'] || 'Unknown'}
                </p>
                <ul className="text-xs text-red-600 dark:text-red-400 list-disc list-inside">
                  {item.issues.map((issue, j) => (
                    <li key={j}>{issue}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success message */}
      {!hasErrors && (
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
            ✅ All Records Valid
          </h4>
          <p className="text-sm text-green-600 dark:text-green-400">
            All {valid} records are ready for import.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Back
        </button>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={validateData}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Re-validate
          </button>
          
          <button
            type="button"
            onClick={handleContinue}
            disabled={valid === 0}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue with {valid} valid records
          </button>
        </div>
      </div>
    </div>
  );
}
