"use client";

import React, { FC, useMemo, useState } from "react";
import {
  IconPlus,
  IconServer,
  IconServer2,
  IconServerOff,
  IconServerSpark,
  IconTrashFilled,
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
import {
  Prisma,
  VPSGroup,
  VPSGroupServer,
  VPSServer,
} from "@/app/generated/prisma";
import { Loader, Pencil } from "lucide-react";
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
import { VPS_GROUPS_ROUTE } from "@/lib/admin-routes";
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
  createVPSGroupSchema,
  updateVPSGroupSchema,
} from "@/schemas/vps-groups-schemas";
import { MultiSelect } from "@/components/elements/multi-select";
import {
  createVPSGroup,
  deleteVPSGroup,
  updateVPSGroup,
} from "@/lib/vps-group-actions";

type VPSGroupsResponse = {
  success: boolean;
  message: string;
  vpsGroups: (VPSGroup & {
    servers: { vpsServer: Pick<VPSServer, "id" | "name" | "ipAddress"> }[];
  })[];
  vpsServers: Pick<VPSServer, "id" | "name" | "ipAddress">[];
  serverRoles: Pick<VPSGroupServer, "role">[];
  pagination: Pagination;
  meta: {
    totalVPSGroups: number;
    withServersGroups: number;
    withoutServersGroups: number;
    latestGroup: VPSGroup;
  };
};

const SaveVPSGroup: FC<{
  vpsGroup?: VPSGroup & {
    servers: { vpsServer: Pick<VPSServer, "id" | "name" | "ipAddress"> }[];
  };
  vpsServers?: Pick<VPSServer, "id" | "name" | "ipAddress">[];
  onSuccess?: (vpsGroup: VPSGroup) => void;
}> = ({ vpsGroup, vpsServers, onSuccess }) => {
  const isMobile = useIsMobile();

  type FormData = typeof vpsGroup extends undefined
    ? z.infer<typeof createVPSGroupSchema>
    : z.infer<typeof updateVPSGroupSchema>;

  const [open, onOpenChange] = useState<boolean>(false);

  const form = useForm<FormData>({
    resolver: zodResolver(
      vpsGroup ? updateVPSGroupSchema : createVPSGroupSchema
    ),
    defaultValues: {
      name: vpsGroup ? vpsGroup.name : "",
      description: vpsGroup ? vpsGroup.description : "",
      servers: vpsGroup
        ? vpsGroup.servers.map(({ vpsServer }) => vpsServer.id)
        : [],
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = form;

  const save: SubmitHandler<FormData> = async (values) => {
    if (!vpsGroup) {
      await createVPSGroup({
        values: values as z.infer<typeof createVPSGroupSchema>,
        onSuccess: (vpsGroup) => {
          reset();
          onOpenChange(false);
          if (onSuccess) onSuccess(vpsGroup);
        },
        onError: (message) => setError("root", { type: "manual", message }),
      });
    } else {
      const changedValues = Object.entries(values).filter(
        ([key, value]) => value != vpsGroup[key as keyof VPSGroup]
      );

      if (!changedValues.length) {
        toast.error("No values are changed");
        return;
      }

      await updateVPSGroup({
        groupId: vpsGroup.id,
        values: Object.fromEntries(changedValues) as z.infer<
          typeof updateVPSGroupSchema
        >,
        onSuccess: (vpsGroup) => {
          onOpenChange(false);
          if (onSuccess) onSuccess(vpsGroup);
        },
        onError: (message) => setError("root", { type: "manual", message }),
      });
    }
  };

  //   const createVPSGroup1: SubmitHandler<
  //     z.infer<typeof createVPSGroupSchema>
  //   > = async (values) => {
  //     try {
  //       const res = await axios
  //         .post<{
  //           success: boolean;
  //           message: string;
  //           vpsGroup: VPSGroup;
  //         }>(VPS_GROUPS_ROUTE, values)
  //         .then((res) => res.data);

  //       if (res.success) {
  //         reset();
  //         toast.success(res.message);
  //         onOpenChange(false);
  //         if (onSuccess) {
  //           onSuccess(res.vpsGroup);
  //         }
  //       } else {
  //         setError("root", { type: "manual", message: res.message });
  //         toast.error(res.message);
  //       }
  //     } catch (error) {
  //       const message =
  //         error instanceof AxiosError
  //           ? error.response
  //             ? error.response.data.message
  //             : error.message
  //           : error instanceof Error
  //             ? error.message
  //             : "Failed to add vps group";

  //       setError("root", { type: "manual", message: message });
  //       toast.error(message);
  //     }
  //   };

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerTrigger asChild>
        {vpsGroup ? (
          <Button variant="secondary" className="flex size-8" size="icon">
            <Pencil />
            <span className="sr-only">Edit Record</span>
          </Button>
        ) : (
          <Button variant="outline" size="sm">
            <IconPlus />
            <span className="hidden lg:inline">Create New Group</span>
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
                {vpsGroup ? "Edit VPS Group" : "Add New VPS Group"}
              </DrawerTitle>
              <DrawerDescription>
                {vpsGroup
                  ? "Update the details of this VPS group."
                  : "Create a new VPS group to organize your servers."}
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex flex-col gap-6 overflow-y-auto px-4 text-sm flex-grow">
              {[
                {
                  name: "name",
                  label: "Name",
                  type: "text",
                  placeholder: "Enter group name",
                  isRequired: true,
                },
                {
                  name: "description",
                  label: "Description",
                  type: "text",
                  placeholder: "Enter Description",
                  isRequired: false,
                },
              ].map(({ name, label, type, placeholder, isRequired }) => (
                <FormField
                  key={name}
                  control={control}
                  name={name as keyof Omit<FormData, "servers">}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{`${label} ${isRequired ? "*" : ""}`}</FormLabel>
                      <FormControl>
                        <Input
                          type={type}
                          placeholder={placeholder}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              <FormField
                control={control}
                name="servers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Servers</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={
                          vpsServers?.map(({ id, name, ipAddress }) => ({
                            value: id,
                            label: name ? name : ipAddress,
                          })) ?? []
                        }
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder="Choose servers..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <ErrorAlert message={errors.root?.message} />
            </div>
            <DrawerFooter className="mt-auto">
              <Button type="submit" disabled={isSubmitting}>
                {vpsGroup ? (
                  isSubmitting ? (
                    <>
                      Updating VPS Group... <Loader className="animate-spin" />
                    </>
                  ) : (
                    "Update VPS Group"
                  )
                ) : isSubmitting ? (
                  <>
                    Creating VPS Group... <Loader className="animate-spin" />
                  </>
                ) : (
                  "Create VPS Group"
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

const DeleteVPSGroup: FC<{
  groupId: string;
  onSuccess?: () => void;
}> = ({ groupId, onSuccess }) => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteVPSGroup({
      groupId,
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
          <AlertDialogTitle>Delete VPS Group</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this VPS group? This action cannot
            be undone and will remove all associated data.
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

const VPSGroupsSection: FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce<string>(search, 500);

  const [activeFilters, setActiveFilters] = useState<{
    dateRange?: DateRange;
    server?: string;
    role?: string;
  }>({});

  const activeFiltersEntries = Object.entries(activeFilters) as [
    keyof typeof activeFilters,
    (typeof activeFilters)[keyof typeof activeFilters],
  ][];

  const filters = activeFiltersEntries.map(
    ([key, value]): Prisma.VPSGroupWhereInput => {
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
      } else if (key === "server") {
        return { servers: { some: { vpsServerId: value as string } } };
      } else if (key === "role") {
        return { servers: { some: { role: value as string } } };
      }

      return {};
    }
  );

  const { data, error, isLoading, mutate } = useSWR<VPSGroupsResponse>(
    `${VPS_GROUPS_ROUTE}?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}${debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ""}${Object.keys(filters).length ? `&filters=${encodeURIComponent(JSON.stringify(filters))}` : ""}`,
    fetcher,
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    }
  );

  const columns = useMemo(
    (): ColumnDef<
      VPSGroup & {
        servers: { vpsServer: Pick<VPSServer, "id" | "name" | "ipAddress"> }[];
      }
    >[] => [
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
        enableHiding: false,
      },
      {
        accessorKey: "servers",
        header: "Servers",
        cell: ({ row }) => (
          <div className="flex flex-wrap items-center gap-2">
            {row.original.servers.length
              ? row.original.servers.map(({ vpsServer }) => (
                  <Badge
                    key={vpsServer.id}
                    variant="outline"
                    className="text-muted-foreground px-1.5"
                  >
                    {vpsServer.name} {vpsServer.ipAddress}
                  </Badge>
                ))
              : "--"}
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "CreatedAt",
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
      },
      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <SaveVPSGroup
              vpsGroup={row.original}
              vpsServers={data?.vpsServers}
              onSuccess={() => mutate()}
            />

            <DeleteVPSGroup
              groupId={row.original.id}
              onSuccess={() => mutate()}
            />
          </div>
        ),
      },
    ],

    [mutate, data?.vpsServers]
  );

  return (
    <Section heading="VPS Groups">
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[
          {
            title: "Total Groups",
            value: data?.meta?.totalVPSGroups,
            Icon: IconServer2,
          },
          {
            title: "With Servers",
            value: data?.meta?.withServersGroups,
            Icon: IconServerSpark,
          },
          {
            title: "Without Servers",
            value: data?.meta?.withoutServersGroups,
            Icon: IconServerOff,
          },
          {
            title: "Latest Group",
            value: data?.meta?.latestGroup?.name,
            Icon: IconServer,
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
              key: "role",
              label: "Role",
              items: [
                { name: "All", value: "all" },
                ...(Array.isArray(data?.serverRoles)
                  ? data.serverRoles.map(({ role }) => ({
                      name: role,
                      value: role!,
                    }))
                  : []),
              ],
            },
            {
              key: "server",
              label: "Server",
              items: [
                { name: "All", value: "all" },
                ...(Array.isArray(data?.vpsServers)
                  ? data.vpsServers.map(({ id, name }) => ({ name, value: id }))
                  : []),
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
        data={data?.vpsGroups ?? []}
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
        addRecordButton={
          <SaveVPSGroup
            onSuccess={() => mutate()}
            vpsServers={data?.vpsServers}
          />
        }
      />
    </Section>
  );
};

export default VPSGroupsSection;
