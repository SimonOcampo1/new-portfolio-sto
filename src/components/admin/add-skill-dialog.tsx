"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconPicker } from "./icon-picker";
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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { SkillItemData } from "@/components/paginated-skill-panel";

interface AddSkillDialogProps {
    existingSkill?: SkillItemData;
    trigger?: React.ReactNode;
}

export function AddSkillDialog({ existingSkill, trigger }: AddSkillDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
      if (open && existingSkill) {
          setFormData(existingSkill);
      } else if (open && !existingSkill) {
          setFormData({});
      }
  }, [open, existingSkill]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleIconChange = (value: string) => {
    setFormData((prev: any) => ({ ...prev, icon: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev: any) => ({ ...prev, category: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const url = "/api/admin/skills";
      const method = existingSkill ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({});
        setOpen(false);
        window.location.reload();
      } else {
        alert("Failed to save skill");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving skill");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
      if (!confirm("Are you sure you want to delete this skill?")) return;
      setLoading(true);
      try {
          const res = await fetch("/api/admin/skills", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: existingSkill?.id }),
          });
          if (res.ok) {
              setOpen(false);
              window.location.reload();
          } else {
              alert("Failed to delete skill");
          }
      } catch (e) {
          console.error(e);
          alert("Error deleting skill");
      } finally {
          setLoading(false);
      }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : (
            <Button size="icon" variant="outline" className="rounded-full w-8 h-8 ml-4">
            <Plus size={16} />
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{existingSkill ? "Edit Skill" : "Add New Skill"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4">
          <Input name="name" value={formData.name || ""} placeholder="Skill Name" onChange={handleInputChange} />
          
          <Select value={formData.category || ""} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="academic">Academic</SelectItem>
              <SelectItem value="languages">Languages</SelectItem>
            </SelectContent>
          </Select>
          
          <IconPicker value={formData.icon} onChange={handleIconChange} />
        </div>
        <DialogFooter>
            {existingSkill && (
                <Button onClick={handleDelete} disabled={loading} variant="destructive" className="mr-auto">
                    <Trash2 size={18} className="mr-2" />
                    Delete
                </Button>
            )}
            <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Skill"}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
