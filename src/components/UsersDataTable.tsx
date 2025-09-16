"use client";

import React, { FC, ReactNode, useEffect, useState } from "react";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconLayoutColumns,
  IconPlus,
  IconTrashFilled,
} from "@tabler/icons-react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from "@/app/generated/prisma";
import { Ban, Eye, Loader, Pencil, RefreshCw, Search } from "lucide-react";
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
} from "./ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/schemas/signupSchema";
import { ErrorAlert } from "./elements/custom-alerts";
import axios, { AxiosError } from "axios";
import { USER_SIGNUP_ROUTE } from "@/lib/routes";
import { nameSchema } from "@/schemas/zod-schemas";
import { choosePasswordSchema } from "@/schemas/password-schema";
import useSWR from "swr";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";

const fetcher = (...args: [RequestInfo | URL, RequestInit?]) =>
  fetch(...args).then((res) => res.json());

const columnsDef = (mutate: () => void): ColumnDef<User>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
    accessorKey: "name-email",
    header: "Name / Email",
    cell: ({ row }) => (
      <div className="flex flex-col gap-y-0.5">
        <h5 className="font-medium">{row.original.name}</h5>
        <span className="text-muted-foreground">{row.original.email}</span>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "plan",
    header: "Plan",
    cell: () => "Free",
  },
  {
    accessorKey: "last-login",
    header: "Last Login",
    cell: ({ row }) =>
      row.original.lastLoginAt
        ? new Date(row.original.lastLoginAt).toDateString()
        : "Never",
  },
  {
    accessorKey: "verified",
    header: "Verified",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {row.original.emailVerifiedAt ? "Yes" : "No"}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
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
    cell: ({ row }) => new Date(row.original.createdAt).toDateString(),
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button variant="outline" className="flex size-8" size="icon" asChild>
          <Link href={`/users/${row.original.slug}`}>
            <Eye />
            <span className="sr-only">View Details</span>
          </Link>
        </Button>

        <UpdateUser user={row.original} onSuccess={mutate}>
          <Button variant="secondary" className="flex size-8" size="icon">
            <Pencil />
            <span className="sr-only">Edit Record</span>
          </Button>
        </UpdateUser>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="flex size-8" size="icon">
              <IconTrashFilled />
              <span className="sr-only">Delete Record</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this user? This action cannot be
                undone and will permanently remove the user and all associated
                data from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    ),
  },
];

const CreateNewUser: FC<{
  onSuccess?: (user: User) => void;
  children: ReactNode;
}> = ({ onSuccess, children }) => {
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
        }>(USER_SIGNUP_ROUTE, values)
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
      <DrawerTrigger asChild>{children}</DrawerTrigger>
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
  children: ReactNode;
}> = ({ user, onSuccess, children }) => {
  const isMobile = useIsMobile();

  const schema = z.object({
    name: nameSchema,
    password: choosePasswordSchema,
    role: z.enum(["user", "admin"]),
  });

  const [open, onOpenChange] = useState<boolean>(false);
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

  const updateUser: SubmitHandler<z.infer<typeof schema>> = async (values) => {
    try {
      const res = await axios
        .post<{
          success: boolean;
          message: string;
          user: User;
        }>(USER_SIGNUP_ROUTE, values)
        .then((res) => res.data);

      if (res.success) {
        reset();
        toast.success(res.message);
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
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <Form {...form}>
          <form
            onSubmit={handleSubmit(updateUser)}
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
                  placeholder: "Enter you name",
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

const UsersTable: FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [search, setSearch] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");

  useEffect(() => {
    if (!search.trim()) return;
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(search);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    message: string;
    users: User[];
    pagination: Pagination;
  }>(
    `/api/admin/users?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}${search ? `&search=${debouncedSearchQuery}` : ""}`,
    fetcher,
    {
      keepPreviousData: true,
    }
  );

  const columns = columnsDef(mutate);

  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data: data ? data.users : [],
    columns,
    state: {
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    pageCount: data?.pagination.totalPages,
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="w-full flex flex-col justify-start gap-6">
      <div className="flex flex-col sm:flex-row sm:justify-between px-4 gap-3">
        <div className="max-w-64 w-full relative">
          <Input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9"
          />
          <Search className="size-5 absolute left-2 top-1/2 transform -translate-y-1/2" />
        </div>
        <div className="flex items-center gap-2 self-end">
          <Button
            variant="ghost"
            size="icon"
            disabled={isLoading}
            onClick={() => mutate()}
          >
            <RefreshCw className={isLoading ? "animate-spin" : undefined} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          <CreateNewUser onSuccess={() => mutate()}>
            <Button variant="outline" size="sm">
              <IconPlus />
              <span className="hidden lg:inline">Create New User</span>
            </Button>
          </CreateNewUser>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="**:data-[slot=table-cell]:first:w-8">
            {isLoading &&
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={`skeleton-${idx}`}>
                  {columns.map((col, colIdx) => (
                    <TableCell key={col.id || colIdx}>
                      <Skeleton className="h-5 rounded w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!isLoading && !table.getRowCount() && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="relative"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {error && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {error.message}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-4">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <IconChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <IconChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => {
                table.setPageIndex(table.getPageCount());
                console.log(table.getPageCount() - 1);
                console.log(table);
              }}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <IconChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersTable;
