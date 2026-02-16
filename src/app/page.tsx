"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
// TODO: 認証を有効にする際はコメントを外す
// import { useAuth } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  // TODO: 認証を有効にする際はコメントを外す
  // const { user, loading } = useAuth();

  useEffect(() => {
    // TODO: 認証を有効にする際は以下のロジックを使用
    // if (!loading) {
    //   if (user) {
    //     router.push("/dashboard/profile");
    //   } else {
    //     router.push("/login");
    //   }
    // }

    // 開発用：常にログインページへ
    router.push("/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
