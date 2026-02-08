import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = "An error occurred",
  message = "Something went wrong. Please try again later.",
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center text-red-600 bg-red-50 rounded-lg border border-red-200",
        className,
      )}
    >
      <AlertCircle className="h-12 w-12 mb-4" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="text-red-600 border-red-300 hover:bg-red-100">
          Retry
        </Button>
      )}
    </div>
  );
};

export default ErrorMessage;
