"use client";

import { useEffect, useState, type DragEvent } from "react";
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
import { supabaseClient } from "@/lib/supabase-client";
import { Dropzone } from "@/components/ui/dropzone";

interface ProjectFormProps {
  initialProject?: any;
  onCancel: () => void;
  onSaved?: () => void;
  language: "en" | "es";
}

export function ProjectForm({ initialProject, onCancel, onSaved, language }: ProjectFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isEditing = Boolean(initialProject?.id);

  useEffect(() => {
    if (initialProject) {
      const mediaImages = Array.isArray(initialProject.mediaImages) ? initialProject.mediaImages : [];
      const mediaVideos = Array.isArray(initialProject.mediaVideos) ? initialProject.mediaVideos : [];
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
        mediaImages,
        mediaVideos,
      };
      setFormData(flatData);
    } else {
      setFormData({ mediaImages: [], mediaVideos: [] });
    }
  }, [initialProject]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleMediaTextChange = (name: "mediaImages" | "mediaVideos", value: string) => {
    const parsed = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    setFormData((prev: any) => ({ ...prev, [name]: parsed }));
  };

  const handleRemoveMedia = (name: "mediaImages" | "mediaVideos", index: number) => {
    setFormData((prev: any) => {
      const next = Array.isArray(prev[name]) ? [...prev[name]] : [];
      next.splice(index, 1);
      return { ...prev, [name]: next };
    });
  };

  const uploadMediaFiles = async (files: FileList, mediaType: "images" | "videos") => {
    if (!files.length) return;
    setUploading(true);
    try {
      const data = new FormData();
      Array.from(files).forEach((file) => data.append("files", file));
      data.append("mediaType", mediaType);

      const { data: sessionData } = await supabaseClient.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: data,
      });

      if (!res.ok) {
        toast.error(language === "es" ? "Error al subir archivos" : "Failed to upload media");
        return;
      }

      const payload = await res.json();
      const urls = Array.isArray(payload?.urls) ? payload.urls : [];
      const targetField = mediaType === "images" ? "mediaImages" : "mediaVideos";
      setFormData((prev: any) => ({
        ...prev,
        [targetField]: [...(prev[targetField] || []), ...urls],
      }));
    } catch (error) {
      console.error(error);
      toast.error(language === "es" ? "Error al subir archivos" : "Error uploading media");
    } finally {
      setUploading(false);
    }
  };


  const validate = () => {
    const nextErrors: Record<string, string> = {};
    const requiredLabel = language === "es" ? "Requerido" : "Required";
    if (!formData.titleEn?.trim()) nextErrors.titleEn = requiredLabel;
    if (!formData.titleEs?.trim()) nextErrors.titleEs = requiredLabel;
    if (!formData.shortDescEn?.trim()) nextErrors.shortDescEn = requiredLabel;
    if (!formData.shortDescEs?.trim()) nextErrors.shortDescEs = requiredLabel;
    if (!formData.fullDescEn?.trim()) nextErrors.fullDescEn = requiredLabel;
    if (!formData.fullDescEs?.trim()) nextErrors.fullDescEs = requiredLabel;
    if (!formData.year?.trim()) nextErrors.year = requiredLabel;
    if (!formData.technologies?.trim()) nextErrors.technologies = requiredLabel;
    if (!formData.tagsEn?.trim()) nextErrors.tagsEn = requiredLabel;
    if (!formData.tagsEs?.trim()) nextErrors.tagsEs = requiredLabel;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const url = "/api/admin/projects";
      const method = isEditing ? "PUT" : "POST";

      const payload = {
        ...formData,
        mediaImages: Array.isArray(formData.mediaImages) ? formData.mediaImages : [],
        mediaVideos: Array.isArray(formData.mediaVideos) ? formData.mediaVideos : [],
      };

      const { data: sessionData } = await supabaseClient.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(language === "es" ? "Proyecto guardado" : "Project saved");
        onSaved?.();
        setTimeout(() => window.location.reload(), 400);
      } else {
        const message = await res.text();
        toast.error(message || (language === "es" ? "Error al guardar proyecto" : "Failed to save project"));
      }
    } catch (e) {
      console.error(e);
      toast.error(language === "es" ? "Error al guardar proyecto" : "Error saving project")
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabaseClient.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch("/api/admin/projects", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id: initialProject.id }),
      });

      if (res.ok) {
        toast.success(language === "es" ? "Proyecto eliminado" : "Project deleted");
        onSaved?.();
        setTimeout(() => window.location.reload(), 400);
      } else {
        const message = await res.text();
        toast.error(message || (language === "es" ? "Error al eliminar proyecto" : "Failed to delete project"));
      }
    } catch (e) {
      console.error(e);
      toast.error(language === "es" ? "Error al eliminar proyecto" : "Error deleting project")
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form-card">
      <div className="admin-form-header">
        <h3 className="admin-form-title">{isEditing ? (language === "es" ? "Editar Proyecto" : "Edit Project") : (language === "es" ? "Agregar Proyecto" : "Add New Project")}</h3>
      </div>
      <div className="admin-form-grid">
        <div>
          <Input name="titleEn" value={formData.titleEn || ""} placeholder={language === "es" ? "Titulo (EN)" : "Title (EN)"} onChange={handleInputChange} />
          {errors.titleEn && <span className="admin-form-error">{errors.titleEn}</span>}
        </div>
        <div>
          <Input name="titleEs" value={formData.titleEs || ""} placeholder={language === "es" ? "Titulo (ES)" : "Title (ES)"} onChange={handleInputChange} />
          {errors.titleEs && <span className="admin-form-error">{errors.titleEs}</span>}
        </div>
        <div>
          <Textarea name="shortDescEn" value={formData.shortDescEn || ""} placeholder={language === "es" ? "Descripcion corta (EN)" : "Short Desc (EN)"} onChange={handleInputChange} className="min-h-[80px]" />
          {errors.shortDescEn && <span className="admin-form-error">{errors.shortDescEn}</span>}
        </div>
        <div>
          <Textarea name="shortDescEs" value={formData.shortDescEs || ""} placeholder={language === "es" ? "Descripcion corta (ES)" : "Short Desc (ES)"} onChange={handleInputChange} className="min-h-[80px]" />
          {errors.shortDescEs && <span className="admin-form-error">{errors.shortDescEs}</span>}
        </div>
        <div className="admin-form-span">
          <Textarea name="fullDescEn" value={formData.fullDescEn || ""} placeholder={language === "es" ? "Descripcion completa (EN)" : "Full Desc (EN)"} onChange={handleInputChange} className="min-h-[100px]" />
          {errors.fullDescEn && <span className="admin-form-error">{errors.fullDescEn}</span>}
        </div>
        <div className="admin-form-span">
          <Textarea name="fullDescEs" value={formData.fullDescEs || ""} placeholder={language === "es" ? "Descripcion completa (ES)" : "Full Desc (ES)"} onChange={handleInputChange} className="min-h-[100px]" />
          {errors.fullDescEs && <span className="admin-form-error">{errors.fullDescEs}</span>}
        </div>
        <div>
          <Input name="year" value={formData.year || ""} placeholder={language === "es" ? "Ano" : "Year"} onChange={handleInputChange} />
          {errors.year && <span className="admin-form-error">{errors.year}</span>}
        </div>
        <div>
          <Input name="technologies" value={formData.technologies || ""} placeholder={language === "es" ? "Tecnologias (separadas por coma)" : "Technologies (comma sep)"} onChange={handleInputChange} />
          {errors.technologies && <span className="admin-form-error">{errors.technologies}</span>}
        </div>
        <div>
          <Input name="liveUrl" value={formData.liveUrl || ""} placeholder={language === "es" ? "URL en vivo" : "Live URL"} onChange={handleInputChange} />
        </div>
        <div>
          <Input name="codeUrl" value={formData.codeUrl || ""} placeholder={language === "es" ? "URL del repositorio" : "Code URL"} onChange={handleInputChange} />
        </div>
        <div>
          <Input name="tagsEn" value={formData.tagsEn || ""} placeholder={language === "es" ? "Etiquetas EN (separadas por coma)" : "Tags EN (comma sep)"} onChange={handleInputChange} />
          {errors.tagsEn && <span className="admin-form-error">{errors.tagsEn}</span>}
        </div>
        <div>
          <Input name="tagsEs" value={formData.tagsEs || ""} placeholder={language === "es" ? "Etiquetas ES (separadas por coma)" : "Tags ES (comma sep)"} onChange={handleInputChange} />
          {errors.tagsEs && <span className="admin-form-error">{errors.tagsEs}</span>}
        </div>
        <div className="admin-form-span">
          <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {language === "es" ? "URLs de imagenes (separadas por coma)" : "Image URLs (comma sep)"}
          </label>
          <Textarea
            value={(formData.mediaImages || []).join(",")}
            placeholder={language === "es" ? "https://.../imagen1.png, https://.../imagen2.jpg" : "https://.../image1.png, https://.../image2.jpg"}
            onChange={(event) => handleMediaTextChange("mediaImages", event.target.value)}
            className="min-h-[80px]"
          />
        </div>
        <div className="admin-form-span">
          <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {language === "es" ? "URLs de videos (separadas por coma)" : "Video URLs (comma sep)"}
          </label>
          <Textarea
            value={(formData.mediaVideos || []).join(",")}
            placeholder={language === "es" ? "https://.../demo.mp4" : "https://.../demo.mp4"}
            onChange={(event) => handleMediaTextChange("mediaVideos", event.target.value)}
            className="min-h-[80px]"
          />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {language === "es" ? "Agregar imagenes" : "Add images"}
          </p>
          <Dropzone
            label={language === "es" ? "Soltar imagenes o hacer click" : "Drop images or click"}
            accept="image/*"
            multiple
            disabled={uploading}
            onFiles={(files) => uploadMediaFiles(files, "images")}
          />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {language === "es" ? "Agregar videos" : "Add videos"}
          </p>
          <Dropzone
            label={language === "es" ? "Soltar videos o hacer click" : "Drop videos or click"}
            accept="video/*"
            multiple
            disabled={uploading}
            onFiles={(files) => uploadMediaFiles(files, "videos")}
          />
        </div>
        {(formData.mediaImages?.length || formData.mediaVideos?.length) && (
          <div className="admin-form-span admin-media-list">
            {(formData.mediaImages || []).map((url: string, index: number) => (
              <div key={`image-${url}-${index}`} className="admin-media-chip">
                <span className="admin-media-chip__label">{language === "es" ? "Imagen" : "Image"}</span>
                <span className="admin-media-chip__url">{url}</span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => handleRemoveMedia("mediaImages", index)}
                >
                  x
                </Button>
              </div>
            ))}
            {(formData.mediaVideos || []).map((url: string, index: number) => (
              <div key={`video-${url}-${index}`} className="admin-media-chip">
                <span className="admin-media-chip__label">{language === "es" ? "Video" : "Video"}</span>
                <span className="admin-media-chip__url">{url}</span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => handleRemoveMedia("mediaVideos", index)}
                >
                  x
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="admin-form-actions">
        {isEditing && (
          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <Button onClick={() => setConfirmOpen(true)} disabled={loading} variant="destructive">
              <Trash2 size={18} className="mr-2" />
              {language === "es" ? "Eliminar" : "Delete"}
            </Button>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {language === "es" ? "Eliminar proyecto?" : "Delete project?"}
                </AlertDialogTitle>
                <AlertDialogDescription className="admin-dialog-description">
                  {language === "es"
                    ? "Esta accion no se puede deshacer. El proyecto se eliminara permanentemente."
                    : "This action cannot be undone. The project will be permanently removed."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel asChild>
                  <Button variant="outline">{language === "es" ? "Cancelar" : "Cancel"}</Button>
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button variant="destructive" onClick={handleDelete}>
                    {language === "es" ? "Eliminar" : "Delete"}
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <div className="admin-form-actions__right">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {language === "es" ? "Cancelar" : "Cancel"}
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (language === "es" ? "Guardando..." : "Saving...") : (language === "es" ? "Guardar Proyecto" : "Save Project")}
          </Button>
        </div>
      </div>
    </div>
  );
}
