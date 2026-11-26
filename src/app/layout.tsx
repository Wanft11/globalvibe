import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GlobalVibe — 跨境营销物料本地化工作台',
  description: '面向跨境品牌的多语种卖点重构、跨文化避坑与海外社媒物料 AI 工作台。',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hans">
      <body>{children}</body>
    </html>
  );
}
