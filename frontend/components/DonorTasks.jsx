// components/DonorTasks.jsx
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, MoreHorizontal } from "lucide-react";
import { CreateTaskForm } from "./CreateTaskForm";

const getStatusColor = (status) => {
  const colors = {
    TODO: "text-yellow-500",
    IN_PROGRESS: "text-blue-500",
    DONE: "text-green-500",
    CANCELED: "text-red-500",
    BACKLOG: "text-gray-500",
  };
  return colors[status] || "text-gray-500";
};

const getTypeBadge = (type) => {
  const styles = {
    OUTREACH: "bg-blue-100 text-blue-800",
    FOLLOWUP: "bg-green-100 text-green-800",
    REVIEW: "bg-purple-100 text-purple-800",
    CAMPAIGN: "bg-orange-100 text-orange-800",
  };
  return styles[type] || "bg-gray-100 text-gray-800";
};

export function DonorTasks() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [taskStatus, setTaskStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:3000/api/tasks");
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const { data } = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (values) => {
    try {
      const response = await fetch("http://localhost:3000/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Failed to create task");
      await fetchTasks();
      setCreateDialogOpen(false);
      toast.success("Task created successfully");
    } catch (error) {
      toast.error("Failed to create task");
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/tasks/${taskId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) throw new Error("Failed to update task status");
      await fetchTasks();
      toast.success("Task status updated");
    } catch (error) {
      toast.error("Failed to update task status");
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteTaskId) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/tasks/${deleteTaskId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete task");
      await fetchTasks();
      toast.success("Task deleted successfully");
    } catch (error) {
      toast.error("Failed to delete task");
    } finally {
      setDeleteTaskId(null);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = taskStatus === "ALL" || task.status === taskStatus;
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <Card className="col-span-3 mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tasks</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage donor engagement tasks and campaigns
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Filter tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={taskStatus} onValueChange={setTaskStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="TODO">Todo</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="DONE">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Target Group</TableHead>
                <TableHead>Affected Donors</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getTypeBadge(task.type)}
                    >
                      {task.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{task.targetGroup}</Badge>
                  </TableCell>
                  <TableCell>{task.affectedDonors}</TableCell>
                  <TableCell>
                    <span className="text-sm">{task.description}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{task.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className={getStatusColor(task.status)}>
                      {task.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleUpdateStatus(task.id, "TODO")}
                        >
                          Mark as Todo
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleUpdateStatus(task.id, "IN_PROGRESS")
                          }
                        >
                          Mark as In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateStatus(task.id, "DONE")}
                        >
                          Mark as Done
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => setDeleteTaskId(task.id)}
                        >
                          Delete task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Create a new task for donor management
              </DialogDescription>
            </DialogHeader>
            <CreateTaskForm
              onSubmit={handleCreateTask}
              onCancel={() => setCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={!!deleteTaskId}
          onOpenChange={() => setDeleteTaskId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                task.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteTask}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {isLoading && (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        )}

        {!isLoading && filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold">No tasks found</h3>
            <p className="text-sm text-gray-500 mt-1">
              Get started by creating a new task
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
