import React from "react";
import { useFormContext, FieldValues, FieldPath } from "react-hook-form";
import { Select, SelectProps } from "../select"; // Assuming Select component exists in ui
import { FormField } from "./form-field";

interface FormSelectProps<TFieldValues extends FieldValues = FieldValues> extends SelectProps {
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  options: { value: string; label: string }[];
}

const FormSelect = <TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  options,
  ...props
}: FormSelectProps<TFieldValues>) => {
  return (
    <FormField name={name} label={label} description={description}>
      <Select {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </FormField>
  );
};

export { FormSelect };
