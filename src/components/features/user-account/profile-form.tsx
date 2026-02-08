import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { FormField } from '../../ui/form-field';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  phoneNumber: z.string().optional(),
});

type ProfileFormInputs = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  onSubmit: (data: ProfileFormInputs) => void;
  initialData?: ProfileFormInputs;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ onSubmit, initialData }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormInputs>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData,
  });

  const handleFormSubmit: SubmitHandler<ProfileFormInputs> = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="First Name" error={errors.firstName?.message}>
          <Input {...register('firstName')} placeholder="John" />
        </FormField>
        <FormField label="Last Name" error={errors.lastName?.message}>
          <Input {...register('lastName')} placeholder="Doe" />
        </FormField>
      </div>
      <FormField label="Email" error={errors.email?.message}>
        <Input {...register('email')} type="email" placeholder="john.doe@example.com" />
      </FormField>
      <FormField label="Phone Number" error={errors.phoneNumber?.message}>
        <Input {...register('phoneNumber')} type="tel" placeholder="(123) 456-7890" />
      </FormField>
      <Button type="submit" className="w-full">
        Save Profile
      </Button>
    </form>
  );
};

export default ProfileForm;
