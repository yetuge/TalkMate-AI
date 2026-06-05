import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TalkMate AI",
  description: "Practice real English conversations with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
