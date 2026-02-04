"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";

interface AddProjectDialogProps {
    existingProject?: any;
    trigger?: React.ReactNode;
}

export function AddProjectDialog({ existingProject, trigger }: AddProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (open && existingProject) {
        // Transform the object structure to flat structure if needed, or ensuring proper keys
        // The existingProject structure from page.tsx might be nested (title: {en: ...}) or flat depending on how it's passed.
        // Let's assume for editing we pass the RAW data or we need to map it back.
        // Actually, in page.tsx we mapped it to { title: {en, es}, ... }.
        // But for editing it is easier if we pass the original flat Prisma object if available, OR we map it back here.
        // Since we don't have the original flat object easily available in the merged list, let's try to map the UI object back to flat form if possible,
        // OR ideally, we should fetch the raw data for editing.
        // For simplicity, let's try to map back what we have from the UI props.
        
        const flatData = {
            id: existingProject.id,
            titleEn: existingProject.title?.en || "",
            titleEs: existingProject.title?.es || "",
            shortDescEn: existingProject.shortDescription?.en || "",
            shortDescEs: existingProject.shortDescription?.es || "",
            fullDescEn: existingProject.fullDescription?.en || "",
            fullDescEs: existingProject.fullDescription?.es || "",
            year: existingProject.year || "",
            technologies: Array.isArray(existingProject.technologies) ? existingProject.technologies.join(",") : existingProject.technologies || "",
            liveUrl: existingProject.liveUrl || "",
            codeUrl: existingProject.codeUrl || "",
            tagsEn: Array.isArray(existingProject.tags?.en) ? existingProject.tags.en.join(",") : "",
            tagsEs: Array.isArray(existingProject.tags?.es) ? existingProject.tags.es.join(",") : "",
        };
        setFormData(flatData);
    } else if (open) {
        setFormData({});
    }
  }, [open, existingProject]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const url = "/api/admin/projects";
      const method = existingProject ? "PUT" : "POST";
      
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
        alert("Failed to save project");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving project");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
      if (!confirm("Are you sure you want to delete this project?")) return;
      setLoading(true);
      try {
          const res = await fetch("/api/admin/projects", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: existingProject.id }),
          });
          if (res.ok) {
              setOpen(false);
              window.location.reload();
          } else {
              alert("Failed to delete project");
          }
      } catch (e) {
          console.error(e);
          alert("Error deleting project");
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
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{existingProject ? "Edit Project" : "Add New Project"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input name="titleEn" value={formData.titleEn || ""} placeholder="Title (EN)" onChange={handleInputChange} />
          <Input name="titleEs" value={formData.titleEs || ""} placeholder="Title (ES)" onChange={handleInputChange} />
          <Textarea name="shortDescEn" value={formData.shortDescEn || ""} placeholder="Short Desc (EN)" onChange={handleInputChange} className="min-h-[80px]" />
          <Textarea name="shortDescEs" value={formData.shortDescEs || ""} placeholder="Short Desc (ES)" onChange={handleInputChange} className="min-h-[80px]" />
          <Textarea name="fullDescEn" value={formData.fullDescEn || ""} placeholder="Full Desc (EN)" onChange={handleInputChange} className="col-span-1 sm:col-span-2 min-h-[100px]" />
          <Textarea name="fullDescEs" value={formData.fullDescEs || ""} placeholder="Full Desc (ES)" onChange={handleInputChange} className="col-span-1 sm:col-span-2 min-h-[100px]" />
          <Input name="year" value={formData.year || ""} placeholder="Year" onChange={handleInputChange} />
          <Input name="technologies" value={formData.technologies || ""} placeholder="Technologies (comma sep)" onChange={handleInputChange} />
          <Input name="liveUrl" value={formData.liveUrl || ""} placeholder="Live URL" onChange={handleInputChange} />
          <Input name="codeUrl" value={formData.codeUrl || ""} placeholder="Code URL" onChange={handleInputChange} />
          <Input name="tagsEn" value={formData.tagsEn || ""} placeholder="Tags EN (comma sep)" onChange={handleInputChange} />
          <Input name="tagsEs" value={formData.tagsEs || ""} placeholder="Tags ES (comma sep)" onChange={handleInputChange} />
        </div>
        <DialogFooter>
            {existingProject && (
                <Button onClick={handleDelete} disabled={loading} variant="destructive" className="mr-auto">
                    <Trash2 size={18} className="mr-2" />
                    Delete
                </Button>
            )}
            <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Project"}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
