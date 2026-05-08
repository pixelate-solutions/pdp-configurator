"use client";

import type { Frame } from "@/lib/configurator-types";
import { Badge } from "@/components/ui/badge";
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
              className={`cursor-pointer rounded-[6px] border-2 bg-white p-6 text-left transition hover:cursor-pointer hover:border-primary hover:shadow-[0_1px_3px_rgba(0,0,0,0.10),0_4px_12px_rgba(0,0,0,0.06)] ${
                frame.id === selectedFrame.id
                  ? "border-primary shadow-[0_0_0_3px_rgba(30,72,126,0.15)]"
                  : "border-border"
              }`}
              onClick={() => onSelectFrame(frame.id)}
            >
              <span className="float-right rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-[0_2px_8px_rgba(30,72,126,0.25)]">
                {frame.mainBusAmps}A
              </span>
              <span className="block text-base font-semibold text-primary">
                {frame.panelType} · {frame.heightInches} in
              </span>
              <span className="mt-2 block text-xs leading-5 text-muted-foreground">
                {frame.systemVoltage} · {frame.irRating} · {frame.feed} Feed ·{" "}
                {frame.mounting} Mount
              </span>
              <span className="mt-4 inline-block rounded bg-background px-2 py-1 font-mono text-[11px] text-muted-foreground">
                {frame.catalogNumber}
              </span>
              {frame.id === selectedFrame.id ? (
                <Badge className="ml-2" variant="success">
                  Selected
                </Badge>
              ) : null}
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-[6px] border border-dashed border-border bg-white p-6 text-sm text-muted-foreground">
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
