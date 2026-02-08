import React from 'react';
import { useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import { Textarea, TextareaProps } from '../textarea'; // Assuming Textarea component exists in ui
import { FormField } from './form-field';

interface FormTextareaProps<TFieldValues extends FieldValues = FieldValues> extends TextareaProps {
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
}

const FormTextarea = <TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  ...props
}: FormTextareaProps<TFieldValues>) => {
  return (
    <FormField name={name} label={label} description={description}>
      <Textarea {...props} />
    </FormField>
  );
};

export { FormTextarea };
