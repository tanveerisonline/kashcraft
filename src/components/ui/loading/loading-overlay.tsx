import React from "react";
import Spinner from "./spinner";
import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  spinnerSize?: "small" | "medium" | "large";
  overlayClassName?: string;
  spinnerClassName?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  spinnerSize = "medium",
  overlayClassName,
  spinnerClassName,
}) => {
  return (
    <div className="relative">
      {isLoading && (
        <div
          className={cn(
            "bg-opacity-70 absolute inset-0 z-10 flex items-center justify-center bg-white",
            overlayClassName
          )}
        >
          <Spinner size={spinnerSize} className={spinnerClassName} />
        </div>
      )}
      {children}
    </div>
  );
};

export default LoadingOverlay;
