import React, { FC } from "react";
import {
  IconCreditCard,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react";

import {
  Avatar as ShadCNAvatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, getNameFallback } from "@/lib/utils";
import { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";

export const AvatarDropdownContent: FC<
  {
    user: {
      name: string;
      email: string;
      avatar: string;
    };
  } & DropdownMenuContentProps
> = ({ user, className, ...props }) => (
  <DropdownMenuContent
    className={cn(
      "w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg",
      className
    )}
    {...props}
  >
    <DropdownMenuLabel className="p-0 font-normal">
      <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
        <ShadCNAvatar className="h-8 w-8 rounded-lg">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="rounded-lg">
            {getNameFallback(user.name)}
          </AvatarFallback>
        </ShadCNAvatar>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">{user.name}</span>
          <span className="text-muted-foreground truncate text-xs">
            {user.email}
          </span>
        </div>
      </div>
    </DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuGroup>
      <DropdownMenuItem>
        <IconUserCircle />
        Account
      </DropdownMenuItem>
      <DropdownMenuItem>
        <IconCreditCard />
        Billing
      </DropdownMenuItem>
      <DropdownMenuItem>
        <IconNotification />
        Notifications
      </DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      <IconLogout />
      Log out
    </DropdownMenuItem>
  </DropdownMenuContent>
);

const Avatar: FC<{
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}> = ({ user }) => (
  <DropdownMenu>
    <DropdownMenuTrigger>
      <ShadCNAvatar className="h-8 w-8 rounded-lg grayscale">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback className="rounded-lg">
          {getNameFallback(user.name)}
        </AvatarFallback>
      </ShadCNAvatar>
    </DropdownMenuTrigger>
    <AvatarDropdownContent user={user} />
  </DropdownMenu>
);

export default Avatar;
