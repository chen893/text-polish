// 'use client';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/shared/header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '智能文本校对助手',
  description: '基于 AI 的智能文本校对和优化工具',
  icons: {
    icon: '/favicon.svg', // SVG favicon
    shortcut: '/favicon.svg', // 为了兼容性
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="relative">
            <div className="bg-grid-pattern pointer-events-none absolute inset-0 opacity-[0.02]" />
            <Header />
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
