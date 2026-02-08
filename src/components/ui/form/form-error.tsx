import React from "react";
import { useFormContext, FieldValues, FieldPath } from "react-hook-form";

interface FormErrorProps<TFieldValues extends FieldValues = FieldValues> {
  name: FieldPath<TFieldValues>;
  className?: string;
}

const FormError = <TFieldValues extends FieldValues = FieldValues>({
  name,
  className,
}: FormErrorProps<TFieldValues>) => {
  const {
    formState: { errors },
  } = useFormContext<TFieldValues>();
  const error = errors[name];

  if (!error) {
    return null;
  }

  return <p className={`text-sm text-red-500 ${className}`}>{error.message as string}</p>;
};

export { FormError };
