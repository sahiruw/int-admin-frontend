'use client';

export function Stepper({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <div className="flex justify-center">
      <div className="flex justify-between items-center w-fit">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            <div className="flex items-center gap-1">
              <div className={`w-15 h-5 text-xs rounded-full flex items-center justify-center
                ${index <= currentStep ? 'bg-primary text-white' : 'bg-gray-300 text-gray-600'}`}>
                {index + 1}
              </div>
              {/* <span className={`text-xs ${index <= currentStep ? 'text-primary' : 'text-gray-500'}`}>
                {step}
              </span> */}
            </div>
            {index < steps.length - 1 && (
              <div className={`h-0.5 w-12 mx-3 ${index < currentStep ? 'bg-primary' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
