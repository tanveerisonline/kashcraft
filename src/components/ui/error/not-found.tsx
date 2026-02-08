import React from "react";
import Link from "next/link";
import { Frown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotFoundProps {
  message?: string;
  linkText?: string;
  linkHref?: string;
  className?: string;
}

const NotFound: React.FC<NotFoundProps> = ({
  message = "Oops! The page you're looking for doesn't exist.",
  linkText = "Go to Homepage",
  linkHref = "/",
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-8 text-center text-gray-700",
        className,
      )}
    >
      <Frown className="h-24 w-24 mb-6 text-gray-400" />
      <h1 className="text-5xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8">{message}</p>
      <Link href={linkHref} passHref>
        <Button>{linkText}</Button>
      </Link>
    </div>
  );
};

export default NotFound;
