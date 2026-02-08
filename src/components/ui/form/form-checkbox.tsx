import React from 'react';
import { useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import { Checkbox, CheckboxProps } from '../checkbox'; // Assuming Checkbox component exists in ui
import { FormField } from './form-field';
import { Label } from '../label';

interface FormCheckboxProps<TFieldValues extends FieldValues = FieldValues> extends CheckboxProps {
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
}

const FormCheckbox = <TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  ...props
}: FormCheckboxProps<TFieldValues>) => {
  const { control, formState: { errors } } = useFormContext<TFieldValues>();
  const error = errors[name];

  return (
    <div className="flex items-center space-x-2">
      <FormField name={name}>
        <Checkbox {...props} />
      </FormField>
      {label && <Label htmlFor={name}>{label}</Label>}
      {description && <p className="text-sm text-gray-500">{description}</p>}
      {error && <p className="text-sm text-red-500">{error.message as string}</p>}
    </div>
  );
};

export { FormCheckbox };
