"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PanelRightIcon } from "lucide-react";

// サイドバーを表示しないパス
const NO_SIDEBAR_PATHS = ["/login", "/"];

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const shouldShowSidebar = !NO_SIDEBAR_PATHS.includes(pathname);

  const toggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev);
  };

  // サイドバーを表示しないパスの場合
  if (!shouldShowSidebar) {
    return <main>{children}</main>;
  }

  // サイドバーを表示するパスの場合
  return (
    <div className="h-screen overflow-hidden">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 60)",
            "--header-height": "calc(var(--spacing) * 12)",
            backgroundColor: isSidebarVisible
              ? "oklch(97% 0.014 254.604)"
              : "oklch(99% 0.005 73.684)",
          } as React.CSSProperties
        }
        className="h-full"
      >
        {isSidebarVisible && (
          <AppSidebar
            variant="inset"
            isSidebarVisible={isSidebarVisible}
            toggleSidebar={toggleSidebar}
          />
        )}
        <SidebarInset style={{ backgroundColor: "oklch(99% 0.005 73.684)" }}>
          <div className="relative flex flex-1 flex-col h-full overflow-hidden">
            {!isSidebarVisible && (
              <Button
                onClick={toggleSidebar}
                size="icon"
                className="absolute left-0 top-4 z-10 bg-white rounded-none shadow-sm hover:bg-white hover:text-black h-8 w-8"
              >
                <PanelRightIcon className="h-2 w-2" />
              </Button>
            )}
            <div className="flex flex-1 flex-col gap-4 px-4 pb-4 overflow-y-auto">{children}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
