// app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 1. 导入我们的 AuthProvider
import { AuthProvider } from "@/context/AuthContext";

// 1. 导入 Navbar
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
      <body className={inter.className}>
        {/* 2. 用 AuthProvider 把所有内容(children)包裹起来 */}
        <AuthProvider>
          {/* 这里我们可以放一个全局的 Navbar */}
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}