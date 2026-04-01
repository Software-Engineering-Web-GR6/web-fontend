import React from "react";
import clsx from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = "md",
  hover = false,
}) => {
  const paddingStyles = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      className={clsx(
        "rounded-2xl border border-teal-100/70 bg-white/90 shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur-sm",
        hover && "transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(15,23,42,0.1)]",
        paddingStyles[padding],
        className,
      )}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
}) => {
  return (
    <div className={clsx("mb-4 border-b border-teal-100 pb-3", className)}>
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className,
}) => {
  return (
    <h3 className={clsx("text-lg font-semibold text-slate-900", className)}>
      {children}
    </h3>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className,
}) => {
  return <div className={clsx(className)}>{children}</div>;
};

export default Card;
