// app/layout.tsx (Reddit 三栏布局版)

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import AIChatWindow from "@/components/AIChatWindow";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "社交购物平台",
  description: "仿 Reddit 风格的社交电商",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100 min-h-screen`}>
        <AuthProvider>
          {/* 1. 顶部导航 (Fixed) */}
          <Navbar /> 

          {/* 2. 主布局容器 (Top padding 留给 Navbar) */}
          <div className="pt-16 max-w-[1800px] mx-auto flex justify-center">
             
             {/* 左侧边栏 (Fixed) */}
             <div className="hidden lg:block w-64 flex-shrink-0">
                <LeftSidebar />
             </div>

             {/* 中间内容区域 (Fluid width) */}
             {/* flex-1 让它占据剩余空间，max-w 限制阅读宽度 */}
             <main className="flex-1 max-w-3xl w-full p-4 min-h-screen">
                {children}
             </main>

             {/* 右侧边栏 (Fixed) */}
             <div className="hidden xl:block w-80 flex-shrink-0">
                <RightSidebar />
             </div>

          </div>
          <MobileBottomNav />

          {/* 放置 AI 悬浮窗 */}
          <AIChatWindow />
        </AuthProvider>
      </body>
    </html>
  );
}