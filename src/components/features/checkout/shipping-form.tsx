import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { FormField } from '../../ui/form-field';

const shippingSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  addressLine1: z.string().min(1, 'Address Line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'Zip Code is required'),
  country: z.string().min(1, 'Country is required'),
});

type ShippingFormInputs = z.infer<typeof shippingSchema>;

interface ShippingFormProps {
  onSubmit: (data: ShippingFormInputs) => void;
  initialData?: ShippingFormInputs;
}

const ShippingForm: React.FC<ShippingFormProps> = ({ onSubmit, initialData }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormInputs>({
    resolver: zodResolver(shippingSchema),
    defaultValues: initialData,
  });

  const handleFormSubmit: SubmitHandler<ShippingFormInputs> = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <FormField label="Full Name" error={errors.fullName?.message}>
        <Input {...register('fullName')} placeholder="John Doe" />
      </FormField>
      <FormField label="Address Line 1" error={errors.addressLine1?.message}>
        <Input {...register('addressLine1')} placeholder="123 Main St" />
      </FormField>
      <FormField label="Address Line 2" error={errors.addressLine2?.message}>
        <Input {...register('addressLine2')} placeholder="Apartment, suite, etc. (optional)" />
      </FormField>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="City" error={errors.city?.message}>
          <Input {...register('city')} placeholder="New York" />
        </FormField>
        <FormField label="State" error={errors.state?.message}>
          <Input {...register('state')} placeholder="NY" />
        </FormField>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Zip Code" error={errors.zipCode?.message}>
          <Input {...register('zipCode')} placeholder="10001" />
        </FormField>
        <FormField label="Country" error={errors.country?.message}>
          <Input {...register('country')} placeholder="USA" />
        </FormField>
      </div>
      <Button type="submit" className="w-full">
        Continue to Payment
      </Button>
    </form>
  );
};

export default ShippingForm;
