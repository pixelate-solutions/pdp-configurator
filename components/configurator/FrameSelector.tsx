"use client";

import type { Frame } from "@/lib/configurator-types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function FrameSelector({
  frames,
  selectedFrame,
  onSelectFrame,
}: {
  frames: Frame[];
  selectedFrame: Frame;
  onSelectFrame: (frameId: string) => void;
}) {
  const isSiemensFrame = (frame: Frame) => {
    const searchable = `${frame.name} ${frame.panelType} ${frame.catalogNumber}`.toLowerCase();
    return searchable.includes("siemens");
  };
  const isPdpFrame = (frame: Frame) => {
    const searchable = `${frame.name} ${frame.panelType} ${frame.catalogNumber}`.toLowerCase();
    return searchable.includes("electro-matic") || searchable.includes("pdp");
  };
  const siemensFrames = frames.filter(isSiemensFrame);
  const pdpFrames = frames.filter((frame) => isPdpFrame(frame) && !isSiemensFrame(frame));
  const defaultTab = isPdpFrame(selectedFrame) && !isSiemensFrame(selectedFrame)
    ? "pdp"
    : "siemens";

  const frameGrid = (items: Frame[], emptyMessage: string) => (
    <>
      {items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
          {items.map((frame) => (
            <button
              key={frame.id}
              type="button"
              className={`liquid-surface lift-hover cursor-pointer rounded-4xl p-6 text-left transition hover:cursor-pointer hover:border-primary/50 border-2 border-gray-200 shadow-[0_0_0_4px_rgba(43,129,191,0.16),var(--shadow-soft)]`}
              onClick={() => onSelectFrame(frame.id)}
            >
              <span className="float-right rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-[0_10px_24px_rgba(26,83,141,0.22)]">
                {frame.mainBusAmps}A
              </span>
              <span className="block text-base font-semibold text-primary">
                {frame.panelType} · {frame.heightInches} in
              </span>
              <span className="mt-2 block text-xs leading-5 text-muted-foreground">
                {frame.systemVoltage} · {frame.irRating} · {frame.feed} Feed ·{" "}
                {frame.mounting} Mount
              </span>
              <span className="mt-4 inline-block rounded-full border border-white/70 bg-white/58 px-2.5 py-1 font-mono text-[11px] text-muted-foreground backdrop-blur">
                {frame.catalogNumber}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="liquid-surface rounded-4xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      )}
    </>
  );

  return (
    <section>
      <h2 className="text-[22px] font-semibold">Select a Panel Frame</h2>
      <p className="mt-1 mb-7 text-sm text-muted-foreground">
        Choose the panelboard configuration to begin.
      </p>
      <Tabs defaultValue={defaultTab}>
        <TabsList className="grid w-full grid-cols-2 sm:w-auto">
          <TabsTrigger value="siemens">Siemens panelboards</TabsTrigger>
          <TabsTrigger value="pdp">Electro-Matic PDPs</TabsTrigger>
        </TabsList>
        <TabsContent value="siemens">
          {frameGrid(
            siemensFrames,
            "No Siemens panelboard frames are available yet.",
          )}
        </TabsContent>
        <TabsContent value="pdp">
          {frameGrid(
            pdpFrames,
            "No Electro-Matic PDP frames are available yet.",
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}
