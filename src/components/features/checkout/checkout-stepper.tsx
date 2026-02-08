import React from 'react';

interface CheckoutStepperProps {
  steps: string[];
  currentStep: number;
}

const CheckoutStepper: React.FC<CheckoutStepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-between w-full mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                ${index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              {index + 1}
            </div>
            <p className={`mt-2 text-sm ${index <= currentStep ? 'text-blue-600' : 'text-gray-500'}`}>
              {step}
            </p>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-1 mx-4
                ${index < currentStep ? 'bg-blue-600' : 'bg-gray-300'}`}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default CheckoutStepper;
