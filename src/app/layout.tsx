import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { QueryProvider } from "@/lib/query-provider";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { ErrorBoundary } from "@/components/error-boundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HRシステム",
  description: "人事管理システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
      >
        <QueryProvider>
          {/* <AuthProvider> */}
          <ErrorBoundary>
            <LayoutWrapper>{children}</LayoutWrapper>
          </ErrorBoundary>
          {/* </AuthProvider> */}
        </QueryProvider>
      </body>
    </html>
  );
}
