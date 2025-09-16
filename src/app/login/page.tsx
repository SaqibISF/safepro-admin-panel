import React, { FC } from "react";
import LoginForm from "@/components/LoginForm";

const LoginPage: FC = () => (
  <div className="w-full flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 mx-auto">
    <LoginForm className="w-full max-w-sm" />
  </div>
);

export default LoginPage;
