import React, { FC } from "react";

const NotFound: FC = () => (
  <div className="min-h-[calc(100vh-5rem)] m-2 flex flex-col gap-y-4 items-center justify-center">
    <h1 className="text-destructive text-6xl font-black">404</h1>
    <p className="text-muted-foreground text-3xl">Page Not Found</p>
  </div>
);

export default NotFound;
