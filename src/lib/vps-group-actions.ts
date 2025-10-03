import { VPSGroup } from "@/app/generated/prisma";
import { VPS_GROUP_ROUTE, VPS_GROUPS_ROUTE } from "@/lib/admin-routes";
import {
  createVPSGroupSchema,
  updateVPSGroupSchema,
} from "@/schemas/vps-groups-schemas";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import z from "zod";

const createVPSGroup = async ({
  values,
  onSuccess,
  onError,
}: {
  values: z.infer<typeof createVPSGroupSchema>;
  onSuccess?: (vpsGroup: VPSGroup, message: string) => void;
  onError?: (message: string) => void;
}) => {
  try {
    const res = await axios
      .post<{
        success: boolean;
        message: string;
        vpsGroup: VPSGroup;
      }>(VPS_GROUPS_ROUTE, values)
      .then((res) => res.data);

    if (res.success) {
      toast.success(res.message);
      if (onSuccess) onSuccess(res.vpsGroup, res.message);
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
          : "Failed to add vps group";

    toast.error(message);
    if (onError) onError(message);
  }
};

const updateVPSGroup = async ({
  groupId,
  values,
  onSuccess,
  onError,
}: {
  groupId: string;
  values: z.infer<typeof updateVPSGroupSchema>;
  onSuccess?: (vpsGroup: VPSGroup, message: string) => void;
  onError?: (message: string) => void;
}) => {
  try {
    const res = await axios
      .patch<{
        success: boolean;
        message: string;
        vpsGroup: VPSGroup;
      }>(VPS_GROUP_ROUTE(groupId), values)
      .then((res) => res.data);

    if (res.success) {
      toast.success(res.message);
      if (onSuccess) onSuccess(res.vpsGroup, res.message);
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
          : "Failed to update vps group";

    toast.error(message);
    if (onError) onError(message);
  }
};

const deleteVPSGroup = async ({
  groupId,
  onSuccess,
  onError,
}: {
  groupId: string;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}) => {
  try {
    const res = await axios
      .delete<{
        success: boolean;
        message: string;
      }>(VPS_GROUP_ROUTE(groupId))
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
          : "Failed to delete vps group";

    toast.error(message);
    if (onError) onError(message);
  }
};

export { createVPSGroup, updateVPSGroup, deleteVPSGroup };
