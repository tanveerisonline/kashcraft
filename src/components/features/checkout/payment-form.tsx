import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { FormField } from "../../ui/form-field";

const paymentSchema = z.object({
  cardNumber: z
    .string()
    .min(16, "Card number must be 16 digits")
    .max(16, "Card number must be 16 digits"),
  cardHolderName: z.string().min(1, "Card holder name is required"),
  expirationDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, "Invalid expiration date (MM/YY)"),
  cvv: z.string().min(3, "CVV must be 3 or 4 digits").max(4, "CVV must be 3 or 4 digits"),
});

type PaymentFormInputs = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  onSubmit: (data: PaymentFormInputs) => void;
  initialData?: PaymentFormInputs;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit, initialData }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormInputs>({
    resolver: zodResolver(paymentSchema),
    defaultValues: initialData,
  });

  const handleFormSubmit: SubmitHandler<PaymentFormInputs> = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <FormField label="Card Number" error={errors.cardNumber?.message}>
        <Input {...register("cardNumber")} placeholder="**** **** **** ****" />
      </FormField>
      <FormField label="Card Holder Name" error={errors.cardHolderName?.message}>
        <Input {...register("cardHolderName")} placeholder="John Doe" />
      </FormField>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="Expiration Date (MM/YY)" error={errors.expirationDate?.message}>
          <Input {...register("expirationDate")} placeholder="MM/YY" />
        </FormField>
        <FormField label="CVV" error={errors.cvv?.message}>
          <Input {...register("cvv")} placeholder="***" />
        </FormField>
      </div>
      <Button type="submit" className="w-full">
        Review Order
      </Button>
    </form>
  );
};

export default PaymentForm;
