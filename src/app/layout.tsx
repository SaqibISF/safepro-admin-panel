import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import AppSidebar from "@/components/AppSidebar";
import Header from "@/components/Header";
import { SidebarInset } from "@/components/ui/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Safe Pro Admin Panel", template: "%s | Safe Pro Admin Panel" },
  description:
    "Safe Pro Admin Panel. Manage users, content, and settings efficiently.",
  icons: "/logo.svg",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers
          themeProps={{
            attribute: "class",
            defaultTheme: "system",
            enableSystem: true,
            storageKey: "admin-panel-theme",
          }}
        >
          <AppSidebar variant="inset" />
          <SidebarInset>
            <Header />
            {children}
          </SidebarInset>
        </Providers>
      </body>
    </html>
  );
}
