import React from "react";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { Button } from "../../ui/button";
import Link from "next/link";

interface EmailVerificationProps {
  email: string;
  onResendVerification: () => void;
  isLoading?: boolean;
  error?: string;
  successMessage?: string;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  onResendVerification,
  isLoading,
  error,
  successMessage,
}) => {
  return (
    <div className="mx-auto max-w-md rounded-lg bg-white p-6 text-center shadow-md">
      <EnvelopeIcon className="mx-auto mb-6 h-24 w-24 text-blue-500" />
      <h2 className="mb-3 text-2xl font-bold text-gray-800">Verify Your Email Address</h2>
      <p className="text-md mb-6 text-gray-600">
        A verification link has been sent to <span className="font-semibold">{email}</span>. Please
        check your inbox and click on the link to activate your account.
      </p>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      {successMessage && <p className="mb-4 text-sm text-green-500">{successMessage}</p>}

      <p className="mb-4 text-sm text-gray-600">Didn't receive the email?</p>
      <Button onClick={onResendVerification} disabled={isLoading}>
        {isLoading ? "Resending..." : "Resend Verification Email"}
      </Button>

      <p className="mt-6 text-center text-sm text-gray-600">
        <Link href="/login" className="text-blue-600 hover:underline">
          Back to Login
        </Link>
      </p>
    </div>
  );
};

export default EmailVerification;
