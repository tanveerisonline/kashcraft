import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { FormField } from '../../ui/form-field';
import Link from 'next/link';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFormInputs = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  onSubmit: (data: ResetPasswordFormInputs) => void;
  isLoading?: boolean;
  error?: string;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onSubmit, isLoading, error }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormInputs>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const handleFormSubmit: SubmitHandler<ResetPasswordFormInputs> = (data) => {
    onSubmit(data);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Reset Your Password</h2>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField label="New Password" error={errors.password?.message}>
          <Input {...register('password')} type="password" placeholder="********" />
        </FormField>
        <FormField label="Confirm New Password" error={errors.confirmPassword?.message}>
          <Input {...register('confirmPassword')} type="password" placeholder="********" />
        </FormField>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>
      <p className="text-center text-sm text-gray-600 mt-4">
        <Link href="/login" className="text-blue-600 hover:underline">
          Back to Login
        </Link>
      </p>
    </div>
  );
};

export default ResetPasswordForm;
