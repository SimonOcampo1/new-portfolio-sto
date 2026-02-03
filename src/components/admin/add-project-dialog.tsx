"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export function AddProjectDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("Project added successfully!");
        setFormData({});
        setOpen(false);
        window.location.reload(); // Simple reload to show new data
      } else {
        alert("Failed to add project");
      }
    } catch (e) {
      console.error(e);
      alert("Error adding project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline" className="rounded-full w-8 h-8 ml-4">
          <Plus size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Input name="titleEn" placeholder="Title (EN)" onChange={handleInputChange} />
          <Input name="titleEs" placeholder="Title (ES)" onChange={handleInputChange} />
          <Textarea name="shortDescEn" placeholder="Short Desc (EN)" onChange={handleInputChange} />
          <Textarea name="shortDescEs" placeholder="Short Desc (ES)" onChange={handleInputChange} />
          <Input name="year" placeholder="Year" onChange={handleInputChange} />
          <Input name="technologies" placeholder="Technologies (comma sep)" onChange={handleInputChange} />
          <Input name="liveUrl" placeholder="Live URL" onChange={handleInputChange} />
          <Input name="codeUrl" placeholder="Code URL" onChange={handleInputChange} />
          <Input name="tagsEn" placeholder="Tags EN (comma sep)" onChange={handleInputChange} />
          <Input name="tagsEs" placeholder="Tags ES (comma sep)" onChange={handleInputChange} />
        </div>
        <Button onClick={handleSubmit} disabled={loading} className="w-full">
          {loading ? "Saving..." : "Save Project"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
