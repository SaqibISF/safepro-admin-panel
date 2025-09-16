"use client";

import React, { FC, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { LogoIcon } from "./AppLogo";
import {
  Form,
  FormMessage,
  FormLabel,
  FormItem,
  FormField,
  FormControl,
} from "./ui/form";
import { SubmitHandler, useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signinSchema } from "@/schemas/signinSchema";
import { Loader } from "lucide-react";
import axios, { AxiosError } from "axios";
import { ADMIN_LOGIN_ROUTE } from "@/lib/routes";
import { useRouter } from "next/navigation";
import { ErrorAlert } from "./elements/custom-alerts";

const LoginForm: FC<HTMLAttributes<HTMLFormElement>> = ({
  className,
  ...props
}) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof signinSchema>>({
    resolver: zodResolver(signinSchema),
    defaultValues: { email: "", password: "" },
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
    reset,
  } = form;

  const login: SubmitHandler<z.infer<typeof signinSchema>> = async (values) => {
    try {
      const res = await axios
        .post<{
          success: boolean;
          message: string;
        }>(ADMIN_LOGIN_ROUTE, values)
        .then((res) => res.data);

      if (res.success) {
        reset();
        router.refresh();
      } else {
        setError("root", { type: "manual", message: res.message });
        setValue("password", "");
      }
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response
            ? error.response.data.message
            : error.message
          : error instanceof Error
            ? error.message
            : "Failed to Login, Please check your internet connectivity";

      setError("root", { type: "manual", message });
      setValue("password", "");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(login)}
        className={cn("flex flex-col gap-6", className)}
        {...props}
      >
        <div className="w-full flex flex-col items-center gap-2">
          <div className="flex flex-col items-center gap-2 font-medium">
            <LogoIcon className="size-32" />
            <span className="sr-only">SafePro VPN</span>
          </div>
          <h1 className="text-2xl font-bold">Welcome to SafePro VPN</h1>
        </div>
        <div className="w-full flex flex-col gap-6">
          {[
            {
              name: "email",
              label: "Email Address",
              type: "email",
              placeholder: "Enter you email address",
            },
            {
              name: "password",
              label: "Password",
              type: "password",
              placeholder: "Enter you password",
            },
          ].map(({ name, label, type, placeholder }) => (
            <FormField
              key={name}
              control={control}
              name={name as keyof z.infer<typeof signinSchema>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{label}</FormLabel>
                  <FormControl>
                    <Input type={type} placeholder={placeholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          <ErrorAlert message={errors.root?.message} />

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                Logging in... <Loader className="size-5 animate-spin" />
              </>
            ) : (
              "Log In"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default LoginForm;
