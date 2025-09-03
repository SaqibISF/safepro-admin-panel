import React, { FC, ReactNode } from "react";
import { ThemeProvider, type ThemeProviderProps } from "next-themes";
import { SidebarProvider } from "@/components/ui/sidebar";

const Providers: FC<{
  children: ReactNode;
  themeProps: ThemeProviderProps;
}> = ({ children, themeProps }) => (
  <SidebarProvider
    style={
      {
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties
    }
  >
    <ThemeProvider {...themeProps}>{children}</ThemeProvider>
  </SidebarProvider>
);

export default Providers;
