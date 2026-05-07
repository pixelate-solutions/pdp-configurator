"use client";

import type {
  BreakerOption,
  ConfiguratorData,
  PanelSlot,
} from "@/lib/configurator-types";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { SlotEditorPanel } from "@/components/configurator/SlotEditorPanel";

export function SlotEditorSheet({
  open,
  onOpenChange,
  data,
  selectedSlot,
  selectedBreakerId,
  validationMessage,
  onChooseBreaker,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ConfiguratorData;
  selectedSlot: PanelSlot | null;
  selectedBreakerId: string | null;
  validationMessage?: string;
  onChooseBreaker: (breaker: BreakerOption | null) => void;
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="md:hidden">
        <DrawerTitle className="sr-only">
          {selectedSlot
            ? `Select breaker amperage for ${selectedSlot.label}`
            : "Select breaker amperage"}
        </DrawerTitle>
        <SlotEditorPanel
          data={data}
          selectedSlot={selectedSlot}
          selectedBreakerId={selectedBreakerId}
          validationMessage={validationMessage}
          onChooseBreaker={(breaker) => {
            onChooseBreaker(breaker);
            onOpenChange(false);
          }}
        />
      </DrawerContent>
    </Drawer>
  );
}
