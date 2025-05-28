import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const mooxyFont = localFont({
  src: "../../public/fonts/mooxy/mooxy.ttf",
  variable: "--font-mooxy",
});

export const metadata: Metadata = {
  title: "Prepwise",
  description: "Master Every Topic. Ace Every Exam.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${mooxyFont.variable} antialiased`}>{children}</body>
    </html>
  );
}
