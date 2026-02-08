import React from "react";
import { useFormContext, Controller, FieldValues, FieldPath } from "react-hook-form";
import { Label } from "../label";

interface FormFieldProps<TFieldValues extends FieldValues = FieldValues> {
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  children: React.ReactNode;
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
          const child = React.isValidElement(children) ? children : null;
          if (!child) {
            return null;
          }
          return React.cloneElement(child, {
            value: field.value,
            onChange: field.onChange,
            id: name,
          });
        }}
      />
      {description && <p className="text-sm text-gray-500">{description}</p>}
      {error && <p className="text-sm text-red-500">{error.message as string}</p>}
    </div>
  );
};

export { FormField };
