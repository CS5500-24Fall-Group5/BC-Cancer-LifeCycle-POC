import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CreateTaskForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    type: "OUTREACH",
    description: "",
    priority: "MEDIUM",
    targetGroup: "NEW",
  });

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Title and Description are required");
      return;
    }

    onSubmit({
      ...formData,
      status: "TODO",
    });
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Title</label>
        <Input
          placeholder="Task title"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Type</label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleChange("type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OUTREACH">Outreach</SelectItem>
              <SelectItem value="FOLLOWUP">Follow-up</SelectItem>
              <SelectItem value="REVIEW">Review</SelectItem>
              <SelectItem value="CAMPAIGN">Campaign</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Priority</label>
          <Select
            value={formData.priority}
            onValueChange={(value) => handleChange("priority", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Target Group</label>
        <Select
          value={formData.targetGroup}
          onValueChange={(value) => handleChange("targetGroup", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select target group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NEW">New Donors</SelectItem>
            <SelectItem value="ACTIVE">Active Donors</SelectItem>
            <SelectItem value="AT_RISK">At Risk Donors</SelectItem>
            <SelectItem value="LAPSED">Lapsed Donors</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          placeholder="Task description"
          className="min-h-[100px]"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <Button
          variant="outline"
          onClick={() => {
            setFormData({
              title: "",
              type: "OUTREACH",
              description: "",
              priority: "MEDIUM",
              targetGroup: "NEW",
            });
            onCancel();
          }}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} className="text-white">
          Create Task
        </Button>
      </div>
    </div>
  );
}
