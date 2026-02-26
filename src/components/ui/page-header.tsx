import * as React from "react";

import { cn } from "@/lib/utils";

interface PageHeaderProps extends React.ComponentProps<"div"> {
  title: string;
  action?: React.ReactNode;
  titleClassName?: string;
}

function PageHeader({ className, title, action, titleClassName, ...props }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-10 border-b border-gray-200 pb-4 px-4 pt-4 flex items-center justify-between",
        className
      )}
      style={{ backgroundColor: "oklch(99% 0.005 73.684)" }}
      {...props}
    >
      <h1 className={cn("text-2xl font-bold ml-4", titleClassName)}>{title}</h1>
      {action && <div>{action}</div>}
    </div>
  );
}

export { PageHeader };
