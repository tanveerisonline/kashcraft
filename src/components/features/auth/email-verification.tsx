import React from 'react';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { Button } from '../../ui/button';
import Link from 'next/link';

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
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
      <EnvelopeIcon className="w-24 h-24 text-blue-500 mx-auto mb-6" />
      <h2 className="text-2xl font-bold text-gray-800 mb-3">Verify Your Email Address</h2>
      <p className="text-md text-gray-600 mb-6">
        A verification link has been sent to <span className="font-semibold">{email}</span>.
        Please check your inbox and click on the link to activate your account.
      </p>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {successMessage && <p className="text-green-500 text-sm mb-4">{successMessage}</p>}

      <p className="text-sm text-gray-600 mb-4">
        Didn't receive the email?
      </p>
      <Button onClick={onResendVerification} disabled={isLoading}>
        {isLoading ? 'Resending...' : 'Resend Verification Email'}
      </Button>

      <p className="text-center text-sm text-gray-600 mt-6">
        <Link href="/login" className="text-blue-600 hover:underline">
          Back to Login
        </Link>
      </p>
    </div>
  );
};

export default EmailVerification;
