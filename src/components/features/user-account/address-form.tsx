import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { FormField } from "../../ui/form/form-field";
import { Checkbox } from "../../ui/checkbox";

const addressSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  addressLine1: z.string().min(1, "Address Line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip Code is required"),
  country: z.string().min(1, "Country is required"),
  isDefault: z.boolean(),
});

type AddressFormInputs = z.infer<typeof addressSchema>;

interface AddressFormProps {
  onSubmit: (data: AddressFormInputs) => void;
  initialData?: AddressFormInputs;
  onCancel?: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AddressFormInputs>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      isDefault: false,
      ...initialData,
    },
  });

  const handleFormSubmit: SubmitHandler<AddressFormInputs> = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <FormField name="fullName" label="Full Name">
        <Input placeholder="John Doe" />
      </FormField>
      <FormField name="addressLine1" label="Address Line 1">
        <Input placeholder="123 Main St" />
      </FormField>
      <FormField name="addressLine2" label="Address Line 2">
        <Input placeholder="Apartment, suite, etc. (optional)" />
      </FormField>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField name="city" label="City">
          <Input placeholder="New York" />
        </FormField>
        <FormField name="state" label="State">
          <Input placeholder="NY" />
        </FormField>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField name="zipCode" label="Zip Code">
          <Input placeholder="10001" />
        </FormField>
        <FormField name="country" label="Country">
          <Input placeholder="USA" />
        </FormField>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="isDefault" {...register("isDefault")} />
        <label
          htmlFor="isDefault"
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Set as default address
        </label>
      </div>
      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">Save Address</Button>
      </div>
    </form>
  );
};

export default AddressForm;
