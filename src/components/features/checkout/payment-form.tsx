import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { FormField } from "../../ui/form/form-field";

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
      <FormField name="cardNumber" label="Card Number">
        <Input placeholder="**** **** **** ****" />
      </FormField>
      <FormField name="cardHolderName" label="Card Holder Name">
        <Input placeholder="John Doe" />
      </FormField>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField name="expirationDate" label="Expiration Date (MM/YY)">
          <Input placeholder="MM/YY" />
        </FormField>
        <FormField name="cvv" label="CVV">
          <Input placeholder="***" />
        </FormField>
      </div>
      <Button type="submit" className="w-full">
        Review Order
      </Button>
    </form>
  );
};

export default PaymentForm;
