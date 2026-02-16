"use client";

import * as React from "react";
import {
  IconUser,
  IconFileDescription,
  IconUsers,
  IconLogout,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
// TODO: 認証を有効にする際はコメントを外す
// import { useAuth } from "@/lib/auth";

const navItems = [
  {
    title: "プロフィール",
    url: "/dashboard/profile",
    icon: IconUser,
  },
  {
    title: "申請一覧",
    url: "/dashboard/requests",
    icon: IconFileDescription,
  },
  {
    title: "従業員一覧",
    url: "/dashboard/employees",
    icon: IconUsers,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title} asChild>
                    <Link href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
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
