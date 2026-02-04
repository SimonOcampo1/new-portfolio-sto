"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { iconNames, iconMap } from "@/lib/icons"
import { LucideIcon } from "lucide-react"

interface IconPickerProps {
  value?: string
  onChange: (value: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  
  const SelectedIcon = value && iconMap[value] ? (iconMap[value] as LucideIcon) : null

  // Filter icons based on search to improve performance and avoid huge lists
  const filteredIcons = React.useMemo(() => {
    if (!search) return iconNames.slice(0, 50); // Show first 50 by default
    return iconNames
      .filter((name) => name.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 50); // Limit search results to 50
  }, [search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? (
             <div className="flex items-center gap-2">
                {SelectedIcon && <SelectedIcon className="h-4 w-4" />}
                <span>{value}</span>
             </div>
          ) : (
            "Select an icon..."
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" side="bottom" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search icon..." value={search} onValueChange={setSearch} />
          <CommandList className="max-h-[200px] overflow-y-auto scrollbar-thin">
            {filteredIcons.length === 0 && <CommandEmpty>No icon found.</CommandEmpty>}
            <CommandGroup>
              {filteredIcons.map((name) => {
                 const Icon = iconMap[name] as LucideIcon;
                 return (
                    <CommandItem
                        key={name}
                        value={name}
                        onSelect={(currentValue) => {
                        onChange(currentValue === value ? "" : currentValue)
                        setOpen(false)
                        setSearch("") // Reset search on select
                        }}
                    >
                        <Check
                        className={cn(
                            "mr-2 h-4 w-4",
                            value === name ? "opacity-100" : "opacity-0"
                        )}
                        />
                        <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span>{name}</span>
                        </div>
                    </CommandItem>
                 )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
