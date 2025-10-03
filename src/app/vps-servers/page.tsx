"use client";

import React, { FC, useMemo, useState } from "react";
import {
  IconCircleCheckFilled,
  IconPlus,
  IconServer,
  IconServer2,
  IconServerOff,
  IconTrashFilled,
  IconUsersGroup,
  IconX,
} from "@tabler/icons-react";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { z } from "zod";

import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Prisma, VPSServer } from "@/app/generated/prisma";
import { Ban, Eye, Loader, Pencil } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorAlert } from "@/components/elements/custom-alerts";
import { VPS_SERVERS_ROUTE } from "@/lib/admin-routes";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import DateRangePicker from "@/components/elements/DateRangePicker";
import { useDebounce } from "@/hooks/use-debounce";
import DataTable from "@/components/DataTable";
import { fetcher } from "@/lib/fetcher";
import Section from "@/components/Section";
import {
  createVPSServerSchema,
  updateVPSServerSchema,
} from "@/schemas/vps-server-schemas";
import { VPS_SERVERS_PAGE_PATH } from "@/lib/pathnames";
import {
  createVPSServer,
  deleteVPSServer,
  updateVPSServer,
} from "@/lib/vps-server-actions";

type VPSServersResponse = {
  success: boolean;
  message: string;
  vpsServers: VPSServer[];
  pagination: Pagination;
  meta: {
    totalVPSServers: number;
    activeVPSServers: number;
    inactiveVPSServers: number;
    totalConnectedUsers: number;
  };
};

const SaveVPSServer: FC<{
  vpsServer?: VPSServer;
  onSuccess?: (vpsServer: VPSServer) => void;
}> = ({ vpsServer, onSuccess }) => {
  const isMobile = useIsMobile();

  type FormValues = typeof vpsServer extends undefined
    ? z.infer<typeof createVPSServerSchema>
    : z.infer<typeof updateVPSServerSchema>;

  const [open, onOpenChange] = useState<boolean>(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(
      vpsServer ? updateVPSServerSchema : createVPSServerSchema
    ),
    defaultValues: {
      name: vpsServer ? vpsServer.name : "",
      username: vpsServer ? vpsServer.username : "",
      ipAddress: vpsServer ? vpsServer.ipAddress : "",
      privateKey: vpsServer ? vpsServer.privateKey : "",
      password: vpsServer ? vpsServer.password : "",
      port: vpsServer ? vpsServer.port : 22,
      domain: vpsServer ? vpsServer.domain : "",
      status: vpsServer ? vpsServer.status : true,
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = form;

  const save: SubmitHandler<FormValues> = async (values) => {
    if (!vpsServer) {
      await createVPSServer({
        values: values as z.infer<typeof createVPSServerSchema>,
        onSuccess: (vpsServer) => {
          reset();
          onOpenChange(false);
          if (onSuccess) {
            onSuccess(vpsServer);
          }
        },
        onError: (message) => setError("root", { type: "manual", message }),
      });
    } else {
      const changedValues = Object.entries(values).filter(
        ([key, value]) => value != vpsServer[key as keyof VPSServer]
      );

      if (!changedValues.length) {
        toast.error("No values are changed");
        return;
      }

      await updateVPSServer({
        serverId: vpsServer.id,
        values: Object.fromEntries(changedValues) as z.infer<
          typeof updateVPSServerSchema
        >,
        onSuccess: (vpsServer) => {
          onOpenChange(false);
          if (onSuccess) {
            onSuccess(vpsServer);
          }
        },
        onError: (message) => setError("root", { type: "manual", message }),
      });
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerTrigger asChild>
        {vpsServer ? (
          <Button variant="secondary" className="flex size-8" size="icon">
            <Pencil />
            <span className="sr-only">Edit Record</span>
          </Button>
        ) : (
          <Button variant="outline" size="sm">
            <IconPlus />
            <span className="hidden lg:inline">Add New Server</span>
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent>
        <Form {...form}>
          <form
            onSubmit={handleSubmit(save)}
            className="h-full flex flex-col relative"
          >
            {isSubmitting && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                <Loader className="animate-spin size-10" />
              </div>
            )}

            <DrawerHeader className="gap-1">
              <DrawerTitle>
                {vpsServer
                  ? `Edit VPS Server: ${vpsServer.name || vpsServer.username || vpsServer.ipAddress}`
                  : "Add New VPS Server"}
              </DrawerTitle>
              <DrawerDescription>
                {vpsServer
                  ? "Update the details of your VPS server below."
                  : "Fill out the form below to add a new VPS server to your account."}
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex flex-col gap-6 overflow-y-auto px-4 text-sm flex-grow">
              {[
                {
                  name: "name",
                  label: "Server Name",
                  type: "text",
                  placeholder: "Enter server name",
                  isRequired: false,
                },
                {
                  name: "ipAddress",
                  label: "IP Address",
                  type: "text",
                  placeholder: "Enter ip address",
                  isRequired: true,
                },
                {
                  name: "port",
                  label: "Port",
                  type: "number",
                  placeholder: "22",
                  isRequired: false,
                },
                {
                  name: "username",
                  label: "Username",
                  type: "text",
                  placeholder: "Enter username",
                  isRequired: true,
                },
                {
                  name: "password",
                  label: "Password",
                  type: "password",
                  placeholder: "Enter password",
                  isRequired: false,
                },
                {
                  name: "privateKey",
                  label: "Private Key",
                  type: "password",
                  placeholder: "Paste here private key",
                  isRequired: false,
                },
                {
                  name: "domain",
                  label: "Domain",
                  type: "text",
                  placeholder: "Enter domain",
                  isRequired: false,
                },
              ].map(({ name, label, type, placeholder, isRequired }) => (
                <FormField
                  key={name}
                  control={control}
                  name={name as keyof z.infer<typeof createVPSServerSchema>}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{`${label} ${isRequired ? "*" : ""}`}</FormLabel>
                      <FormControl>
                        <Input
                          type={type}
                          placeholder={placeholder}
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              typeof field.value === "number"
                                ? Number(e.target.value)
                                : e.target.value
                            )
                          }
                          value={field.value as string | number}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              <FormField
                key="status"
                control={control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select
                        {...field}
                        value={field.value ? "active" : "inactive"}
                        onValueChange={(value) =>
                          field.onChange(value === "active")
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <ErrorAlert message={errors.root?.message} />
            </div>
            <DrawerFooter className="mt-auto">
              <Button type="submit" disabled={isSubmitting}>
                {!vpsServer ? (
                  isSubmitting ? (
                    <>
                      Adding Server... <Loader className="animate-spin" />
                    </>
                  ) : (
                    "Add Server"
                  )
                ) : isSubmitting ? (
                  <>
                    Updating Server... <Loader className="animate-spin" />
                  </>
                ) : (
                  "Update Server"
                )}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  );
};

const DeleteVPSServer: FC<{
  serverId: string;
  onSuccess?: () => void;
}> = ({ serverId, onSuccess }) => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteVPSServer({
      serverId,
      onSuccess: () => {
        setIsDeleting(false);
        if (onSuccess) onSuccess();
      },
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          disabled={isDeleting}
          variant="destructive"
          className="flex size-8"
          size="icon"
        >
          {isDeleting ? (
            <Loader className="size-5 animate-spin" />
          ) : (
            <IconTrashFilled />
          )}
          <span className="sr-only">Delete Record</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete VPS Server</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this VPS server? This action cannot
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const VPSServersSection: FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce<string>(search, 500);

  const [activeFilters, setActiveFilters] = useState<{
    dateRange?: DateRange;
    status?: "active" | "inactive";
  }>({});

  const activeFiltersEntries = Object.entries(activeFilters) as [
    keyof typeof activeFilters,
    (typeof activeFilters)[keyof typeof activeFilters],
  ][];

  const filters = activeFiltersEntries.map(
    ([key, value]): Prisma.VPSServerWhereInput => {
      if (key === "dateRange") {
        return {
          createdAt:
            activeFilters.dateRange && activeFilters.dateRange.from
              ? {
                  gte: new Date(activeFilters.dateRange.from),
                  lte: activeFilters.dateRange.to
                    ? new Date(activeFilters.dateRange.to)
                    : undefined,
                }
              : undefined,
        };
      } else if (key === "status") {
        if (value === "active") {
          return { status: true };
        } else if (value === "inactive") {
          return { status: false };
        }
      }

      return {};
    }
  );

  const { data, error, isLoading, mutate } = useSWR<VPSServersResponse>(
    `${VPS_SERVERS_ROUTE}?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}${debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ""}${Object.keys(filters).length ? `&filters=${encodeURIComponent(JSON.stringify(filters))}` : ""}`,
    fetcher,
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    }
  );

  const columns = useMemo(
    (): ColumnDef<VPSServer>[] => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <h5 className="font-medium">{row.original.name}</h5>,
      },
      {
        accessorKey: "ipAddress",
        header: "IP Address",
        cell: ({ row }) => row.original.ipAddress,
        enableHiding: false,
      },
      {
        accessorKey: "username",
        header: "Username",
        cell: ({ row }) => row.original.username,
      },
      {
        accessorKey: "domain",
        header: "Domain",
        cell: ({ row }) => row.original.domain,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            {row.original.status ? (
              <>
                <IconCircleCheckFilled className="text-green-500" />
                Active
              </>
            ) : (
              <>
                <Ban className="text-destructive" />
                Inactive
              </>
            )}
          </Badge>
        ),
      },
      {
        accessorKey: "connected",
        header: "Connected",
        cell: ({}) => 0,
      },
      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="flex size-8"
              size="icon"
              asChild
            >
              <Link href={`${VPS_SERVERS_PAGE_PATH}/${row.original.id}`}>
                <Eye />
                <span className="sr-only">View Details</span>
              </Link>
            </Button>

            <SaveVPSServer
              vpsServer={row.original}
              onSuccess={() => mutate()}
            />

            <DeleteVPSServer
              serverId={row.original.id}
              onSuccess={() => mutate()}
            />
          </div>
        ),
      },
    ],

    [mutate]
  );

  return (
    <Section heading="VPS Servers">
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[
          {
            title: "Total VPS Servers",
            value: data?.meta?.totalVPSServers,
            Icon: IconServer2,
          },
          {
            title: "Active Servers",
            value: data?.meta?.activeVPSServers,
            Icon: IconServer,
          },
          {
            title: "Inactive Servers",
            value: data?.meta?.inactiveVPSServers,
            Icon: IconServerOff,
          },
          {
            title: "Total Connected Users",
            value: data?.meta?.totalConnectedUsers,
            Icon: IconUsersGroup,
          },
        ].map(({ title, value, Icon }, index) => (
          <Card key={index} className="@container/card gap-y-2 items-center">
            <Icon className="size-8" />
            <h2 className="text-lg font-medium">{title}</h2>
            <h1 className="text-4xl font-bold">
              {value !== undefined ? value : <Skeleton className="h-10 w-24" />}
            </h1>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-between flex-wrap gap-4">
          <DateRangePicker
            label="Pick date range"
            dateRange={activeFilters.dateRange}
            setDateRange={(dateRange) =>
              setActiveFilters((prev) => ({ ...prev, dateRange }))
            }
            className="min-w-56"
          />

          {[
            {
              key: "status",
              label: "Status",
              items: [
                { name: "All", value: "all" },
                { name: "Active", value: "active" },
                { name: "Inactive", value: "inactive" },
              ],
            },
          ].map(({ key, label, items }) => (
            <div key={key} className="flex flex-col gap-3">
              <Select
                name={key}
                value={
                  activeFilters[
                    key as keyof Omit<typeof activeFilters, "dateRange">
                  ] ?? "all"
                }
                onValueChange={(value) => {
                  if (value === "all") {
                    setActiveFilters((prev) => {
                      const {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        [key as keyof typeof activeFilters]: _,
                        ...rest
                      } = prev;
                      return rest;
                    });
                  } else {
                    setActiveFilters((prev) => ({ ...prev, [key]: value }));
                  }
                }}
              >
                <SelectTrigger label={label} className="min-w-40">
                  <SelectValue placeholder={label} />
                </SelectTrigger>
                <SelectContent>
                  {items.map(({ name, value }) => (
                    <SelectItem key={value} value={value}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </CardContent>
        <CardFooter className="gap-2">
          <CardTitle>Active Filters:</CardTitle>

          {search && (
            <Badge key="search" className="[&>svg]:pointer-events-auto">
              <span className="capitalize">Search: {search}</span>
              <IconX onClick={() => setSearch("")} className="cursor-pointer" />
            </Badge>
          )}

          {activeFiltersEntries.map(([key, value]) => (
            <Badge key={key} className="[&>svg]:pointer-events-auto">
              <span className="capitalize">{`${key}: ${key === "dateRange" ? `${activeFilters.dateRange?.from?.toLocaleDateString()} - ${activeFilters.dateRange?.to?.toLocaleDateString()}` : value} `}</span>
              <IconX
                onClick={() =>
                  setActiveFilters((prev) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { [key]: _, ...rest } = prev;
                    return rest;
                  })
                }
                className="cursor-pointer"
              />
            </Badge>
          ))}
        </CardFooter>
      </Card>

      <DataTable
        data={data?.vpsServers ?? []}
        columns={columns}
        search={search}
        setSearch={setSearch}
        pagination={pagination}
        setPagination={setPagination}
        getRowId={(row) => row.id}
        pageCount={data?.pagination?.totalPages}
        isLoading={isLoading}
        errorMessage={error?.message}
        mutate={mutate}
        addRecordButton={<SaveVPSServer onSuccess={() => mutate()} />}
      />
    </Section>
  );
};

export default VPSServersSection;
