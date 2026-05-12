"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowDown, ArrowUp, FolderOpen, Minus, Search } from "lucide-react";
import type { Frame } from "@/lib/configurator-types";
import type { SavedConfigurationImportOption } from "@/lib/db/queries";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SortField = "recommended" | "amps" | "height";
type SortDirection = "off" | "asc" | "desc";

export function FrameSelector({
  frames,
  selectedFrame,
  savedConfigurations,
  onSelectFrame,
}: {
  frames: Frame[];
  selectedFrame: Frame;
  savedConfigurations: SavedConfigurationImportOption[];
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
  const [search, setSearch] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>("recommended");
  const [sortDirection, setSortDirection] = useState<SortDirection>("off");

  const setSort = (field: SortField) => {
    setSortField(field);
    if (field === "recommended") {
      setSortDirection("off");
    } else if (sortDirection === "off") {
      setSortDirection("asc");
    }
  };

  const cycleSortDirection = () => {
    if (sortField === "recommended") {
      setSortField("amps");
      setSortDirection("asc");
      return;
    }

    setSortDirection((current) => {
      if (current === "off") return "asc";
      if (current === "asc") return "desc";
      return "off";
    });
  };

  const sortDirectionLabel =
    sortDirection === "asc"
      ? "Ascending"
      : sortDirection === "desc"
        ? "Descending"
        : "Sort direction off";
  const SortDirectionIcon =
    sortDirection === "asc" ? ArrowUp : sortDirection === "desc" ? ArrowDown : Minus;

  const filteredFrames = (items: Frame[]) => {
    const normalizedSearch = search.trim().toLowerCase();
    const filtered = items.filter((frame) => {
      const haystack = [
        frame.name,
        frame.catalogNumber,
        frame.panelType,
        frame.systemVoltage,
        frame.irRating,
        frame.feed,
        frame.mounting,
        frame.enclosure,
        frame.busMaterial,
        frame.conduitArea,
        frame.seLabel ? "SE label" : "No SE label",
        frame.seriesRated ? "series rated" : "fully rated",
        `${frame.mainBusAmps}A`,
        `${frame.heightInches} in`,
      ]
        .join(" ")
        .toLowerCase();

      return !normalizedSearch || haystack.includes(normalizedSearch);
    });

    return [...filtered].sort((a, b) => {
      if (sortDirection === "asc" && sortField === "amps") {
        return a.mainBusAmps - b.mainBusAmps;
      }
      if (sortDirection === "desc" && sortField === "amps") {
        return b.mainBusAmps - a.mainBusAmps;
      }
      if (sortDirection === "asc" && sortField === "height") {
        return a.heightInches - b.heightInches;
      }
      if (sortDirection === "desc" && sortField === "height") {
        return b.heightInches - a.heightInches;
      }
      if (a.id === selectedFrame.id) return -1;
      if (b.id === selectedFrame.id) return 1;
      return a.heightInches - b.heightInches || a.mainBusAmps - b.mainBusAmps;
    });
  };

  const filteredSiemensFrames = filteredFrames(siemensFrames);
  const filteredPdpFrames = filteredFrames(pdpFrames);

  const frameGrid = (items: Frame[], emptyMessage: string) => (
    <>
      {items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
          {items.map((frame) => (
            <button
              key={frame.id}
              type="button"
              className={`liquid-surface lift-hover cursor-pointer rounded-4xl border-2 p-6 text-left transition hover:cursor-pointer hover:border-primary/50 ${
                frame.id === selectedFrame.id
                  ? "border-primary shadow-[0_0_0_4px_rgba(43,129,191,0.16),var(--shadow-soft)]"
                  : "border-gray-200"
              }`}
              onClick={() => onSelectFrame(frame.id)}
            >
              <span className="mb-4 flex items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block text-base font-semibold text-primary">
                    {frame.panelType} · {frame.heightInches} in
                  </span>
                  <span className="mt-1 block truncate text-xs font-semibold text-muted-foreground">
                    {frame.name}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-[0_10px_24px_rgba(26,83,141,0.22)]">
                  {frame.mainBusAmps}A
                </span>
              </span>
              <span className="mt-2 block text-xs leading-5 text-muted-foreground">
                {frame.systemVoltage} · {frame.irRating} · {frame.feed} Feed ·{" "}
                {frame.mounting} Mount
              </span>
              <span className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-block rounded-full border border-white/70 bg-white/58 px-2.5 py-1 font-mono text-[11px] text-muted-foreground backdrop-blur">
                  {frame.catalogNumber}
                </span>
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
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[22px] font-semibold">Select a Panel Frame</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose the panelboard configuration to begin.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="w-full sm:w-auto"
          onClick={() => setImportOpen(true)}
        >
          <FolderOpen className="size-4" />
          Import saved configuration
        </Button>
      </div>
      <Tabs defaultValue={defaultTab}>
        <TabsList className="grid w-full grid-cols-2 sm:w-auto">
          <TabsTrigger value="siemens">
            Siemens panelboards
          </TabsTrigger>
          <TabsTrigger value="pdp">
            Electro-Matic PDPs
          </TabsTrigger>
        </TabsList>
        <div className="my-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_280px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="min-h-11 w-full rounded-2xl border border-white/70 bg-white py-2 pl-10 pr-3 text-sm font-semibold shadow-inner outline-none backdrop-blur transition placeholder:text-muted-foreground focus:border-primary/55 focus:ring-4 focus:ring-primary/15"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, description, or panel details..."
            />
          </label>
          <div className="grid grid-cols-[minmax(0,1fr)_48px] gap-2">
            <Select
              value={sortField}
              onValueChange={(value) => setSort(value as SortField)}
            >
              <SelectTrigger aria-label="Sort frames">
                <SelectValue placeholder="Sort frames" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="amps">Bus amps</SelectItem>
                <SelectItem value="height">Height</SelectItem>
              </SelectContent>
            </Select>
            <button
              type="button"
              aria-label={`Sort direction: ${sortDirectionLabel}`}
              title={sortDirectionLabel}
              className="pressable flex min-h-11 cursor-pointer items-center justify-center rounded-2xl border border-white/70 bg-white/78 text-foreground shadow-inner backdrop-blur transition hover:cursor-pointer hover:border-primary/30 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
              onClick={cycleSortDirection}
            >
              <SortDirectionIcon className="size-4" />
            </button>
          </div>
        </div>
        <TabsContent value="siemens">
          {frameGrid(
            filteredSiemensFrames,
            "No Siemens panelboard frames match the current search.",
          )}
        </TabsContent>
        <TabsContent value="pdp">
          {frameGrid(
            filteredPdpFrames,
            "No Electro-Matic PDP frames match the current search.",
          )}
        </TabsContent>
      </Tabs>
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-2xl rounded-[2rem] bg-white/88 p-6">
          <DialogHeader>
            <DialogTitle>Import saved configuration</DialogTitle>
            <DialogDescription>
              Open an existing configuration and continue from its saved breaker selections.
            </DialogDescription>
          </DialogHeader>
          {savedConfigurations.length > 0 ? (
            <div className="mt-5 grid max-h-[60vh] gap-3 overflow-y-auto pr-1">
              {savedConfigurations.map((configuration) => (
                <div
                  key={configuration.id}
                  className="liquid-surface grid gap-3 rounded-3xl p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-primary">
                      {configuration.name}
                    </h3>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {configuration.customerName} · {configuration.projectName}
                    </p>
                    <p className="mt-2 text-[11px] font-semibold text-muted-foreground">
                      Saved {new Date(configuration.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button asChild size="sm" className="w-full sm:w-auto">
                    <Link href={`/configurator/${configuration.id}`}>Import</Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-3xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No saved configurations are available to import yet.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
