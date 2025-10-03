import { User } from "@/app/generated/prisma";
import { USER_ROUTE } from "@/lib/admin-routes";
import { updateUserSchema } from "@/schemas/update-user-schema";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import z from "zod";

const updateUser = async ({
  userId,
  values,
  onSuccess,
  onError,
}: {
  userId: string;
  values: z.infer<typeof updateUserSchema>;
  onSuccess?: (user: User, message: string) => void;
  onError?: (message: string) => void;
}) => {
  try {
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
          : "Failed to update user";

    toast.error(message);
    if (onError) onError(message);
  }
};

const deleteUser = async ({
  userId,
  onSuccess,
  onError,
}: {
  userId: string;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}) => {
  try {
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
          : "Failed to delete user";

    toast.error(message);
    if (onError) onError(message);
  }
};

export { updateUser, deleteUser };
