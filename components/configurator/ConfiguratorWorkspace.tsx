"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, RotateCcw, Save } from "lucide-react";
import type {
  BreakerOption,
  ConfiguratorData,
  PanelSlot,
  SlotSelection,
} from "@/lib/configurator-types";
import {
  buildBom,
  createDefaultSelections,
  validateSelection,
} from "@/lib/bom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FrameSelector } from "@/components/configurator/FrameSelector";
import { PanelboardGraphic } from "@/components/configurator/PanelboardGraphic";
import { SlotEditorPanel } from "@/components/configurator/SlotEditorPanel";
import { SlotEditorSheet } from "@/components/configurator/SlotEditorSheet";
import { LiveBom } from "@/components/configurator/LiveBom";
import { MobileBottomActionBar } from "@/components/configurator/MobileBottomActionBar";
import { ConfigurationSummary } from "@/components/configurator/ConfigurationSummary";
import { SaveConfigurationDialog } from "@/components/configurator/SaveConfigurationDialog";
import { ExportQuoteButton } from "@/components/configurator/ExportQuoteButton";

export function ConfiguratorWorkspace({
  data,
  initialSelections,
}: {
  data: ConfiguratorData;
  initialSelections?: SlotSelection;
}) {
  const router = useRouter();
  const [selections, setSelections] = useState<SlotSelection>(
    initialSelections ?? createDefaultSelections(data),
  );
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(
    data.slots[0]?.id ?? null,
  );
  const [invalidSlotId, setInvalidSlotId] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);

  const bom = useMemo(() => buildBom(data, selections), [data, selections]);
  const selectedSlot =
    data.slots.find((slot) => slot.id === selectedSlotId) ?? null;
  const selectedBreakerId = selectedSlot
    ? selections[selectedSlot.id] ?? null
    : null;

  const chooseSlot = (slot: PanelSlot) => {
    setSelectedSlotId(slot.id);
    setInvalidSlotId(null);
    setValidationMessage("");
    setSheetOpen(true);
  };

  const chooseBreaker = (breaker: BreakerOption | null) => {
    if (!selectedSlot) return;

    const validation = validateSelection(data, selectedSlot.id, breaker?.id ?? null);
    if (!validation.valid) {
      setInvalidSlotId(selectedSlot.id);
      setValidationMessage(validation.message);
      return;
    }

    setSelections((current) => ({
      ...current,
      [selectedSlot.id]: breaker?.id ?? null,
    }));
    setInvalidSlotId(null);
    setValidationMessage("");
  };

  const clearAll = () => {
    if (window.confirm("Clear every breaker selection? Empty slots will keep cover plates in the BOM.")) {
      setSelections(createDefaultSelections(data));
    }
  };

  const duplicateConfiguration = () => {
    setSaveOpen(true);
  };

  const selectedSlotCards = data.slots
    .map((slot) => ({
      slot,
      breaker: data.breakerOptions.find(
        (option) => option.id === selections[slot.id],
      ),
    }))
    .filter((item) => item.breaker);

  return (
    <main className="min-h-screen overflow-x-hidden pb-28 md:pb-0">
      <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-6 lg:px-8">
        <header className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">
              Electro-Matic Products Inc.
            </p>
            <h1 className="text-3xl font-semibold">
              Siemens Panelboard Configurator
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              PROV means provision for future device. Empty slots automatically
              price cover plates.
            </p>
          </div>
          <div className="grid w-full grid-cols-1 gap-2 min-[420px]:grid-cols-3 md:w-auto md:flex">
            <Button type="button" variant="secondary" onClick={clearAll}>
              <RotateCcw className="size-4" />
              <span className="truncate">Clear all</span>
            </Button>
            <Button type="button" variant="secondary" onClick={duplicateConfiguration}>
              <Copy className="size-4" />
              <span className="truncate">Duplicate</span>
            </Button>
            <Button type="button" onClick={() => setSaveOpen(true)}>
              <Save className="size-4" />
              <span className="truncate">Save</span>
            </Button>
          </div>
        </header>

        <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_430px]">
          <div className="grid min-w-0 gap-5">
            <FrameSelector
              frames={data.frames}
              selectedFrame={data.selectedFrame}
              onSelectFrame={(frameId) => router.push(`/configurator?frameId=${frameId}`)}
            />
            <PanelboardGraphic
              data={data}
              selections={selections}
              selectedSlotId={selectedSlotId}
              invalidSlotId={invalidSlotId}
              onSelectSlot={chooseSlot}
            />

            <details className="min-w-0 rounded-lg border border-border bg-white p-4 shadow-sm">
              <summary className="cursor-pointer text-sm font-semibold text-primary">
                Selected slots
              </summary>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {selectedSlotCards.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No breakers selected yet.
                  </p>
                ) : (
                  selectedSlotCards.map(({ slot, breaker }) => (
                    <button
                      key={slot.id}
                      type="button"
                      className="min-w-0 rounded-md border border-border bg-white p-3 text-left shadow-sm"
                      onClick={() => chooseSlot(slot)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold">{slot.label}</span>
                        <Badge>{breaker?.amps}A</Badge>
                      </div>
                      <p className="mt-1 break-words text-sm text-muted-foreground">
                        Circuits {slot.circuitNumbers} • {slot.breakerFamily}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </details>

            <div className="lg:hidden">
              <LiveBom bom={bom} />
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-5 grid gap-5">
              <SlotEditorPanel
                data={data}
                selectedSlot={selectedSlot}
                selectedBreakerId={selectedBreakerId}
                validationMessage={validationMessage}
                onChooseBreaker={chooseBreaker}
              />
              <ConfigurationSummary data={data} />
              <ExportQuoteButton data={data} bom={bom} />
              <LiveBom bom={bom} />
            </div>
          </aside>
        </div>
      </div>

      <SlotEditorSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        data={data}
        selectedSlot={selectedSlot}
        selectedBreakerId={selectedBreakerId}
        validationMessage={validationMessage}
        onChooseBreaker={chooseBreaker}
      />
      <SaveConfigurationDialog
        open={saveOpen}
        onOpenChange={setSaveOpen}
        data={data}
        selections={selections}
      />
      <MobileBottomActionBar
        selectedSlot={selectedSlot}
        total={bom.totalSellPrice}
        onChooseBreaker={() => setSheetOpen(true)}
        onViewBom={() =>
          document.getElementById("live-bom")?.scrollIntoView({ behavior: "smooth" })
        }
        onSave={() => setSaveOpen(true)}
      />
    </main>
  );
}
