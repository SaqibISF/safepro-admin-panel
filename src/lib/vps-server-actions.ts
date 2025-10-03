import { VPSServer } from "@/app/generated/prisma";
import { VPS_SERVER_ROUTE, VPS_SERVERS_ROUTE } from "@/lib/admin-routes";
import {
  createVPSServerSchema,
  updateVPSServerSchema,
} from "@/schemas/vps-server-schemas";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import z from "zod";

const createVPSServer = async ({
  values,
  onSuccess,
  onError,
}: {
  values: z.infer<typeof createVPSServerSchema>;
  onSuccess?: (vpsServer: VPSServer, message: string) => void;
  onError?: (message: string) => void;
}) => {
  try {
    const res = await axios
      .post<{
        success: boolean;
        message: string;
        vpsServer: VPSServer;
      }>(VPS_SERVERS_ROUTE, values)
      .then((res) => res.data);

    if (res.success) {
      toast.success(res.message);
      if (onSuccess) {
        onSuccess(res.vpsServer, res.message);
      }
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
          : "Failed to add vps server";

    toast.error(message);
    if (onError) onError(message);
  }
};

const updateVPSServer = async ({
  serverId,
  values,
  onSuccess,
  onError,
}: {
  serverId: string;
  values: z.infer<typeof updateVPSServerSchema>;
  onSuccess?: (vpsServer: VPSServer, message: string) => void;
  onError?: (message: string) => void;
}) => {
  try {
    const res = await axios
      .patch<{
        success: boolean;
        message: string;
        vpsServer: VPSServer;
      }>(VPS_SERVER_ROUTE(serverId), values)
      .then((res) => res.data);

    if (res.success) {
      toast.success(res.message);
      if (onSuccess) onSuccess(res.vpsServer, res.message);
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
          : "Failed to update vps server";

    toast.error(message);
    if (onError) onError(message);
  }
};

const deleteVPSServer = async ({
  serverId,
  onSuccess,
  onError,
}: {
  serverId: string;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}) => {
  try {
    const res = await axios
      .delete<{
        success: boolean;
        message: string;
      }>(VPS_SERVER_ROUTE(serverId))
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
          : "Failed to delete vps server";

    toast.error(message);
    if (onError) onError(message);
  }
};

export { createVPSServer, updateVPSServer, deleteVPSServer };
