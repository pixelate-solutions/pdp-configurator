"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, FileUp, Minus, Search } from "lucide-react";
import type { Frame } from "@/lib/configurator-types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortField = "recommended" | "amps" | "height";
type SortDirection = "off" | "asc" | "desc";

export function FrameSelector({
  frames,
  selectedFrame,
  onSelectFrame,
  onImportFile,
  importError,
}: {
  frames: Frame[];
  selectedFrame: Frame;
  onSelectFrame: (frameId: string) => void;
  onImportFile: (file: File) => void;
  importError: string | null;
}) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("recommended");
  const [sortDirection, setSortDirection] = useState<SortDirection>("off");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const normalizedSearch = search.trim().toLowerCase();
  const filtered = frames
    .filter((frame) => {
      const haystack = [
        frame.name,
        frame.catalogNumber,
        frame.panelType,
        frame.systemVoltage,
        `${frame.mainBusAmps}A`,
        `${frame.heightInches} in`,
      ]
        .join(" ")
        .toLowerCase();
      return !normalizedSearch || haystack.includes(normalizedSearch);
    })
    .sort((a, b) => {
      if (sortDirection !== "off" && sortField === "amps") {
        return sortDirection === "asc"
          ? a.mainBusAmps - b.mainBusAmps
          : b.mainBusAmps - a.mainBusAmps;
      }
      if (sortDirection !== "off" && sortField === "height") {
        return sortDirection === "asc"
          ? a.heightInches - b.heightInches
          : b.heightInches - a.heightInches;
      }
      if (a.id === selectedFrame.id) return -1;
      if (b.id === selectedFrame.id) return 1;
      return a.heightInches - b.heightInches || a.mainBusAmps - b.mainBusAmps;
    });

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold">Select a Panel Frame</h2>
        <Button
          type="button"
          variant="secondary"
          className="w-full sm:w-auto"
          onClick={() => fileInputRef.current?.click()}
        >
          <FileUp className="size-4" />
          Import Configuration
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onImportFile(file);
            event.target.value = "";
          }}
        />
      </div>
      {importError ? (
        <p role="alert" className="mb-4 text-sm font-semibold text-danger">
          {importError}
        </p>
      ) : null}

      <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_280px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="min-h-11 w-full rounded-lg border border-border bg-card py-2 pl-10 pr-3 text-sm font-semibold outline-none transition placeholder:text-muted-foreground focus:border-primary"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search"
          />
        </label>
        <div className="grid grid-cols-[minmax(0,1fr)_48px] gap-2">
          <Select value={sortField} onValueChange={(value) => setSort(value as SortField)}>
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
            className="pressable flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-border bg-card text-foreground transition hover:border-primary/40"
            onClick={cycleSortDirection}
          >
            <SortDirectionIcon className="size-4" />
          </button>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
          {filtered.map((frame) => (
            <button
              key={frame.id}
              type="button"
              className={`card pressable cursor-pointer p-5 text-left hover:border-primary/50 ${
                frame.id === selectedFrame.id ? "border-primary ring-2 ring-primary/20" : ""
              }`}
              onClick={() => onSelectFrame(frame.id)}
            >
              <span className="flex items-start justify-between gap-3">
                <span className="block text-base font-bold text-primary">
                  {frame.panelType} · {frame.heightInches} in
                </span>
                <span className="shrink-0 rounded-md bg-primary px-2.5 py-1 text-xs font-bold text-white">
                  {frame.mainBusAmps}A
                </span>
              </span>
              <span className="mt-3 inline-block rounded-md bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground">
                {frame.catalogNumber}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="card border-dashed p-6 text-sm text-muted-foreground">
          No frames match the current search.
        </div>
      )}
    </section>
  );
}
