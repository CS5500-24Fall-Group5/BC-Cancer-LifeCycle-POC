"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

export default function DonorTable({
  data,
  isLoading,
  pagination,
  onCommentChange,
  onPageChange,
  onFilterChange,
}) {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});

  const columns = [
    {
      accessorKey: "firstName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            First Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      filterFn: "nameFilter",
    },
    {
      accessorKey: "lastName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Last Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "city",
      header: "City",
    },
    {
      accessorKey: "totalDonations",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Total Donations
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("totalDonations"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return <div>{formatted}</div>;
      },
    },
    {
      accessorKey: "lastGiftAmount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Last Gift
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("lastGiftAmount"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return <div>{formatted}</div>;
      },
    },
    {
      accessorKey: "lastGiftDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Last Gift Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("lastGiftDate"));
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    {
      accessorKey: "lifecycleStage",
      header: "Lifecycle Status",
      cell: ({ row }) => {
        const stage = row.getValue("lifecycleStage");
        return (
          <div className="flex justify-start">
            <Badge
              variant="outline"
              className={`
              ${
                stage === "ACTIVE" &&
                "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
              }
              ${
                stage === "LAPSED" &&
                "border-red-500 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
              }
              ${
                stage === "AT_RISK" &&
                "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
              }
              ${
                stage === "NEW" &&
                "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
              }
            `}
            >
              {stage}
            </Badge>
            {row.original.excludeFlag === "Yes" && " (Excluded)"}
            {row.original.deceasedFlag === "Yes" && " (Deceased)"}
          </div>
        );
      },
    },
    {
      accessorKey: "comments",
      header: "Comments",
      enableSorting: false,
      cell: function CommentCell({ row }) {
        const [isOpen, setIsOpen] = useState(false);
        const [newComment, setNewComment] = useState("");
        const donorId = row.original.id;
        const comments = row.original.comments || [];
        const latestComment =
          comments.length > 0 ? comments[comments.length - 1].content : "";

        return (
          <div className="relative flex items-center gap-2">
            {latestComment ? (
              <>
                <span
                  className="text-sm truncate max-w-[120px]"
                  title={latestComment}
                >
                  {latestComment}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="text-xs"
              >
                Add comment
              </Button>
            )}

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Donor Comments</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add new comment..."
                      className="min-h-[100px]"
                    />
                  </div>

                  {comments.length > 0 && (
                    <div className="grid gap-2">
                      <h4 className="text-sm font-medium">Previous Comments</h4>
                      <div className="max-h-[200px] overflow-y-auto space-y-2">
                        {comments.map((comment, index) => (
                          <div
                            key={index}
                            className="text-sm p-2 rounded bg-muted/50 space-y-1"
                          >
                            <p>{comment.content}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsOpen(false);
                        setNewComment("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={async () => {
                        if (newComment.trim()) {
                          await onCommentChange(donorId, newComment.trim());
                          setNewComment("");
                          setIsOpen(false);
                        }
                      }}
                      disabled={!newComment.trim()}
                    >
                      Save Comment
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        );
      },
    },

    {
      id: "actions",
      cell: ({ row }) => {
        const donor = row.original; // 当前行的捐赠者信息
        const [isOpen, setIsOpen] = useState(false); // Dialog 控制
        const [lifecycleStage, setLifecycleStage] = useState(
          donor.lifecycleStage
        ); // 本地存储状态
        const [isSaving, setIsSaving] = useState(false); // 保存按钮状态

        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setIsOpen(true);
                  }}
                >
                  View details
                </DropdownMenuItem>
                <DropdownMenuItem>View donation history</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Dialog for viewing and updating lifecycleStage */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Donor Details</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Name: {donor.firstName} {donor.lastName}
                    </p>
                    <p className="text-sm font-medium">City: {donor.city}</p>
                    <p className="text-sm font-medium">
                      Total Donations:{" "}
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(donor.totalDonations)}
                    </p>
                  </div>

                  {/* Lifecycle Stage Selector */}
                  <div className="grid gap-2">
                    <h4 className="text-sm font-medium">Lifecycle Stage</h4>
                    <select
                      value={lifecycleStage}
                      onChange={(e) => setLifecycleStage(e.target.value)}
                      className="border p-2 rounded"
                    >
                      <option value="NEW">NEW</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="AT_RISK">AT_RISK</option>
                      <option value="LAPSED">LAPSED</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      setIsSaving(true);
                      try {
                        const response = await fetch(
                          `http://localhost:3000/api/donors/${donor.id}/lifecycle-stage`,
                          {
                            method: "PUT",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ lifecycleStage }),
                          }
                        );
                        if (!response.ok) {
                          throw new Error("Failed to update lifecycle stage");
                        }
                        setIsOpen(false);
                      } catch (error) {
                        console.error("Error updating lifecycle stage:", error);
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: (filters) => {
      setColumnFilters(filters);
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    filterFns: {
      nameFilter: (row, columnId, filterValue) => {
        const firstName = String(row.getValue("firstName")).toLowerCase();
        const lastName = String(row.getValue("lastName")).toLowerCase();
        const searchValue = String(filterValue).toLowerCase();
        return (
          firstName.includes(searchValue) || lastName.includes(searchValue)
        );
      },
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="h-96 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Donor Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between pb-4">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by Name..."
              value={table.getColumn("firstName")?.getFilterValue() ?? ""}
              onChange={(event) => {
                const value = event.target.value;
                table.getColumn("firstName")?.setFilterValue(value);
              }}
              className="h-8"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
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
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
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
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
