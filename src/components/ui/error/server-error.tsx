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
        "flex min-h-[calc(100vh-200px)] flex-col items-center justify-center p-8 text-center text-red-700",
        className
      )}
    >
      <ServerCrash className="mb-6 h-24 w-24 text-red-400" />
      <h1 className="mb-4 text-5xl font-bold">500</h1>
      <p className="mb-8 text-xl">{message}</p>
      <Link href={linkHref} passHref>
        <Button>{linkText}</Button>
      </Link>
    </div>
  );
};

export default ServerError;
