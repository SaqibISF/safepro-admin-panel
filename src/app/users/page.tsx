"use client";

import React, { FC, useMemo, useState } from "react";
import {
  IconCalendar,
  IconCircleCheckFilled,
  IconPlus,
  IconTrashFilled,
  IconUserCancel,
  IconUserCheck,
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
import { User, Prisma } from "@/app/generated/prisma";
import { Ban, ArchiveRestore, Eye, Loader, Pencil } from "lucide-react";
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
import { signupSchema } from "@/schemas/signupSchema";
import { ErrorAlert } from "@/components/elements/custom-alerts";
import axios, { AxiosError } from "axios";
import { USERS_ROUTE } from "@/lib/admin-routes";
import { nameSchema } from "@/schemas/zod-schemas";
import { choosePasswordSchema } from "@/schemas/password-schema";
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
import { useUpdateUser } from "@/hooks/use-update-user";
import { useDebounce } from "@/hooks/use-debounce";
import DataTable from "@/components/DataTable";
import { fetcher } from "@/lib/fetcher";
import Section from "@/components/Section";

type UserResponse = {
  success: boolean;
  message: string;
  users: User[];
  pagination: Pagination;
  meta: {
    totalUsers: number;
    activeUsers: number;
    bannedUsers: number;
    todayUsers: number;
  };
};

const CreateNewUser: FC<{ onSuccess?: (user: User) => void }> = ({
  onSuccess,
}) => {
  const isMobile = useIsMobile();

  const [open, onOpenChange] = useState<boolean>(false);
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
    reset,
  } = form;

  const createUser: SubmitHandler<z.infer<typeof signupSchema>> = async (
    values
  ) => {
    try {
      const res = await axios
        .post<{
          success: boolean;
          message: string;
          user: User;
        }>(USERS_ROUTE, values)
        .then((res) => res.data);

      if (res.success) {
        reset();
        toast.success(res.message);
        onOpenChange(false);
        if (onSuccess) {
          onSuccess(res.user);
        }
      } else {
        setValue("password", "");
        setError("root", { type: "manual", message: res.message });
        toast.error(res.message);
      }
    } catch (error) {
      setValue("password", "");
      const message =
        error instanceof AxiosError
          ? error.response
            ? error.response.data.message
            : error.message
          : error instanceof Error
            ? error.message
            : "Failed to create user";

      setError("root", { type: "manual", message: message });
      toast.error(message);
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm">
          <IconPlus />
          <span className="hidden lg:inline">Create New User</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <Form {...form}>
          <form
            onSubmit={handleSubmit(createUser)}
            className="h-full flex flex-col relative"
          >
            {isSubmitting && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                <Loader className="animate-spin size-10" />
              </div>
            )}

            <DrawerHeader className="gap-1">
              <DrawerTitle>Create New User</DrawerTitle>
              <DrawerDescription>
                Fill out the form below to create a new user. Please provide all
                required information such as name, email, and role.
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex flex-col gap-6 overflow-y-auto px-4 text-sm flex-grow">
              {[
                {
                  name: "name",
                  label: "Name",
                  type: "text",
                  placeholder: "Enter you name",
                },
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
                  name={name as keyof z.infer<typeof signupSchema>}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <Input
                          type={type}
                          placeholder={placeholder}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              <ErrorAlert message={errors.root?.message} />
            </div>
            <DrawerFooter className="mt-auto">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    Creating... <Loader className="animate-spin" />
                  </>
                ) : (
                  "Create"
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

const UpdateUser: FC<{
  user: User;
  onSuccess?: (user: User) => void;
}> = ({ user, onSuccess }) => {
  const isMobile = useIsMobile();

  const schema = z.object({
    name: nameSchema,
    password: choosePasswordSchema,
    role: z.enum(["user", "admin"]),
  });

  const [open, onOpenChange] = useState<boolean>(false);
  const { updateUser } = useUpdateUser(user.id);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", password: "", role: "user" },
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
    reset,
  } = form;

  const update: SubmitHandler<z.infer<typeof schema>> = async (values) => {
    updateUser({
      values,
      onSuccess: (user, message) => {
        reset();
        toast.success(message);
        if (onSuccess) onSuccess(user);
      },
      onError: (message) => {
        setValue("password", "");
        setError("root", { type: "manual", message });
        toast.error(message);
      },
    });
  };

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerTrigger asChild>
        <Button
          variant="secondary"
          className="flex size-8"
          size="icon"
          disabled={user.deletedAt != null}
        >
          <Pencil />
          <span className="sr-only">Edit Record</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <Form {...form}>
          <form
            onSubmit={handleSubmit(update)}
            className="h-full flex flex-col"
          >
            {isSubmitting && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <Loader className="animate-spin size-16" />
              </div>
            )}

            <DrawerHeader className="gap-1">
              <DrawerTitle>{user.name}</DrawerTitle>
              <DrawerDescription>{user.email}</DrawerDescription>
            </DrawerHeader>
            <div className="flex flex-col gap-6 overflow-y-auto px-4 text-sm flex-grow">
              {[
                {
                  name: "name",
                  label: "Name",
                  type: "text",
                  placeholder: "Enter your name",
                },
                {
                  name: "password",
                  label: "Password",
                  type: "password",
                  placeholder: "Enter your password",
                },
              ].map(({ name, label, type, placeholder }) => (
                <FormField
                  key={name}
                  control={control}
                  name={name as keyof z.infer<typeof schema>}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <Input
                          type={type}
                          placeholder={placeholder}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              <FormField
                control={control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger id="role" className="w-full">
                          <SelectValue placeholder="Select a Role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <ErrorAlert message={errors.root?.message} />
            </div>
            <DrawerFooter className="mt-auto">
              <Button type="submit">
                {isSubmitting ? (
                  <>
                    Updating... <Loader className="animate-spin" />
                  </>
                ) : (
                  "Update"
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

const DeleteUser: FC<{
  userId: string;
  onSuccess?: () => void;
}> = ({ userId, onSuccess }) => {
  const { isLoading: isDeleting, deleteUser } = useUpdateUser(userId);

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
          <AlertDialogTitle>Delete User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this user? This action cannot be
            undone and will permanently remove the user and all associated data
            from the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              deleteUser({
                onSuccess: () => {
                  if (onSuccess) onSuccess();
                },
              })
            }
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const RestoreUser: FC<{
  userId: string;
  onSuccess?: (user: User) => void;
}> = ({ userId, onSuccess }) => {
  const { isLoading: isRestoring, updateUser } = useUpdateUser(userId);
  const restore = () => {
    updateUser({
      values: { restore: true },
      onSuccess: (user) => {
        if (onSuccess) onSuccess(user);
      },
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          disabled={isRestoring}
          className="flex size-8 pointer-events-auto text-white bg-indigo-700 hover:bg-indigo-700/90 active:bg-indigo-700/80"
          size="icon"
        >
          {isRestoring ? (
            <Loader className="size-5 animate-spin" />
          ) : (
            <ArchiveRestore />
          )}
          <span className="sr-only">Restore Record</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Restore User</AlertDialogTitle>
          <AlertDialogDescription>
            Restoring this user will reactivate their account and allow them to
            access the platform again. Are you sure you want to proceed?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={restore}
            className="text-white bg-indigo-700 hover:bg-indigo-700/90 active:bg-indigo-700/80"
          >
            Restore
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const UsersSection: FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce<string>(search, 500);

  const [activeFilters, setActiveFilters] = useState<{
    dateRange?: DateRange;
    role?: "admin" | "user";
    status?: "active" | "banned";
    verified?: "yes" | "no";
    deleted?: "with" | "only";
  }>({});

  const activeFiltersEntries = Object.entries(activeFilters) as [
    keyof typeof activeFilters,
    (typeof activeFilters)[keyof typeof activeFilters],
  ][];

  const filters = activeFiltersEntries.map(
    ([key, value]): Prisma.UserWhereInput => {
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
        if (value === "banned") {
          return { NOT: { bannedAt: null } };
        } else if (value === "active") {
          return { bannedAt: null };
        }
      } else if (key === "verified") {
        if (value === "yes") {
          return { NOT: { emailVerifiedAt: null } };
        } else if (value === "no") {
          return { emailVerifiedAt: null };
        }
      } else if (key === "deleted") {
        if (value === "only") {
          return { NOT: { deletedAt: null } };
        } else if (value === "with") {
          return {};
        }
      }

      return { [key]: value };
    }
  );

  const { data, error, isLoading, mutate } = useSWR<UserResponse>(
    `${USERS_ROUTE}?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}${debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ""}${Object.keys(filters).length ? `&filters=${encodeURIComponent(JSON.stringify(filters))}` : ""}`,
    fetcher,
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    }
  );

  const columns = useMemo(
    (): ColumnDef<User>[] => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) => {
                table.getRowModel().rows.forEach((row) => {
                  if (row.original.deletedAt == null) {
                    row.toggleSelected(!!value);
                  }
                });
              }}
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              disabled={row.original.deletedAt != null}
              aria-label="Select row"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name-email",
        header: "Name / Email",
        cell: ({ row }) => (
          <div
            className="flex flex-col gap-y-0.5 aria-disabled:opacity-50"
            aria-disabled={row.original.deletedAt != null}
          >
            <h5 className="font-medium">{row.original.name}</h5>
            <span className="text-muted-foreground">{row.original.email}</span>
          </div>
        ),
        enableHiding: false,
      },
      {
        accessorKey: "plan",
        header: "Plan",
        cell: ({ row }) => (
          <span
            className="aria-disabled:opacity-50"
            aria-disabled={row.original.deletedAt != null}
          >
            Free
          </span>
        ),
      },
      {
        accessorKey: "last-login",
        header: "Last Login",
        cell: ({ row }) => (
          <span
            className="aria-disabled:opacity-50"
            aria-disabled={row.original.deletedAt != null}
          >
            {row.original.lastLoginAt
              ? new Date(row.original.lastLoginAt).toDateString()
              : "Never"}
          </span>
        ),
      },
      {
        accessorKey: "verified",
        header: "Verified",
        cell: ({ row }) => (
          <div className="w-32">
            <Badge
              variant="outline"
              className="text-muted-foreground px-1.5 aria-disabled:opacity-50"
              aria-disabled={row.original.deletedAt != null}
            >
              {row.original.emailVerifiedAt ? "Yes" : "No"}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className="text-muted-foreground px-1.5 aria-disabled:opacity-50"
            aria-disabled={row.original.deletedAt != null}
          >
            {row.original.bannedAt ? (
              <>
                <Ban className="text-destructive" />
                Banned
              </>
            ) : (
              <>
                <IconCircleCheckFilled className="text-green-500" />
                Active
              </>
            )}
          </Badge>
        ),
      },
      {
        accessorKey: "joined",
        header: "Joined",
        cell: ({ row }) => (
          <span
            className="aria-disabled:opacity-50"
            aria-disabled={row.original.deletedAt != null}
          >
            {new Date(row.original.createdAt).toDateString()}
          </span>
        ),
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
              <Link href={`/users/${row.original.slug}`}>
                <Eye />
                <span className="sr-only">View Details</span>
              </Link>
            </Button>

            <UpdateUser user={row.original} onSuccess={() => mutate()} />

            {row.original.deletedAt ? (
              <RestoreUser
                userId={row.original.id}
                onSuccess={() => mutate()}
              />
            ) : (
              <DeleteUser userId={row.original.id} onSuccess={() => mutate()} />
            )}
          </div>
        ),
      },
    ],

    [mutate]
  );

  return (
    <Section heading="Users">
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[
          {
            title: "Total Users",
            value: data?.meta?.totalUsers,
            Icon: IconUsersGroup,
          },
          {
            title: "Active Users",
            value: data?.meta?.activeUsers,
            Icon: IconUserCheck,
          },
          {
            title: "Banned Users",
            value: data?.meta?.bannedUsers,
            Icon: IconUserCancel,
          },
          {
            title: "Today",
            value: data?.meta?.todayUsers,
            Icon: IconCalendar,
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
                { name: "Admin", value: "admin" },
                { name: "User", value: "user" },
              ],
            },
            {
              key: "status",
              label: "Status",
              items: [
                { name: "All", value: "all" },
                { name: "Active", value: "active" },
                { name: "Banned", value: "banned" },
              ],
            },
            {
              key: "verified",
              label: "Verified",
              items: [
                { name: "All", value: "all" },
                { name: "Yes", value: "yes" },
                { name: "No", value: "no" },
              ],
            },
            {
              key: "deleted",
              label: "Deleted Records",
              items: [
                { name: "Without", value: "all" },
                { name: "With", value: "with" },
                { name: "Only", value: "only" },
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
        data={data?.users ?? []}
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
        addRecordButton={<CreateNewUser onSuccess={() => mutate()} />}
      />
    </Section>
  );
};

export default UsersSection;
