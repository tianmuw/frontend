// app/layout.tsx (Tailwind 版本)

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // (!!) 确保 globals.css (它包含了 Tailwind) 被导入
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "社交购物平台",
  description: "由 Gemini 和你共同创建",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* (!!!) 1. 给 body 添加一个柔和的灰色背景 (!!!) */}
      <body className={`${inter.className} bg-gray-100 min-h-screen`}>
        <AuthProvider>
          {/* Navbar 现在会在一个白色背景的容器里 */}
          <Navbar /> 

          {/* (!!!) 2. 创建一个居中、有最大宽度的"容器" (!!!) */}
          {/* 就像 Reddit/微博 的主内容区 */}
          <main className="max-w-4xl mx-auto p-4">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}