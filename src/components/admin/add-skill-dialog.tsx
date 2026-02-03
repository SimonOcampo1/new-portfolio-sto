"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconPicker } from "./icon-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export function AddSkillDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleIconChange = (value: string) => {
    setFormData((prev: any) => ({ ...prev, icon: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("Skill added successfully!");
        setFormData({});
        setOpen(false);
        window.location.reload();
      } else {
        alert("Failed to add skill");
      }
    } catch (e) {
      console.error(e);
      alert("Error adding skill");
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Skill</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-4">
          <Input name="name" placeholder="Skill Name" onChange={handleInputChange} />
          <Input name="category" placeholder="Category (technical, academic, languages)" onChange={handleInputChange} />
          <IconPicker value={formData.icon} onChange={handleIconChange} />
        </div>
        <Button onClick={handleSubmit} disabled={loading} className="w-full">
          {loading ? "Saving..." : "Save Skill"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
