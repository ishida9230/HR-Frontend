import * as React from "react";

import { cn } from "@/lib/utils";

interface StackProps extends React.ComponentProps<"div"> {
  gap?: "1" | "2" | "3" | "4" | "5" | "6" | "8" | "10" | "12";
}

const gapMap = {
  "1": "gap-1",
  "2": "gap-2",
  "3": "gap-3",
  "4": "gap-4",
  "5": "gap-5",
  "6": "gap-6",
  "8": "gap-8",
  "10": "gap-10",
  "12": "gap-12",
} as const;

function Stack({ className, gap = "6", ...props }: StackProps) {
  return <div className={cn("flex flex-col", gapMap[gap], className)} {...props} />;
}

export { Stack };
