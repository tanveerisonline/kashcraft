import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  // Additional props can be added here if needed
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    const baseStyles = "rounded-lg border bg-white shadow-sm";

    return (
      <div ref={ref} className={`${baseStyles} ${className}`} {...props}>
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export { Card };
