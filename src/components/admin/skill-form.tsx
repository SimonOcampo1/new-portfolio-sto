"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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

interface SkillFormProps {
  initialSkill?: any;
  onCancel: () => void;
  onSaved?: () => void;
}

export function SkillForm({ initialSkill, onCancel, onSaved }: SkillFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (!formData.name?.trim()) nextErrors.name = "Required";
    if (!formData.category?.trim()) nextErrors.category = "Required";
    if (!formData.icon?.trim()) nextErrors.icon = "Required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const url = "/api/admin/skills";
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
        body: JSON.stringify({ id: initialSkill?.id }),
      });

      if (res.ok) {
        onSaved?.();
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
  };

  return (
    <div className="admin-form-card">
      <div className="admin-form-header">
        <h3 className="admin-form-title">{isEditing ? "Edit Skill" : "Add New Skill"}</h3>
      </div>
      <div className="admin-form-grid admin-form-grid--single">
        <div>
          <Input name="name" value={formData.name || ""} placeholder="Skill Name" onChange={handleInputChange} />
          {errors.name && <span className="admin-form-error">{errors.name}</span>}
        </div>

        <div>
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
          {errors.category && <span className="admin-form-error">{errors.category}</span>}
        </div>

        <div>
          <IconPicker value={formData.icon} onChange={handleIconChange} />
          {errors.icon && <span className="admin-form-error">{errors.icon}</span>}
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
            {loading ? "Saving..." : "Save Skill"}
          </Button>
        </div>
      </div>
    </div>
  );
}
