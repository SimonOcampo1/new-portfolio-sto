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
import { IconPicker } from "@/components/admin/icon-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { supabaseClient } from "@/lib/supabase-client";

interface SkillFormProps {
  initialSkill?: any;
  onCancel: () => void;
  onSaved?: () => void;
  language: "en" | "es";
}

export function SkillForm({ initialSkill, onCancel, onSaved, language }: SkillFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isEditing = Boolean(initialSkill?.id);

  useEffect(() => {
    if (initialSkill) {
      setFormData(initialSkill);
    } else {
      setFormData({});
    }
  }, [initialSkill]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleIconChange = (value: string) => {
    setFormData((prev: any) => ({ ...prev, icon: value }));
    setErrors((prev) => ({ ...prev, icon: "" }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev: any) => ({ ...prev, category: value }));
    setErrors((prev) => ({ ...prev, category: "" }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    const requiredLabel = language === "es" ? "Requerido" : "Required";
    if (!formData.name?.trim()) nextErrors.name = requiredLabel;
    if (!formData.category?.trim()) nextErrors.category = requiredLabel;
    if (!formData.icon?.trim()) nextErrors.icon = requiredLabel;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const url = "/api/admin/skills";
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
        toast.success(language === "es" ? "Habilidad guardada" : "Skill saved");
        onSaved?.();
        setTimeout(() => window.location.reload(), 400);
      } else {
        const message = await res.text();
        toast.error(message || (language === "es" ? "Error al guardar habilidad" : "Failed to save skill"));
      }
    } catch (e) {
      console.error(e);
      toast.error(language === "es" ? "Error al guardar habilidad" : "Error saving skill")
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabaseClient.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch("/api/admin/skills", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id: initialSkill?.id }),
      });

      if (res.ok) {
        toast.success(language === "es" ? "Habilidad eliminada" : "Skill deleted");
        onSaved?.();
        setTimeout(() => window.location.reload(), 400);
      } else {
        const message = await res.text();
        toast.error(message || (language === "es" ? "Error al eliminar habilidad" : "Failed to delete skill"));
      }
    } catch (e) {
      console.error(e);
      toast.error(language === "es" ? "Error al eliminar habilidad" : "Error deleting skill")
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form-card">
      <div className="admin-form-header">
        <h3 className="admin-form-title">
          {isEditing ? (language === "es" ? "Editar Habilidad" : "Edit Skill") : (language === "es" ? "Agregar Habilidad" : "Add New Skill")}
        </h3>
      </div>
      <div className="admin-form-grid admin-form-grid--single">
        <div>
          <Input name="name" value={formData.name || ""} placeholder={language === "es" ? "Nombre" : "Skill Name"} onChange={handleInputChange} />
          {errors.name && <span className="admin-form-error">{errors.name}</span>}
        </div>

        <div>
          <Select value={formData.category || ""} onValueChange={handleCategoryChange}>
            <SelectTrigger>
          <SelectValue placeholder={language === "es" ? "Seleccionar categoria" : "Select Category"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technical">{language === "es" ? "Tecnicas" : "Technical"}</SelectItem>
              <SelectItem value="academic">{language === "es" ? "Academicas" : "Academic"}</SelectItem>
              <SelectItem value="languages">{language === "es" ? "Idiomas" : "Languages"}</SelectItem>
            </SelectContent>
          </Select>
          {errors.category && <span className="admin-form-error">{errors.category}</span>}
        </div>

        <div>
          <IconPicker value={formData.icon} onChange={handleIconChange} />
          {errors.icon && <span className="admin-form-error">{errors.icon}</span>}
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
                  {language === "es" ? "Eliminar habilidad?" : "Delete skill?"}
                </AlertDialogTitle>
                <AlertDialogDescription className="admin-dialog-description">
                  {language === "es"
                    ? "Esta accion no se puede deshacer. La habilidad se eliminara permanentemente."
                    : "This action cannot be undone. The skill will be permanently removed."}
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
            {loading ? (language === "es" ? "Guardando..." : "Saving...") : (language === "es" ? "Guardar Habilidad" : "Save Skill")}
          </Button>
        </div>
      </div>
    </div>
  );
}
