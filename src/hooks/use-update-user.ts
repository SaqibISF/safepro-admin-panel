import { User } from "@/app/generated/prisma";
import { USER_ROUTE } from "@/lib/admin-routes";
import { updateUserSchema } from "@/schemas/update-user-schema";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

export const useUpdateUser = (userId: string) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateUser = async ({
    values,
    onSuccess,
    onError,
  }: {
    values: z.infer<typeof updateUserSchema>;
    onSuccess?: (user: User, message: string) => void;
    onError?: (message: string) => void;
  }) => {
    try {
      setIsLoading(true);
      const res = await axios
        .patch<{
          success: boolean;
          message: string;
          user: User;
        }>(USER_ROUTE(userId), values)
        .then((res) => res.data);

      if (res.success) {
        toast.success(res.message);
        if (onSuccess) onSuccess(res.user, res.message);
      } else {
        toast.error(res.message);
        if (onError) onError(res.message);
      }
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response
            ? error.response.data.message
            : error.message
          : error instanceof Error
            ? error.message
            : "Failed to create user";

      toast.error(message);
      if (onError) onError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async ({
    onSuccess,
    onError,
  }: {
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
  }) => {
    try {
      setIsLoading(true);
      const res = await axios
        .delete<{
          success: boolean;
          message: string;
        }>(USER_ROUTE(userId))
        .then((res) => res.data);

      if (res.success) {
        toast.success(res.message);
        if (onSuccess) onSuccess(res.message);
      } else {
        toast.error(res.message);
        if (onError) onError(res.message);
      }
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response
            ? error.response.data.message
            : error.message
          : error instanceof Error
            ? error.message
            : "Failed to create user";

      toast.error(message);
      if (onError) onError(message);
    }
  };

  return { isLoading, updateUser, deleteUser } as const;
};
