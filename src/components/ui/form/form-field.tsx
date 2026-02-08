import React from "react";
import { useFormContext, Controller, FieldValues, FieldPath, ControllerRenderProps } from "react-hook-form";
import { Label } from "../label";

// Define the expected props for the child component
type ChildProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> =
  ControllerRenderProps<TFieldValues, TName> & { id: string };

interface FormFieldProps<TFieldValues extends FieldValues = FieldValues> {
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  // Children must be a ReactElement that accepts the ChildProps
  children: React.ReactElement<ChildProps<TFieldValues, FieldPath<TFieldValues>>>;
}

const FormField = <TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  children,
}: FormFieldProps<TFieldValues>) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<TFieldValues>();
  const error = errors[name];

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={name}>{label}</Label>}
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          // Clone the child element and pass the field props
          return React.cloneElement(children, {
            ...field, // Spread all field props
            id: name, // Add id prop
          });
        }}
      />
      {description && <p className="text-sm text-gray-500">{description}</p>}
      {error && <p className="text-sm text-red-500">{error.message as string}</p>}
    </div>
  );
};

export { FormField };
