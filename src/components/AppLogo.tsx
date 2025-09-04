import React, { FC } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

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

export default AppLogo;
