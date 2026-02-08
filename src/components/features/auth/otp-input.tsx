import React, { useState, useRef, ChangeEvent, KeyboardEvent } from "react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { FormField } from "../../ui/form-field";

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  isLoading?: boolean;
  error?: string;
}

const OTPInput: React.FC<OTPInputProps> = ({ length = 6, onComplete, isLoading, error }) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value[0] || "";
    setOtp(newOtp);

    // Focus next input
    if (element.value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all inputs are filled, call onComplete
    if (newOtp.every((digit) => digit !== "")) {
      onComplete(newOtp.join(""));
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, length);
    const newOtp = pasteData.split("").concat(new Array(length - pasteData.length).fill(""));
    setOtp(newOtp);
    onComplete(pasteData);
  };

  return (
    <div className="mx-auto max-w-sm rounded-lg bg-white p-6 text-center shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-gray-800">Enter OTP</h2>
      <div className="mb-4 flex justify-center space-x-2">
        {otp.map((digit, index) => (
          <Input
            key={index}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target, index)}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            ref={(el) => (inputRefs.current[index] = el)}
            className="h-12 w-12 text-center text-xl font-bold"
          />
        ))}
      </div>
      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      <Button
        onClick={() => onComplete(otp.join(""))}
        disabled={isLoading || otp.some((digit) => digit === "")}
        className="w-full"
      >
        {isLoading ? "Verifying..." : "Verify"}
      </Button>
    </div>
  );
};

export default OTPInput;
