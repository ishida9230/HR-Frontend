"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // ダッシュボードルートにアクセスしたらプロフィールにリダイレクト
    router.push("/profile");
  }, [router]);

  return null;
}
