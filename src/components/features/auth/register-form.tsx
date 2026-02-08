import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { FormField } from "../../ui/form-field";
import Link from "next/link";

const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address").min(1, "Email is required"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormInputs = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSubmit: (data: RegisterFormInputs) => void;
  isLoading?: boolean;
  error?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, isLoading, error }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  const handleFormSubmit: SubmitHandler<RegisterFormInputs> = (data) => {
    onSubmit(data);
  };

  return (
    <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-6 text-center text-2xl font-bold">Create an account</h2>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label="First Name" error={errors.firstName?.message}>
            <Input {...register("firstName")} placeholder="John" />
          </FormField>
          <FormField label="Last Name" error={errors.lastName?.message}>
            <Input {...register("lastName")} placeholder="Doe" />
          </FormField>
        </div>
        <FormField label="Email" error={errors.email?.message}>
          <Input {...register("email")} type="email" placeholder="john.doe@example.com" />
        </FormField>
        <FormField label="Password" error={errors.password?.message}>
          <Input {...register("password")} type="password" placeholder="********" />
        </FormField>
        <FormField label="Confirm Password" error={errors.confirmPassword?.message}>
          <Input {...register("confirmPassword")} type="password" placeholder="********" />
        </FormField>

        {error && <p className="text-center text-sm text-red-500">{error}</p>}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
};

export default RegisterForm;
