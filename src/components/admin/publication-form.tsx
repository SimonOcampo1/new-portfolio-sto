"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

interface PublicationFormProps {
  initialPublication?: any;
  onCancel: () => void;
  onSaved?: () => void;
}

export function PublicationForm({ initialPublication, onCancel, onSaved }: PublicationFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = Boolean(initialPublication?.id);

  useEffect(() => {
    if (initialPublication) {
      const flatData = {
        id: initialPublication.id,
        title: initialPublication.title || "",
        citationApa: initialPublication.citationApa || "",
        url: initialPublication.url || "",
        lang: initialPublication.lang || "",
        tagsEn: Array.isArray(initialPublication.tags?.en) ? initialPublication.tags.en.join(",") : "",
        tagsEs: Array.isArray(initialPublication.tags?.es) ? initialPublication.tags.es.join(",") : "",
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
    if (!formData.title?.trim()) nextErrors.title = "Required";
    if (!formData.citationApa?.trim()) nextErrors.citationApa = "Required";
    if (!formData.url?.trim()) nextErrors.url = "Required";
    if (!formData.lang?.trim()) nextErrors.lang = "Required";
    if (!formData.tagsEn?.trim()) nextErrors.tagsEn = "Required";
    if (!formData.tagsEs?.trim()) nextErrors.tagsEs = "Required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const url = "/api/admin/publications";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSaved?.();
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
        body: JSON.stringify({ id: initialPublication.id }),
      });

      if (res.ok) {
        onSaved?.();
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
  };

  return (
    <div className="admin-form-card">
      <div className="admin-form-header">
        <h3 className="admin-form-title">{isEditing ? "Edit Publication" : "Add New Publication"}</h3>
      </div>
      <div className="admin-form-grid">
        <div className="admin-form-span">
          <Input name="title" value={formData.title || ""} placeholder="Title" onChange={handleInputChange} />
          {errors.title && <span className="admin-form-error">{errors.title}</span>}
        </div>
        <div className="admin-form-span">
          <Input name="citationApa" value={formData.citationApa || ""} placeholder="Citation (APA)" onChange={handleInputChange} />
          {errors.citationApa && <span className="admin-form-error">{errors.citationApa}</span>}
        </div>
        <div>
          <Input name="url" value={formData.url || ""} placeholder="URL" onChange={handleInputChange} />
          {errors.url && <span className="admin-form-error">{errors.url}</span>}
        </div>
        <div>
          <Input name="lang" value={formData.lang || ""} placeholder="Language (en/es)" onChange={handleInputChange} />
          {errors.lang && <span className="admin-form-error">{errors.lang}</span>}
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
          <Button onClick={handleDelete} disabled={loading} variant="destructive">
            <Trash2 size={18} className="mr-2" />
            Delete
          </Button>
        )}
        <div className="admin-form-actions__right">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Publication"}
          </Button>
        </div>
      </div>
    </div>
  );
}
