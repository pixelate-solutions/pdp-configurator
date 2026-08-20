"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Maximize2, Minimize2 } from "lucide-react";
import type {
  BreakerOption,
  ConfiguratorData,
  PanelSlot,
  SlotSelection,
} from "@/lib/configurator-types";
import {
  buildBom,
  createDefaultSelections,
  getAllowedBreakers,
  validateSelection,
} from "@/lib/bom";
import {
  PANELBOARD_IMPORT_STORAGE_KEY,
  buildPanelboardExport,
  findImportFrame,
  mapImportSelections,
  parsePanelboardExport,
} from "@/lib/panelboard-export";
import { readJsonFile } from "@/lib/export";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FrameSelector } from "@/components/configurator/FrameSelector";
import { PanelboardGraphic } from "@/components/configurator/PanelboardGraphic";
import {
  ActionBar,
  BomTable,
  ModelNumberCard,
  PrintSheet,
  SpecDetails,
} from "@/components/em/summary";

type ConfiguratorStep = "frame" | "breakers" | "summary";

const stepOrder: ConfiguratorStep[] = ["frame", "breakers", "summary"];
const stepLabels: Record<ConfiguratorStep, string> = {
  frame: "Frame",
  breakers: "Breakers",
  summary: "Summary",
};

export function ConfiguratorWorkspace({
  data,
  initialStep = "frame",
  initialFrameSelected = false,
}: {
  data: ConfiguratorData;
  initialStep?: ConfiguratorStep;
  initialFrameSelected?: boolean;
}) {
  const router = useRouter();
  const [selections, setSelections] = useState<SlotSelection>(() =>
    createDefaultSelections(data),
  );
  const [activeStep, setActiveStep] = useState<ConfiguratorStep>(initialStep);
  const [frameSelected, setFrameSelected] = useState(initialFrameSelected);
  const [walkIndex, setWalkIndex] = useState(0);
  const [invalidSlotId, setInvalidSlotId] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState("");
  const [clearOpen, setClearOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const finishedPanelSvgRef = useRef<SVGSVGElement | null>(null);

  // Apply a cross-frame import handed off through sessionStorage. Runs after
  // hydration (not in a state initializer) so server and client render the
  // same HTML; deferred to a timeout so the effect itself stays side-effect only.
  useEffect(() => {
    const stored = window.sessionStorage.getItem(PANELBOARD_IMPORT_STORAGE_KEY);
    if (!stored) return;
    window.sessionStorage.removeItem(PANELBOARD_IMPORT_STORAGE_KEY);

    let file: ReturnType<typeof parsePanelboardExport> = null;
    try {
      file = parsePanelboardExport(JSON.parse(stored));
    } catch {
      return;
    }
    if (
      !file ||
      (file.frame.id !== data.selectedFrame.id &&
        file.frame.catalogNumber !== data.selectedFrame.catalogNumber)
    ) {
      return;
    }

    const applied = file;
    const timer = window.setTimeout(() => {
      setSelections(mapImportSelections(data, applied));
      setFrameSelected(true);
      setActiveStep("summary");
      setPreviewMode(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [data]);

  const bom = useMemo(() => buildBom(data, selections), [data, selections]);
  const selectedSlot = data.slots[walkIndex] ?? data.slots[0] ?? null;
  const selectedSlotId = selectedSlot?.id ?? null;
  const selectedBreakerId = selectedSlot ? selections[selectedSlot.id] ?? null : null;
  const selectedBreaker = selectedBreakerId
    ? data.breakerOptions.find((option) => option.id === selectedBreakerId)
    : null;
  const allowedBreakers = selectedSlot ? getAllowedBreakers(data, selectedSlot.id) : [];

  const specs: [string, string][] = [
    ["Panel type", data.selectedFrame.panelType],
    ["Catalog", data.selectedFrame.catalogNumber],
    ["Height", `${data.selectedFrame.heightInches} in`],
    ["Enclosure", data.selectedFrame.enclosure],
    ["Voltage", data.selectedFrame.systemVoltage],
    ["IR rating", data.selectedFrame.irRating],
    [
      "Main bus",
      `${data.selectedFrame.mainBusAmps}A ${data.selectedFrame.busMaterial}`,
    ],
    ["Main breaker", data.mainBreaker.catalogNumber],
    ["Main lugs", data.mainBreaker.lugDescription],
    ["Feed", data.selectedFrame.feed],
    ["Mounting", data.selectedFrame.mounting],
    ["Conduit area", data.selectedFrame.conduitArea],
    ["SE label", data.selectedFrame.seLabel ? "Yes" : "No"],
    ["Series rated", data.selectedFrame.seriesRated ? "Yes" : "No"],
  ];

  const goToStep = (step: ConfiguratorStep) => {
    setActiveStep(step);
    if (step === "summary") setPreviewMode(true);
  };

  const openFrameConfiguration = (frameId: string) => {
    setFrameSelected(true);
    setActiveStep("breakers");
    setPreviewMode(false);
    setWalkIndex(0);

    if (frameId !== data.selectedFrame.id) {
      router.push(`/panelboards?frameId=${frameId}&step=breakers`);
    }
  };

  const chooseSlot = (slot: PanelSlot) => {
    const index = data.slots.findIndex((item) => item.id === slot.id);
    if (index >= 0) setWalkIndex(index);
    setInvalidSlotId(null);
    setValidationMessage("");
  };

  const walkTo = (index: number) => {
    setWalkIndex(Math.max(0, Math.min(index, data.slots.length - 1)));
    setInvalidSlotId(null);
    setValidationMessage("");
  };

  const chooseBreaker = (breaker: BreakerOption | null, autoAdvance = true) => {
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

    if (breaker && autoAdvance) {
      window.setTimeout(() => {
        if (walkIndex < data.slots.length - 1) walkTo(walkIndex + 1);
      }, 220);
    }
  };

  const confirmClearAll = () => {
    setSelections(createDefaultSelections(data));
    setValidationMessage("");
    setInvalidSlotId(null);
    setClearOpen(false);
  };

  const handleImportPayload = (payload: unknown): string | null => {
    const file = parsePanelboardExport(payload);
    if (!file) return "This file is not a panelboard configuration.";
    const frame = findImportFrame(data, file);
    if (!frame) return "The frame in this file is no longer available.";

    if (frame.id === data.selectedFrame.id) {
      setSelections(mapImportSelections(data, file));
      setFrameSelected(true);
      goToStep("summary");
      return null;
    }

    window.sessionStorage.setItem(PANELBOARD_IMPORT_STORAGE_KEY, JSON.stringify(file));
    router.push(`/panelboards?frameId=${frame.id}&step=summary`);
    return null;
  };

  const handleImportFile = async (file: File) => {
    try {
      const payload = await readJsonFile(file);
      setImportError(handleImportPayload(payload));
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "The file could not be imported.");
    }
  };

  const stepIndex = stepOrder.indexOf(activeStep);

  return (
    <>
      <div className="no-print mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 lg:flex lg:min-h-screen lg:flex-col">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Siemens Panelboards</h1>
          <nav className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
            {stepOrder.map((step, index) => {
              const active = activeStep === step;
              const done = index < stepIndex;
              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => goToStep(step)}
                  className={`pressable min-h-9 cursor-pointer rounded-md px-4 text-sm font-semibold transition ${
                    active
                      ? "bg-primary text-white"
                      : done
                        ? "text-primary hover:bg-muted"
                        : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {stepLabels[step]}
                </button>
              );
            })}
          </nav>
        </div>

        {activeStep === "frame" ? (
          <section className="mt-6">
            <FrameSelector
              frames={data.frames}
              selectedFrame={data.selectedFrame}
              onSelectFrame={openFrameConfiguration}
              onImportFile={(file) => void handleImportFile(file)}
              importError={importError}
            />
          </section>
        ) : null}

        {activeStep === "breakers" ? (
          <section className="mt-6 grid gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <div className="relative order-2 lg:order-1 lg:h-full lg:min-h-0">
              <div className="pointer-events-none absolute right-4 top-4 z-10">
                <Button
                  type="button"
                  variant="secondary"
                  className="pointer-events-auto size-11 p-2"
                  aria-label={previewMode ? "Zoom to slot" : "View full panel"}
                  title={previewMode ? "Zoom to slot" : "View full panel"}
                  onClick={() => setPreviewMode((current) => !current)}
                >
                  {previewMode ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                </Button>
              </div>
              <PanelboardGraphic
                data={data}
                selections={selections}
                selectedSlotId={selectedSlotId}
                invalidSlotId={invalidSlotId}
                previewMode={previewMode}
                onSelectSlot={chooseSlot}
              />
            </div>

            <aside className="card order-1 p-5 lg:order-2 lg:sticky lg:top-6">
              <h2 className="text-2xl font-bold text-primary">
                Circuit {selectedSlot?.circuitNumbers.split("/")[0]}
              </h2>

              {validationMessage ? (
                <p className="mt-3 rounded-lg border border-accent/60 bg-accent/10 px-3 py-2 text-xs font-semibold text-danger">
                  {validationMessage}
                </p>
              ) : null}

              <div className="mt-4 grid grid-cols-3 gap-2">
                {allowedBreakers.map((breaker) => (
                  <button
                    key={breaker.id}
                    type="button"
                    className={`pressable cursor-pointer rounded-lg border px-2 py-3 text-center text-base font-bold transition ${
                      selectedBreakerId === breaker.id
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-card text-foreground hover:border-primary/50"
                    }`}
                    onClick={() => chooseBreaker(breaker)}
                  >
                    {breaker.amps}A
                  </button>
                ))}
              </div>

              {selectedBreaker ? (
                <div className="mt-3 flex items-center justify-between rounded-lg bg-muted px-3 py-2">
                  <span className="text-sm font-bold">{selectedBreaker.amps}A selected</span>
                  <button
                    type="button"
                    className="pressable cursor-pointer rounded-md px-2 py-1 text-xs font-semibold text-danger hover:bg-danger hover:text-white"
                    onClick={() => chooseBreaker(null, false)}
                  >
                    Clear
                  </button>
                </div>
              ) : null}

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={walkIndex === 0}
                  onClick={() => walkTo(walkIndex - 1)}
                >
                  ← Back
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (walkIndex < data.slots.length - 1) walkTo(walkIndex + 1);
                    else goToStep("summary");
                  }}
                >
                  {walkIndex === data.slots.length - 1
                    ? "Finish →"
                    : selectedBreaker
                      ? "Next →"
                      : "Skip →"}
                </Button>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-2 w-full text-danger"
                onClick={() => setClearOpen(true)}
              >
                Clear All
              </Button>
            </aside>
          </section>
        ) : null}

        {activeStep === "summary" ? (
          <section className="mt-6">
            {!frameSelected ? (
              <div className="card flex flex-col items-center gap-4 p-12 text-center">
                <Button type="button" onClick={() => goToStep("frame")}>
                  Select a Panel Frame
                </Button>
              </div>
            ) : (
              <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
                <PanelboardGraphic
                  data={data}
                  selections={selections}
                  selectedSlotId={null}
                  previewMode
                  completed
                  svgRef={finishedPanelSvgRef}
                  onSelectSlot={() => undefined}
                />
                <div className="grid gap-4">
                  <ModelNumberCard model={data.selectedFrame.catalogNumber} />
                  <ActionBar
                    baseName="panelboard"
                    exportPayload={() => buildPanelboardExport(data, selections)}
                    onImport={handleImportPayload}
                    svgRef={finishedPanelSvgRef}
                    imageSize={{ width: 960, height: 2700 }}
                    bomLines={bom.lines.map((line) => ({
                      quantity: line.quantity,
                      catalogNumber: line.catalogNumber,
                      description: line.description,
                    }))}
                    modelNumber={data.selectedFrame.catalogNumber}
                  />
                  <SpecDetails specs={specs} />
                  <BomTable
                    lines={bom.lines.map((line) => ({
                      quantity: line.quantity,
                      catalogNumber: line.catalogNumber,
                      description: line.description,
                    }))}
                  />
                </div>
              </div>
            )}
          </section>
        ) : null}
      </div>

      {activeStep === "summary" && frameSelected ? (
        <PrintSheet
          title="Siemens Panelboard"
          modelNumber={data.selectedFrame.catalogNumber}
          specs={specs}
          bomLines={bom.lines.map((line) => ({
            quantity: line.quantity,
            catalogNumber: line.catalogNumber,
            description: line.description,
          }))}
        />
      ) : null}

      <Dialog open={clearOpen} onOpenChange={setClearOpen}>
        <DialogContent className="max-w-md rounded-xl bg-card p-6 text-center">
          <DialogHeader className="mx-auto mb-5 pr-0">
            <DialogTitle>Clear all breaker selections?</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          <div className="flex flex-col-reverse items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="secondary"
              className="min-w-32"
              onClick={() => setClearOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" variant="danger" className="min-w-32" onClick={confirmClearAll}>
              Clear All
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
