"use client";

import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-center"
      className="toaster group"
      style={
        {
          "--normal-bg": "#ffffff",
          "--normal-text": "#000000",
          "--normal-border": "var(--border)",
          "--success-bg": "#ffffff",
          "--success-text": "#000000",
          "--success-border": "#22c55e",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
