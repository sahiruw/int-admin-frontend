// components/Layouts/bulk-upload-wizard.tsx
'use client';
import { useState } from 'react';
import { Stepper } from './stepper';
import { UploadStep } from './steps/upload-step';
import { ValidationStep } from './steps/validation-step';
import { ReviewStep } from './steps/review-step';
import { ConfirmationStep } from './steps/confirmation-step';

export function BulkUploadWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const steps = ['Upload CSV', 'Validate Data', 'Review Data', 'Confirmation'];

  const handleUploadComplete = (data: any[], headers: string[]) => {
    setCsvData(data);
    setHeaders(headers);
    setCurrentStep(1);
  };

  const handleValidationComplete = (validation: any) => {
    setValidationResult(validation);
    setCurrentStep(2);
  };

  const handleReviewComplete = (selected: number[]) => {
    setSelectedRows(selected);
    setCurrentStep(3);
  };

  // Create a dummy mappings object for compatibility with existing components
  const dummyMappings = headers.reduce((acc, header) => {
    acc[header] = header; // Map each header to itself
    return acc;
  }, {} as Record<string, string>);
  return (
    <div className="space-y-8">
      <Stepper steps={steps} currentStep={currentStep} />
      
      {currentStep === 0 && (
        <UploadStep onComplete={handleUploadComplete} />
      )}
      
      {currentStep === 1 && (
        <ValidationStep
          data={csvData}
          onComplete={handleValidationComplete}
          onBack={() => setCurrentStep(0)}
        />
      )}
      
      {currentStep === 2 && (
        <ReviewStep
          data={csvData}
          mappings={dummyMappings}
          onComplete={handleReviewComplete}
          onBack={() => setCurrentStep(1)}
          validationResult={validationResult}
        />
      )}
      
      {currentStep === 3 && (
        <ConfirmationStep
          data={csvData}
          selectedRows={selectedRows}
          mappings={dummyMappings}
          onBack={() => setCurrentStep(2)}
          onComplete={() => {/* Add your upload logic here */}}
        />
      )}
    </div>
  );
}