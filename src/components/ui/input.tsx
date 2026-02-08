import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Additional props can be added here if needed
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    const baseStyles =
      "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

    return <input type={type} className={`${baseStyles} ${className}`} ref={ref} {...props} />;
  }
);
Input.displayName = "Input";

export { Input };
