"use client";

// TODO: 認証を有効にする際はコメントを外す
// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PanelLeftIcon, PanelRightIcon } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // TODO: 認証を有効にする際はコメントを外す
  // const { user, loading } = useAuth();
  // const router = useRouter();

  // useEffect(() => {
  //   if (!loading && !user) {
  //     router.push("/login");
  //   }
  // }, [user, loading, router]);

  // // Show loading state while checking authentication
  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  //     </div>
  //   );
  // }

  // // If no user, don't render anything (redirect will happen)
  // if (!user) {
  //   return null;
  // }

  const toggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev);
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
          backgroundColor: isSidebarVisible ? 'oklch(97% 0.014 254.604)' : 'oklch(99% 0.005 73.684)',
        } as React.CSSProperties
      }
    >
      {isSidebarVisible && <AppSidebar variant="inset" />}
      <SidebarInset style={{ backgroundColor: 'oklch(99% 0.005 73.684)' }}>
        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-2 p-4">
            <Button
              onClick={toggleSidebar}
              size="icon"
              className="bg-white rounded-none shadow-sm hover:bg-white hover:text-black h-8 w-8"
            >
              {isSidebarVisible ? (
                <PanelLeftIcon className="h-2 w-2" />
              ) : (
                <PanelRightIcon className="h-2 w-2" />
              )}
            </Button>
          </div>
          <div className="flex flex-1 flex-col gap-4 px-4 pb-4">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
