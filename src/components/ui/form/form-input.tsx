import React from 'react';
import { useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import { Input, InputProps } from '../input'; // Assuming Input component exists in ui
import { FormField } from './form-field';

interface FormInputProps<TFieldValues extends FieldValues = FieldValues> extends InputProps {
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
}

const FormInput = <TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  ...props
}: FormInputProps<TFieldValues>) => {
  return (
    <FormField name={name} label={label} description={description}>
      <Input {...props} />
    </FormField>
  );
};

export { FormInput };
