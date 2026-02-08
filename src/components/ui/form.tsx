import { FormField } from "./form/form-field";
import { FormInput } from "./form/form-input";
import { FormTextarea } from "./form/form-textarea";
import { FormSelect } from "./form/form-select";
import { FormCheckbox } from "./form/form-checkbox";
import { FormError } from "./form/form-error";
import { Label } from "./label";

// Define a Form wrapper component
export const Form = ({ children, className, ...props }: React.FormHTMLAttributes<HTMLFormElement>) => {
  return (
    <form className={className} {...props}>
      {children}
    </form>
  );
};

// Define a FormItem wrapper component
export const FormItem = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

// Define a FormLabel component
export const FormLabel = ({ children, className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => {
  return (
    <label className={`block text-sm font-medium text-gray-700 ${className}`} {...props}>
      {children}
    </label>
  );
};

// Define a FormControl wrapper component
export const FormControl = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

// Define a FormMessage component
export const FormMessage = ({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p className={`text-sm text-red-500 ${className}`} {...props}>
      {children}
    </p>
  );
};

// Define a FormDescription component
export const FormDescription = ({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p className={`text-sm text-gray-500 ${className}`} {...props}>
      {children}
    </p>
  );
};

// Export all form-related components
export {
  FormField,
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormError,
};