import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import AppSidebar from "@/components/AppSidebar";
import Header from "@/components/Header";
import { SidebarInset } from "@/components/ui/sidebar";
import { headers } from "next/headers";
import { Toaster } from "@/components/ui/sonner";
import {
  IconAlertCircleFilled,
  IconAlertTriangleFilled,
  IconCircleCheckFilled,
  IconInfoCircleFilled,
} from "@tabler/icons-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SafePro Admin Panel",
    template: "%s | SafePro Admin Panel",
  },
  description:
    "SafePro Admin Panel. Manage users, content, and settings efficiently.",
  icons: "/logo.svg",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname");
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
          {pathname === "/login" ? (
            children
          ) : (
            <>
              <AppSidebar variant="inset" />
              <SidebarInset>
                <Header />
                {children}
              </SidebarInset>
            </>
          )}
          <Toaster
            icons={{
              success: (
                <IconCircleCheckFilled className="text-green-500 size-5" />
              ),
              error: (
                <IconAlertCircleFilled className="text-destructive size-5" />
              ),
              warning: (
                <IconAlertTriangleFilled className="text-yellow-500 size-5" />
              ),
              info: <IconInfoCircleFilled className="text-cyan-500 size-5" />,
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
