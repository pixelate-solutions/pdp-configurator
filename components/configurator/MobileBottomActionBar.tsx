"use client";

import { FileText, Save, SlidersHorizontal } from "lucide-react";
import type { PanelSlot } from "@/lib/configurator-types";
import { currency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function MobileBottomActionBar({
  selectedSlot,
  total,
  onChooseBreaker,
  onViewBom,
  onSave,
}: {
  selectedSlot: PanelSlot | null;
  total: number;
  onChooseBreaker: () => void;
  onViewBom: () => void;
  onSave: () => void;
}) {
  return (
    <div className="no-print fixed inset-x-0 bottom-0 z-40 overflow-hidden border-t border-white/70 bg-white/74 p-2 shadow-[0_-14px_36px_rgba(24,48,74,0.16)] backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-3 gap-1.5">
        <Button className="min-w-0 px-2" type="button" variant="secondary" onClick={onChooseBreaker}>
          <SlidersHorizontal className="size-4" />
          <span className="min-w-0 truncate">
            {selectedSlot ? selectedSlot.label : "Choose"}
          </span>
        </Button>
        <Button className="min-w-0 px-2" type="button" variant="secondary" onClick={onViewBom}>
          <FileText className="size-4" />
          <span className="min-w-0 truncate">{currency(total)}</span>
        </Button>
        <Button className="min-w-0 px-2" type="button" onClick={onSave}>
          <Save className="size-4" />
          <span className="truncate">Save</span>
        </Button>
      </div>
    </div>
  );
}
