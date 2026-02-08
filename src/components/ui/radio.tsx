import React from 'react';

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Additional props can be added here if needed
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, ...props }, ref) => {
    const baseStyles =
      'h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500';

    return (
      <input
        type="radio"
        className={`${baseStyles} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Radio.displayName = 'Radio';

export { Radio };
