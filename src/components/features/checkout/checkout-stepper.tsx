import React from "react";

interface CheckoutStepperProps {
  steps: string[];
  currentStep: number;
}

const CheckoutStepper: React.FC<CheckoutStepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="mb-8 flex w-full items-center justify-between">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-white ${index <= currentStep ? "bg-blue-600" : "bg-gray-300"}`}
            >
              {index + 1}
            </div>
            <p
              className={`mt-2 text-sm ${index <= currentStep ? "text-blue-600" : "text-gray-500"}`}
            >
              {step}
            </p>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`mx-4 h-1 flex-1 ${index < currentStep ? "bg-blue-600" : "bg-gray-300"}`}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default CheckoutStepper;
