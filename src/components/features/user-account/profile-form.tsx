import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { FormField } from "../../ui/form/form-field";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField name="firstName" label="First Name">
          <Input placeholder="John" />
        </FormField>
        <FormField name="lastName" label="Last Name">
          <Input placeholder="Doe" />
        </FormField>
      </div>
      <FormField name="email" label="Email">
        <Input type="email" placeholder="john.doe@example.com" />
      </FormField>
      <FormField name="phoneNumber" label="Phone Number">
        <Input type="tel" placeholder="(123) 456-7890" />
      </FormField>
      <Button type="submit" className="w-full">
        Save Profile
      </Button>
    </form>
  );
};

export default ProfileForm;
