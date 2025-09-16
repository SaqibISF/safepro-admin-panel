"use client";

import React, { ComponentProps, FC } from "react";
import {
  IconCube,
  IconDashboard,
  IconLoadBalancer,
  IconServer,
  IconUsersGroup,
  IconUserStar,
  IconVersions,
  IconWorldStar,
} from "@tabler/icons-react";

import NavUser from "@/components/NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import AppLogo from "./AppLogo";
import Link from "next/link";
import {
  DASHBOARD_PAGE_PATH,
  LOAD_BALANCER_PAGE_PATH,
  PLANS_PAGE_PATH,
  USERS_PAGE_PATH,
  VPN_ACCOUNTS_PAGE_PATH,
  VPN_SERVERS_PAGE_PATH,
  VPS_GROUPS_PAGE_PATH,
  VPS_SERVERS_PAGE_PATH,
} from "@/lib/pathnames";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const user = {
  name: "M Saqib Ali",
  email: "MSaqibAliISF@gmail.com",
  avatar: "/avatars/saqib.jpg",
};

const navGroups = [
  {
    label: "",
    items: [
      {
        href: DASHBOARD_PAGE_PATH,
        name: "Dashboard",
        Icon: IconDashboard,
      },
    ],
  },
  {
    label: "App",
    items: [
      {
        href: USERS_PAGE_PATH,
        name: "Users",
        Icon: IconUsersGroup,
      },
      {
        href: PLANS_PAGE_PATH,
        name: "Plans",
        Icon: IconCube,
      },
      {
        href: VPS_SERVERS_PAGE_PATH,
        name: "VPS Servers",
        Icon: IconServer,
      },
      {
        href: VPS_GROUPS_PAGE_PATH,
        name: "VPS Groups",
        Icon: IconVersions,
      },
      {
        href: VPN_SERVERS_PAGE_PATH,
        name: "VPN Servers",
        Icon: IconWorldStar,
      },
      {
        href: VPN_ACCOUNTS_PAGE_PATH,
        name: "VPN Accounts",
        Icon: IconUserStar,
      },
      {
        href: LOAD_BALANCER_PAGE_PATH,
        name: "Load Balancer",
        Icon: IconLoadBalancer,
      },
    ],
  },
];

const AppSidebar: FC<ComponentProps<typeof Sidebar>> = ({ ...props }) => {
  const pathname = usePathname();
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <AppLogo />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map(({ label, items }, index) => (
          <SidebarGroup key={index}>
            {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
            <SidebarGroupContent className="flex flex-col gap-2">
              <SidebarMenu>
                {items.map(({ href, name, Icon }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      tooltip={name}
                      className={cn(
                        pathname === href ||
                          (pathname.startsWith(href) && href !== "/")
                          ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground pointer-events-none min-w-8 duration-200 ease-linear"
                          : "cursor-pointer"
                      )}
                      asChild
                    >
                      <Link href={href}>
                        <Icon />
                        <span>{name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
