import React from "react";
import Link from "next/link";
import { ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ServerErrorProps {
  message?: string;
  linkText?: string;
  linkHref?: string;
  className?: string;
}

const ServerError: React.FC<ServerErrorProps> = ({
  message = "Oops! Something went wrong on our server.",
  linkText = "Go to Homepage",
  linkHref = "/",
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-8 text-center text-red-700",
        className,
      )}
    >
      <ServerCrash className="h-24 w-24 mb-6 text-red-400" />
      <h1 className="text-5xl font-bold mb-4">500</h1>
      <p className="text-xl mb-8">{message}</p>
      <Link href={linkHref} passHref>
        <Button>{linkText}</Button>
      </Link>
    </div>
  );
};

export default ServerError;
