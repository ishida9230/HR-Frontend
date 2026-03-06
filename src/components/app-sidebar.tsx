"use client";

import * as React from "react";
import { IconUser, IconFileDescription, IconUsers, IconLogout } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PanelLeftIcon, PanelRightIcon } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
// TODO: 認証を有効にする際はコメントを外す
// import { useAuth } from "@/lib/auth";

const navItems = [
  {
    title: "プロフィール",
    url: "/profile",
    icon: IconUser,
  },
  {
    title: "申請一覧",
    url: "/requests/count",
    icon: IconFileDescription,
  },
  {
    title: "従業員一覧",
    url: "/dashboard/employees",
    icon: IconUsers,
  },
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  isSidebarVisible: boolean;
  toggleSidebar: () => void;
}

export function AppSidebar({ isSidebarVisible, toggleSidebar, ...props }: AppSidebarProps) {
  const router = useRouter();
  // TODO: 認証を有効にする際はコメントを外す
  // const { signOut } = useAuth();

  const handleLogout = async () => {
    // TODO: 認証を有効にする際はコメントを外す
    // await signOut();
    router.push("/login");
  };

  return (
    <Sidebar collapsible="offcanvas" className="relative" {...props}>
      <SidebarContent className="flex flex-col">
        {/* ナビゲーション項目 */}
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {navItems.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <div className="flex items-center justify-between w-full">
                    <SidebarMenuButton tooltip={item.title} asChild className="flex-1">
                      <Link href={item.url}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {index === 0 && (
                      <Button
                        onClick={toggleSidebar}
                        size="icon"
                        className="bg-white rounded-none shadow-sm hover:bg-white hover:text-black h-8 w-8 ml-2"
                      >
                        {isSidebarVisible ? (
                          <PanelLeftIcon className="h-2 w-2" />
                        ) : (
                          <PanelRightIcon className="h-2 w-2" />
                        )}
                      </Button>
                    )}
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="ログアウト"
              onClick={handleLogout}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <IconLogout />
              <span>ログアウト</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
