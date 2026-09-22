import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const inter = localFont({
  src: "./fonts/Inter-Variable.woff2",
  variable: "--font-sans",
  display: "swap",
  weight: "100 900",
  fallback: [
    "system-ui",
    "-apple-system",
    "Segoe UI",
    "PingFang SC",
    "Microsoft YaHei",
    "sans-serif",
  ],
});

export const metadata: Metadata = {
  title: {
    default: "TalkMate AI · AI 英语口语陪练",
    template: "%s · TalkMate AI",
  },
  description:
    "选择真实场景，用语音或文本和 AI 练习英语对话，获得即时纠错反馈和课后学习报告。",
  keywords: [
    "AI 英语口语",
    "英语口语陪练",
    "口语纠错",
    "Next.js",
    "DeepSeek",
    "Supabase",
  ],
  authors: [{ name: "TalkMate AI" }],
  openGraph: {
    title: "TalkMate AI · AI 英语口语陪练",
    description:
      "场景化英语口语练习：AI 实时对话、即时纠错反馈、课后学习报告与历史记录。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={inter.variable} lang="zh-CN">
      <body className="font-sans">{children}</body>
    </html>
  );
}
