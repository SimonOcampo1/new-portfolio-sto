"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";

interface AddPublicationDialogProps {
    existingPublication?: any;
    trigger?: React.ReactNode;
}

export function AddPublicationDialog({ existingPublication, trigger }: AddPublicationDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (open && existingPublication) {
        // Similar mapping logic as Project
        const flatData = {
            id: existingPublication.id,
            title: existingPublication.title || "",
            citationApa: existingPublication.citationApa || "",
            url: existingPublication.url || "",
            lang: existingPublication.lang || "",
            tagsEn: Array.isArray(existingPublication.tags?.en) ? existingPublication.tags.en.join(",") : "",
            tagsEs: Array.isArray(existingPublication.tags?.es) ? existingPublication.tags.es.join(",") : "",
        };
        setFormData(flatData);
    } else if (open) {
        setFormData({});
    }
  }, [open, existingPublication]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const url = "/api/admin/publications";
      const method = existingPublication ? "PUT" : "POST";

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
        alert("Failed to save publication");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving publication");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
      if (!confirm("Are you sure you want to delete this publication?")) return;
      setLoading(true);
      try {
          const res = await fetch("/api/admin/publications", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: existingPublication.id }),
          });
          if (res.ok) {
              setOpen(false);
              window.location.reload();
          } else {
              alert("Failed to delete publication");
          }
      } catch (e) {
          console.error(e);
          alert("Error deleting publication");
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{existingPublication ? "Edit Publication" : "Add New Publication"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input name="title" value={formData.title || ""} placeholder="Title" onChange={handleInputChange} className="col-span-1 sm:col-span-2" />
          <Input name="citationApa" value={formData.citationApa || ""} placeholder="Citation (APA)" onChange={handleInputChange} className="col-span-1 sm:col-span-2" />
          <Input name="url" value={formData.url || ""} placeholder="URL" onChange={handleInputChange} />
          <Input name="lang" value={formData.lang || ""} placeholder="Language (en/es)" onChange={handleInputChange} />
          <Input name="tagsEn" value={formData.tagsEn || ""} placeholder="Tags EN (comma sep)" onChange={handleInputChange} />
          <Input name="tagsEs" value={formData.tagsEs || ""} placeholder="Tags ES (comma sep)" onChange={handleInputChange} />
        </div>
        <DialogFooter>
            {existingPublication && (
                <Button onClick={handleDelete} disabled={loading} variant="destructive" className="mr-auto">
                    <Trash2 size={18} className="mr-2" />
                    Delete
                </Button>
            )}
            <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Publication"}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
