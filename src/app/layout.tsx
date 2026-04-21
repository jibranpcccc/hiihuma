import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import SideNav from "@/components/SideNav";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ultimate Humanizer v2",
  description: "AI Text Evasion and Humanization Engine",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${outfit.variable} h-full font-sans antialiased text-neutral-100 bg-transparent`}>
      <body suppressHydrationWarning className="min-h-full flex bg-transparent">
        <SideNav />
        <main className="flex-1 ml-16 md:ml-48 min-h-screen overflow-auto relative z-10">{children}</main>
      </body>
    </html>
  );
}
