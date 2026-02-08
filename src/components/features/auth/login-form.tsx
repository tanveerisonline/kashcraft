import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { FormField } from "../../ui/form-field";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (data: LoginFormInputs) => void;
  isLoading?: boolean;
  error?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading, error }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const handleFormSubmit: SubmitHandler<LoginFormInputs> = (data) => {
    onSubmit(data);
  };

  return (
    <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-6 text-center text-2xl font-bold">Login to your account</h2>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField label="Email" error={errors.email?.message}>
          <Input {...register("email")} type="email" placeholder="john.doe@example.com" />
        </FormField>
        <FormField label="Password" error={errors.password?.message}>
          <Input {...register("password")} type="password" placeholder="********" />
        </FormField>

        {error && <p className="text-center text-sm text-red-500">{error}</p>}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <Link href="/register" className="text-blue-600 hover:underline">
          Register
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-gray-600">
        <Link href="/forgot-password" className="text-blue-600 hover:underline">
          Forgot Password?
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
