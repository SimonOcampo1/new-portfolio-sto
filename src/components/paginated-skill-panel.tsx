"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight, Code2, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface SkillItemData {
    id?: string;
    name: string;
    category?: string;
    icon?: string;
}

interface PaginatedSkillPanelProps {
  title: string;
  items: (string | SkillItemData)[];
  iconMap?: Record<string, any>; // Using generic map for simplicity
  defaultIcon?: any;
  itemsPerPage?: number;
  isAdmin?: boolean;
  onEditSkill?: (skill: SkillItemData) => void;
}

const SkillItem = ({ item, icon: Icon, isAdmin, onEdit }: { item: string | SkillItemData, icon: any, isAdmin?: boolean, onEdit?: (skill: SkillItemData) => void }) => {
  const text = typeof item === 'string' ? item : item.name;
  const isDynamic = typeof item !== 'string' && !!item.id;
  
  return (
    <div className="skill-row text-xs py-1 flex items-start w-full group select-none relative">
        <span className="skill-row__icon w-6 h-6 min-w-[24px] shrink-0 flex items-center justify-center mr-2 mt-0.5">
            <Icon size={14} />
        </span>
        
        <div className="flex-1 min-w-0">
             <span className="block whitespace-normal leading-tight">{text}</span>
        </div>
        
        {isAdmin && isDynamic && typeof item !== 'string' && (
            <div className="flex items-center gap-1 ml-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-primary"
                onClick={() => onEdit?.(item as SkillItemData)}
              >
                <Pencil size={12} />
              </Button>
            </div>
        )}
    </div>
  )
}

export function PaginatedSkillPanel({
  title,
  items,
  iconMap = {},
  defaultIcon: DefaultIcon = Code2,
  itemsPerPage = 10,
  isAdmin = false,
  onEditSkill,
}: PaginatedSkillPanelProps) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const currentItems = items.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage
  );

  const nextPage = () => {
    if (page < totalPages - 1) setPage((p) => p + 1);
  };

  const prevPage = () => {
    if (page > 0) setPage((p) => p - 1);
  };

  return (
    <div className="skill-panel flex flex-col h-full min-h-[320px]">
      <div className="skill-panel__header flex items-center justify-between">
        <h3 className="text-base font-semibold">{title}</h3>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
             <Button
                variant="ghost"
                size="icon"
                onClick={prevPage}
                disabled={page === 0}
                className="h-6 w-6"
              >
                <ChevronLeft size={14} />
              </Button>
              <span className="text-[0.65rem] text-muted-foreground tabular-nums">
                {page + 1}/{totalPages}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextPage}
                disabled={page === totalPages - 1}
                className="h-6 w-6"
              >
                <ChevronRight size={14} />
              </Button>
          </div>
        )}
      </div>
      <Separator className="my-3" />
      
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
            <motion.div
                key={page}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 gap-x-4 gap-y-2 content-start"
            >
                {currentItems.map((item, index) => {
                    const text = typeof item === 'string' ? item : item.name;
                    const Icon = iconMap[text] || DefaultIcon;
                    return (
                        <SkillItem key={`${text}-${index}`} item={item} icon={Icon} isAdmin={isAdmin} onEdit={onEditSkill} />
                    );
                })}
            </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
