import * as React from "react";

import { cn } from "@/lib/utils";

interface PageHeaderProps extends React.ComponentProps<"div"> {
  title: string;
  action?: React.ReactNode;
  titleClassName?: string;
}

function PageHeader({ className, title, action, titleClassName, ...props }: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between", className)} {...props}>
      <h1 className={cn("text-2xl font-bold ml-4", titleClassName)}>{title}</h1>
      {action && <div>{action}</div>}
    </div>
  );
}

export { PageHeader };
