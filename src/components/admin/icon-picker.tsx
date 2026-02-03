"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { iconNames, iconMap } from "@/lib/icons";
import { LucideIcon } from "lucide-react";

interface IconPickerProps {
  value?: string;
  onChange: (value: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  // Render the selected icon if it exists
  const SelectedIcon = value && iconMap[value] ? iconMap[value] : null;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select an icon">
          {value ? (
            <div className="flex items-center gap-2">
              {SelectedIcon && <SelectedIcon className="h-4 w-4" />}
              <span>{value}</span>
            </div>
          ) : (
            "Select an icon"
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent position="popper" className="max-h-[300px]">
        {iconNames.map((name) => {
          const Icon = iconMap[name] as LucideIcon;
          return (
            <SelectItem key={name} value={name}>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{name}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
