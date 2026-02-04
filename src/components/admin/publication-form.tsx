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
import { Trash2 } from "lucide-react";
import { supabaseClient } from "@/lib/supabase-client";

interface PublicationFormProps {
  initialPublication?: any;
  onCancel: () => void;
  onSaved?: () => void;
  language: "en" | "es";
}

export function PublicationForm({ initialPublication, onCancel, onSaved, language }: PublicationFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isEditing = Boolean(initialPublication?.id);

  useEffect(() => {
    if (initialPublication) {
      const flatData = {
        id: initialPublication.id,
        title: initialPublication.title || "",
        citationApa: initialPublication.citationApa || initialPublication.citation_apa || "",
        url: initialPublication.url || "",
        lang: initialPublication.lang || "",
        tagsEn: Array.isArray(initialPublication.tags?.en)
          ? initialPublication.tags.en.join(",")
          : initialPublication.tags_en || "",
        tagsEs: Array.isArray(initialPublication.tags?.es)
          ? initialPublication.tags.es.join(",")
          : initialPublication.tags_es || "",
      };
      setFormData(flatData);
    } else {
      setFormData({});
    }
  }, [initialPublication]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    const requiredLabel = language === "es" ? "Requerido" : "Required";
    if (!formData.title?.trim()) nextErrors.title = requiredLabel;
    if (!formData.citationApa?.trim()) nextErrors.citationApa = requiredLabel;
    if (!formData.url?.trim()) nextErrors.url = requiredLabel;
    if (!formData.lang?.trim()) nextErrors.lang = requiredLabel;
    if (!formData.tagsEn?.trim()) nextErrors.tagsEn = requiredLabel;
    if (!formData.tagsEs?.trim()) nextErrors.tagsEs = requiredLabel;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const url = "/api/admin/publications";
      const method = isEditing ? "PUT" : "POST";

      const { data: sessionData } = await supabaseClient.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(language === "es" ? "Publicacion guardada" : "Publication saved");
        onSaved?.();
        setTimeout(() => window.location.reload(), 400);
      } else {
        const message = await res.text();
        toast.error(message || (language === "es" ? "Error al guardar publicacion" : "Failed to save publication"));
      }
    } catch (e) {
      console.error(e);
      toast.error(language === "es" ? "Error al guardar publicacion" : "Error saving publication")
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabaseClient.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch("/api/admin/publications", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id: initialPublication.id }),
      });

      if (res.ok) {
        toast.success(language === "es" ? "Publicacion eliminada" : "Publication deleted");
        onSaved?.();
        setTimeout(() => window.location.reload(), 400);
      } else {
        const message = await res.text();
        toast.error(message || (language === "es" ? "Error al eliminar publicacion" : "Failed to delete publication"));
      }
    } catch (e) {
      console.error(e);
      toast.error(language === "es" ? "Error al eliminar publicacion" : "Error deleting publication")
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form-card">
      <div className="admin-form-header">
        <h3 className="admin-form-title">
          {isEditing ? (language === "es" ? "Editar Publicacion" : "Edit Publication") : (language === "es" ? "Agregar Publicacion" : "Add New Publication")}
        </h3>
      </div>
      <div className="admin-form-grid">
        <div className="admin-form-span">
          <Input name="title" value={formData.title || ""} placeholder={language === "es" ? "Titulo" : "Title"} onChange={handleInputChange} />
          {errors.title && <span className="admin-form-error">{errors.title}</span>}
        </div>
        <div className="admin-form-span">
          <Input name="citationApa" value={formData.citationApa || ""} placeholder={language === "es" ? "Cita (APA)" : "Citation (APA)"} onChange={handleInputChange} />
          {errors.citationApa && <span className="admin-form-error">{errors.citationApa}</span>}
        </div>
        <div>
          <Input name="url" value={formData.url || ""} placeholder="URL" onChange={handleInputChange} />
          {errors.url && <span className="admin-form-error">{errors.url}</span>}
        </div>
        <div>
          <Input name="lang" value={formData.lang || ""} placeholder={language === "es" ? "Idioma (en/es)" : "Language (en/es)"} onChange={handleInputChange} />
          {errors.lang && <span className="admin-form-error">{errors.lang}</span>}
        </div>
        <div>
          <Input name="tagsEn" value={formData.tagsEn || ""} placeholder={language === "es" ? "Etiquetas EN (separadas por coma)" : "Tags EN (comma sep)"} onChange={handleInputChange} />
          {errors.tagsEn && <span className="admin-form-error">{errors.tagsEn}</span>}
        </div>
        <div>
          <Input name="tagsEs" value={formData.tagsEs || ""} placeholder={language === "es" ? "Etiquetas ES (separadas por coma)" : "Tags ES (comma sep)"} onChange={handleInputChange} />
          {errors.tagsEs && <span className="admin-form-error">{errors.tagsEs}</span>}
        </div>
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
                  {language === "es" ? "Eliminar publicacion?" : "Delete publication?"}
                </AlertDialogTitle>
                <AlertDialogDescription className="admin-dialog-description">
                  {language === "es"
                    ? "Esta accion no se puede deshacer. La publicacion se eliminara permanentemente."
                    : "This action cannot be undone. The publication will be permanently removed."}
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
            {loading ? (language === "es" ? "Guardando..." : "Saving...") : (language === "es" ? "Guardar Publicacion" : "Save Publication")}
          </Button>
        </div>
      </div>
    </div>
  );
}
