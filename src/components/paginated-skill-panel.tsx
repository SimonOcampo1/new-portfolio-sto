"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight, Code2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PaginatedSkillPanelProps {
  title: string;
  items: string[];
  iconMap?: Record<string, any>; // Using generic map for simplicity
  defaultIcon?: any;
  itemsPerPage?: number;
}

const SkillItem = ({ text, icon: Icon }: { text: string, icon: any }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [duration, setDuration] = useState(10);
  
    useEffect(() => {
      const checkOverflow = () => {
        if (containerRef.current && textRef.current) {
            const containerWidth = containerRef.current.offsetWidth;
            const textWidth = textRef.current.offsetWidth;
            
            // If text is significantly larger (buffer of 2px)
            if (textWidth > containerWidth) {
              setIsOverflowing(true);
              // Calculate duration based on width for consistent speed (approx 20px/s)
              setDuration(textWidth / 20);
            } else {
                setIsOverflowing(false);
            }
          }
      };

      checkOverflow();
      window.addEventListener('resize', checkOverflow);
      return () => window.removeEventListener('resize', checkOverflow);
    }, [text]);
  
    return (
      <div className="skill-row text-xs py-1 flex items-center overflow-hidden w-full group select-none">
          <span className="skill-row__icon w-6 h-6 min-w-[24px] shrink-0 flex items-center justify-center mr-2">
              <Icon size={14} />
          </span>
          
          <div className="flex-1 overflow-hidden relative" ref={containerRef}>
            {isOverflowing ? (
                 <div className="w-full overflow-hidden">
                    <motion.div
                        className="whitespace-nowrap flex w-fit"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{ 
                            repeat: Infinity, 
                            ease: "linear", 
                            duration: Math.max(5, duration), // Minimum 5s duration
                        }}
                        // Pause on hover for readability
                        whileHover={{ animationPlayState: "paused" }} 
                    >
                        <span ref={textRef} className="mr-8">{text}</span>
                        <span>{text}</span>
                    </motion.div>
                 </div>
            ) : (
                 <span className="truncate block" ref={textRef}>{text}</span>
            )}
          </div>
      </div>
    )
  }

export function PaginatedSkillPanel({
  title,
  items,
  iconMap = {},
  defaultIcon: DefaultIcon = Code2,
  itemsPerPage = 10,
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
                    const Icon = iconMap[item] || DefaultIcon;
                    return (
                        <SkillItem key={`${item}-${index}`} text={item} icon={Icon} />
                    );
                })}
            </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
