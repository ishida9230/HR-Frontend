"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// TODO: 認証を有効にする際はコメントを外す
// import { useAuth } from "@/lib/auth";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(6, "パスワードは6文字以上で入力してください"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  // TODO: 認証を有効にする際はコメントを外す
  // const { signIn } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async () => {
    try {
      setError("");
      setIsLoading(true);
      //   await signIn(_data.email, _data.password);
      router.push("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ログインに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 [&_label]:text-black">
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md text-sm animate-fade-in">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス</Label>
        <Input
          id="email"
          type="email"
          placeholder="example@example.com"
          {...register("email")}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && <p className="form-error">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">パスワード</Label>
        <Input
          id="password"
          type="password"
          placeholder="パスワードを入力"
          {...register("password")}
          className={errors.password ? "border-destructive" : ""}
        />
        {errors.password && <p className="form-error">{errors.password.message}</p>}
      </div>

      <Button
        type="submit"
        className="w-full transition-all hover:scale-[1.02] active:scale-[0.98]"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="loading-spinner" />
            ログイン中...
          </div>
        ) : (
          "ログイン"
        )}
      </Button>

      <div className="text-center">
        <Link href="/forgot-password" className="text-sm text-gray-500 hover:underline">
          パスワードを忘れた方はこちら
        </Link>
      </div>
    </form>
  );
}
