import type { Metadata } from "next";
// import localFont from "next/font/local";
// import "./globals.css";
// const mooxyFont = localFont({
//   src: "../../public/fonts/mooxy/mooxy.ttf",
//   variable: "--font-mooxy",
// });
// import { Inter } from "next/font/google";
// const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
import { Montserrat } from "next/font/google";
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/providers/QueryProvider";

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
      <body className={`${montserrat.variable} antialiased`}>
        <QueryProvider>{children}</QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
