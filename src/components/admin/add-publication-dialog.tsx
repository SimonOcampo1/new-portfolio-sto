"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export function AddPublicationDialog() {
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
      const res = await fetch("/api/admin/publications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("Publication added successfully!");
        setFormData({});
        setOpen(false);
        window.location.reload();
      } else {
        alert("Failed to add publication");
      }
    } catch (e) {
      console.error(e);
      alert("Error adding publication");
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
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add New Publication</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Input name="title" placeholder="Title" onChange={handleInputChange} />
          <Input name="citationApa" placeholder="Citation (APA)" onChange={handleInputChange} />
          <Input name="url" placeholder="URL" onChange={handleInputChange} />
          <Input name="lang" placeholder="Language (en/es)" onChange={handleInputChange} />
          <Input name="tagsEn" placeholder="Tags EN (comma sep)" onChange={handleInputChange} />
          <Input name="tagsEs" placeholder="Tags ES (comma sep)" onChange={handleInputChange} />
        </div>
        <Button onClick={handleSubmit} disabled={loading} className="w-full">
          {loading ? "Saving..." : "Save Publication"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
