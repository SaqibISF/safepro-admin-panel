import React, { FC } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

const LogoIcon: FC<Omit<ImageProps, "src" | "alt">> = ({
  className,
  ...props
}) => (
  <Image
    src="/logo.svg"
    alt="SafePro VPN Logo"
    width={0}
    height={0}
    sizes="100vw"
    className={cn("w-6 h-auto", className)}
    {...props}
  />
);

const AppLogo: FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      "text-primary flex justify-start items-center gap-1",
      className
    )}
  >
    <Image
      src="/logo.svg"
      alt="SafePro VPN Logo"
      width={0}
      height={0}
      sizes="100vw"
      className="w-6 h-auto"
    />
    <span className="text-base font-semibold">SafePro VPN</span>
  </div>
);

export { LogoIcon };

export default AppLogo;
