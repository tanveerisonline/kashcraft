import React from 'react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Additional props can be added here if needed
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    const baseStyles =
      'h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500';

    return (
      <input
        type="checkbox"
        className={`${baseStyles} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
