"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";

interface ProjectFormProps {
  initialProject?: any;
  onCancel: () => void;
  onSaved?: () => void;
}

export function ProjectForm({ initialProject, onCancel, onSaved }: ProjectFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isEditing = Boolean(initialProject?.id);

  useEffect(() => {
    if (initialProject) {
      const flatData = {
        id: initialProject.id,
        titleEn: initialProject.title?.en || "",
        titleEs: initialProject.title?.es || "",
        shortDescEn: initialProject.shortDescription?.en || "",
        shortDescEs: initialProject.shortDescription?.es || "",
        fullDescEn: initialProject.fullDescription?.en || "",
        fullDescEs: initialProject.fullDescription?.es || "",
        year: initialProject.year || "",
        technologies: Array.isArray(initialProject.technologies)
          ? initialProject.technologies.join(",")
          : initialProject.technologies || "",
        liveUrl: initialProject.liveUrl || "",
        codeUrl: initialProject.codeUrl || "",
        tagsEn: Array.isArray(initialProject.tags?.en) ? initialProject.tags.en.join(",") : "",
        tagsEs: Array.isArray(initialProject.tags?.es) ? initialProject.tags.es.join(",") : "",
      };
      setFormData(flatData);
    } else {
      setFormData({});
    }
  }, [initialProject]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!formData.titleEn?.trim()) nextErrors.titleEn = "Required";
    if (!formData.titleEs?.trim()) nextErrors.titleEs = "Required";
    if (!formData.shortDescEn?.trim()) nextErrors.shortDescEn = "Required";
    if (!formData.shortDescEs?.trim()) nextErrors.shortDescEs = "Required";
    if (!formData.fullDescEn?.trim()) nextErrors.fullDescEn = "Required";
    if (!formData.fullDescEs?.trim()) nextErrors.fullDescEs = "Required";
    if (!formData.year?.trim()) nextErrors.year = "Required";
    if (!formData.technologies?.trim()) nextErrors.technologies = "Required";
    if (!formData.tagsEn?.trim()) nextErrors.tagsEn = "Required";
    if (!formData.tagsEs?.trim()) nextErrors.tagsEs = "Required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const url = "/api/admin/projects";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSaved?.();
        toast.success("Project saved")
        window.location.reload();
      } else {
        toast.error("Failed to save project")
      }
    } catch (e) {
      console.error(e);
      toast.error("Error saving project")
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: initialProject.id }),
      });

      if (res.ok) {
        onSaved?.();
        toast.success("Project deleted")
        window.location.reload();
      } else {
        toast.error("Failed to delete project")
      }
    } catch (e) {
      console.error(e);
      toast.error("Error deleting project")
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form-card">
      <div className="admin-form-header">
        <h3 className="admin-form-title">{isEditing ? "Edit Project" : "Add New Project"}</h3>
      </div>
      <div className="admin-form-grid">
        <div>
          <Input name="titleEn" value={formData.titleEn || ""} placeholder="Title (EN)" onChange={handleInputChange} />
          {errors.titleEn && <span className="admin-form-error">{errors.titleEn}</span>}
        </div>
        <div>
          <Input name="titleEs" value={formData.titleEs || ""} placeholder="Title (ES)" onChange={handleInputChange} />
          {errors.titleEs && <span className="admin-form-error">{errors.titleEs}</span>}
        </div>
        <div>
          <Textarea name="shortDescEn" value={formData.shortDescEn || ""} placeholder="Short Desc (EN)" onChange={handleInputChange} className="min-h-[80px]" />
          {errors.shortDescEn && <span className="admin-form-error">{errors.shortDescEn}</span>}
        </div>
        <div>
          <Textarea name="shortDescEs" value={formData.shortDescEs || ""} placeholder="Short Desc (ES)" onChange={handleInputChange} className="min-h-[80px]" />
          {errors.shortDescEs && <span className="admin-form-error">{errors.shortDescEs}</span>}
        </div>
        <div className="admin-form-span">
          <Textarea name="fullDescEn" value={formData.fullDescEn || ""} placeholder="Full Desc (EN)" onChange={handleInputChange} className="min-h-[100px]" />
          {errors.fullDescEn && <span className="admin-form-error">{errors.fullDescEn}</span>}
        </div>
        <div className="admin-form-span">
          <Textarea name="fullDescEs" value={formData.fullDescEs || ""} placeholder="Full Desc (ES)" onChange={handleInputChange} className="min-h-[100px]" />
          {errors.fullDescEs && <span className="admin-form-error">{errors.fullDescEs}</span>}
        </div>
        <div>
          <Input name="year" value={formData.year || ""} placeholder="Year" onChange={handleInputChange} />
          {errors.year && <span className="admin-form-error">{errors.year}</span>}
        </div>
        <div>
          <Input name="technologies" value={formData.technologies || ""} placeholder="Technologies (comma sep)" onChange={handleInputChange} />
          {errors.technologies && <span className="admin-form-error">{errors.technologies}</span>}
        </div>
        <div>
          <Input name="liveUrl" value={formData.liveUrl || ""} placeholder="Live URL" onChange={handleInputChange} />
        </div>
        <div>
          <Input name="codeUrl" value={formData.codeUrl || ""} placeholder="Code URL" onChange={handleInputChange} />
        </div>
        <div>
          <Input name="tagsEn" value={formData.tagsEn || ""} placeholder="Tags EN (comma sep)" onChange={handleInputChange} />
          {errors.tagsEn && <span className="admin-form-error">{errors.tagsEn}</span>}
        </div>
        <div>
          <Input name="tagsEs" value={formData.tagsEs || ""} placeholder="Tags ES (comma sep)" onChange={handleInputChange} />
          {errors.tagsEs && <span className="admin-form-error">{errors.tagsEs}</span>}
        </div>
      </div>
      <div className="admin-form-actions">
        {isEditing && (
          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <Button onClick={() => setConfirmOpen(true)} disabled={loading} variant="destructive">
              <Trash2 size={18} className="mr-2" />
              Delete
            </Button>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete project?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. The project will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel asChild>
                  <Button variant="outline">Cancel</Button>
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <div className="admin-form-actions__right">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Project"}
          </Button>
        </div>
      </div>
    </div>
  );
}
