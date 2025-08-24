import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`rounded-xl bg-white shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow ${className}`}
    >
      {children}
    </div>
  );
};
