import React from "react";

interface SectionTitleProps {
  children: React.ReactNode;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ children }) => {
  return (
    <h2 className="text-xl font-semibold text-gray-800 mb-3">{children}</h2>
  );
};
