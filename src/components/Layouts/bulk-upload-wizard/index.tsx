// components/Layouts/bulk-upload-wizard.tsx
'use client';
import { useState } from 'react';
import { Stepper } from './stepper';
import { UploadStep } from './steps/upload-step';
import { MappingStep } from './steps/mapping-step';
import { ReviewStep } from './steps/review-step';
import { ConfirmationStep } from './steps/confirmation-step';

export function BulkUploadWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const steps = ['Upload CSV', 'Map Columns', 'Review Data', 'Confirmation'];

  const handleUploadComplete = (data: any[], headers: string[]) => {
    setCsvData(data);
    setHeaders(headers);
    setCurrentStep(1);
  };

  const handleMappingComplete = (mappings: Record<string, string>) => {
    setMappings(mappings);
    setCurrentStep(2);
  };

  const handleReviewComplete = (selected: number[]) => {
    setSelectedRows(selected);
    setCurrentStep(3);
  };

  return (
    <div className="space-y-8">
      <Stepper steps={steps} currentStep={currentStep} />
      
      {currentStep === 0 && (
        <UploadStep onComplete={handleUploadComplete} />
      )}
      
      {currentStep === 1 && (
        <MappingStep
          headers={headers}
          onComplete={handleMappingComplete}
          onBack={() => setCurrentStep(0)}
        />
      )}
      
      {currentStep === 2 && (
        <ReviewStep
          data={csvData}
          mappings={mappings}
          onComplete={handleReviewComplete}
          onBack={() => setCurrentStep(1)}
        />
      )}
      
      {currentStep === 3 && (
        <ConfirmationStep
          data={csvData}
          selectedRows={selectedRows}
          mappings={mappings}
          onBack={() => setCurrentStep(2)}
          onComplete={() => {/* Add your upload logic here */}}
        />
      )}
    </div>
  );
}