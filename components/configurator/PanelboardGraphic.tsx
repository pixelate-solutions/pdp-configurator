"use client";

import { useCallback, useEffect, useRef, useState, type Ref } from "react";
import type {
  BreakerOption,
  ConfiguratorData,
  PanelSlot,
  SlotSelection,
} from "@/lib/configurator-types";

export function PanelboardGraphic({
  data,
  selections,
  selectedSlotId,
  invalidSlotId,
  previewMode = false,
  completed = false,
  svgRef,
  onSelectSlot,
}: {
  data: ConfiguratorData;
  selections: SlotSelection;
  selectedSlotId: string | null;
  invalidSlotId?: string | null;
  previewMode?: boolean;
  completed?: boolean;
  svgRef?: Ref<SVGSVGElement>;
  onSelectSlot: (slot: PanelSlot) => void;
}) {
  const breakerById = new Map(data.breakerOptions.map((item) => [item.id, item]));
  const animationRef = useRef<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const viewBoxRef = useRef({ x: 0, y: 0, w: 320, h: 900 });
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 320, h: 900 });
  const scrollableMode = !previewMode && !completed;
  const lowerSlotCount = data.slots.filter((slot) => slot.breakerFamily === "3VA52").length;
  const lowerRows = Math.ceil(lowerSlotCount / 2);
  const lowerSlotHeight = lowerSlotCount > 16 ? 42 : 48;
  const lowerPitch = lowerSlotCount > 16 ? 44 : 50;
  const bottomY = 333 + lowerRows * lowerPitch + 4;

  const selectedBreakerFor = (slot: PanelSlot): BreakerOption | null => {
    const selected = selections[slot.id];
    return selected ? breakerById.get(selected) ?? null : null;
  };

  const slotGeometry = useCallback((slot: PanelSlot, index: number) => {
    if (index < 4) {
      const topIndex = index;
      return {
        x: topIndex % 2 === 0 ? 18 : 163,
        y: topIndex < 2 ? 241 : 279,
        w: 139,
        h: 36,
        zone: "3VA41 FRAME · TOP ZONE",
      };
    }

    const lowerIndex = index - 4;
    return {
      x: lowerIndex % 2 === 0 ? 18 : 163,
      y: 333 + Math.floor(lowerIndex / 2) * lowerPitch,
      w: 139,
      h: lowerSlotHeight,
      zone: "3VA52 FRAME · LOWER ZONE",
    };
  }, [lowerPitch, lowerSlotHeight]);

  useEffect(() => {
    const selectedIndex = data.slots.findIndex((slot) => slot.id === selectedSlotId);
    const selectedSlot =
      selectedIndex >= 0 ? data.slots[selectedIndex] ?? null : null;
    const selectedGeometry = selectedSlot
      ? slotGeometry(selectedSlot, selectedIndex)
      : null;
    const target =
      previewMode || completed || !selectedGeometry
        ? { x: 0, y: 0, w: 320, h: 900 }
        : {
            x: 0,
            y: Math.max(0, selectedGeometry.y + selectedGeometry.h / 2 - 150),
            w: 320,
            h: 300,
          };
    const start = viewBoxRef.current;
    const startTime = performance.now();
    const duration = 520;

    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    const animate = (time: number) => {
      const progress = Math.min(1, (time - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextViewBox = {
        x: start.x + (target.x - start.x) * eased,
        y: start.y + (target.y - start.y) * eased,
        w: start.w + (target.w - start.w) * eased,
        h: start.h + (target.h - start.h) * eased,
      };
      viewBoxRef.current = nextViewBox;
      setViewBox(nextViewBox);
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [selectedSlotId, previewMode, completed, data.slots, slotGeometry]);

  useEffect(() => {
    if (!scrollableMode || !selectedSlotId) return;

    const scrollContainer = scrollContainerRef.current;
    const selectedIndex = data.slots.findIndex((slot) => slot.id === selectedSlotId);
    const selectedSlot =
      selectedIndex >= 0 ? data.slots[selectedIndex] ?? null : null;
    if (!scrollContainer || !selectedSlot) return;

    const geometry = slotGeometry(selectedSlot, selectedIndex);
    const slotCenter = geometry.y + geometry.h / 2;
    const scrollTarget =
      (slotCenter / 900) * scrollContainer.scrollHeight -
      scrollContainer.clientHeight / 2;

    scrollContainer.scrollTo({
      top: Math.max(0, scrollTarget),
      behavior: "smooth",
    });
  }, [selectedSlotId, scrollableMode, data.slots, slotGeometry]);

  const activeViewBox = scrollableMode
    ? { x: 0, y: 0, w: 320, h: 900 }
    : viewBox;

  return (
    <section
      className={`card overflow-hidden ${
        scrollableMode ? "lg:flex lg:h-full lg:min-h-0 lg:flex-col" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border bg-primary px-5 py-3 text-white">
        <div className="min-w-0 truncate text-[13px] font-bold">
          {data.selectedFrame.panelType} · {data.selectedFrame.heightInches} in
        </div>
        <div className="shrink-0 text-[11px] text-white/70">
          {data.selectedFrame.catalogNumber}
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className={`bg-[#1f2933] p-2 sm:p-4 ${
          scrollableMode
            ? "max-h-[70dvh] overflow-y-auto overscroll-contain scroll-smooth lg:min-h-0 lg:max-h-none lg:flex-1"
            : ""
        }`}
      >
        <svg
          ref={svgRef}
          className="mx-auto block h-auto w-full max-w-[480px]"
          viewBox={`${activeViewBox.x} ${activeViewBox.y} ${activeViewBox.w} ${activeViewBox.h}`}
          role="img"
          aria-label="Panelboard layout"
        >
          <rect x="0" y="0" width="320" height="900" fill="#e8e6e2" />
          <rect x="8" y="8" width="304" height="884" fill="#d4d1cc" />
          <rect x="14" y="14" width="292" height="872" fill="#f0eeeb" />

          <rect x="14" y="14" width="292" height="85" fill="#c8c5bf" />
          <text x="160" y="48" textAnchor="middle" fontSize="11" fill="#6b6560" fontWeight="600">
            TOP FEED
          </text>
          <text x="160" y="63" textAnchor="middle" fontSize="9" fill="#8a8680">
            CONDUIT AREA 30.0 x 10.75
          </text>
          <text x="160" y="76" textAnchor="middle" fontSize="9" fill="#8a8680">
            480Y/277V · 3Ø · 65 KAIC
          </text>

          <rect x="30" y="99" width="260" height="116" fill="#2a3a50" rx="3" />
          <rect x="34" y="103" width="252" height="108" fill="#1e4882" rx="2" />
          <rect x="120" y="115" width="80" height="54" fill="#162d52" rx="3" />
          <rect x="130" y="120" width="60" height="18" fill="#0d1f3c" rx="2" />
          <rect x="145" y="143" width="30" height="20" fill="#0a6abf" rx="2" />
          <text x="160" y="134" textAnchor="middle" fontSize="9" fill="white" fontWeight="700">
            MAIN
          </text>
          <text x="160" y="157" textAnchor="middle" fontSize="8" fill="white" opacity="0.8">
            ON
          </text>
          <text x="54" y="148" textAnchor="middle" fontSize="9" fill="white" fontWeight="700">
            {data.mainBreaker.amps}A
          </text>
          <text x="54" y="160" textAnchor="middle" fontSize="8" fill="white" opacity="0.6">
            {data.mainBreaker.poles}P
          </text>
          <text x="278" y="148" textAnchor="end" fontSize="8" fill="white" opacity="0.7">
            {data.mainBreaker.family}
          </text>
          <text x="278" y="160" textAnchor="end" fontSize="7" fill="white" opacity="0.5">
            FIXED · INCL.
          </text>

          <rect x="148" y="215" width="8" height="12" fill="#b0906a" rx="1" />
          <rect x="160" y="215" width="8" height="12" fill="#b0906a" rx="1" />
          <rect x="172" y="215" width="8" height="12" fill="#b0906a" rx="1" />

          <rect x="14" y="227" width="292" height="14" fill="#dedad4" />
          <text x="160" y="237" textAnchor="middle" fontSize="8" fill="#6b6560" fontWeight="700">
            3VA41 FRAME · TOP ZONE
          </text>
          <rect x="14" y="317" width="292" height="14" fill="#dedad4" />
          <text x="160" y="327" textAnchor="middle" fontSize="8" fill="#6b6560" fontWeight="700">
            3VA52 FRAME · LOWER ZONE
          </text>

          {data.slots.map((slot, index) => {
            const geometry = slotGeometry(slot, index);
            const breaker = selectedBreakerFor(slot);
            const selected = slot.id === selectedSlotId;
            const invalid = slot.id === invalidSlotId;
            const fill = breaker ? "#cce0f5" : selected ? "#fff8dc" : "#e8e6e2";
            const stroke = invalid
              ? "#c2410c"
              : selected
                ? "#dcaa00"
                : breaker
                  ? "rgb(30,72,126)"
                  : "#c8c5bf";
            const strokeWidth = selected || invalid ? 3 : breaker ? 2 : 1.5;
            const circuit = slot.circuitNumbers.split("/")[0];

            return (
              <g key={slot.id}>
                <rect
                  x={geometry.x}
                  y={geometry.y}
                  width={geometry.w}
                  height={geometry.h}
                  fill={fill}
                  rx="2"
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  className="cursor-pointer transition duration-300 hover:cursor-pointer hover:fill-[#dce8f8]"
                  onClick={() => onSelectSlot(slot)}
                />
                <text x={geometry.x + 8} y={geometry.y + 12} fontSize="7" fill="#9a9590" fontWeight="600" pointerEvents="none">
                  CKT {circuit}
                </text>
                <text
                  x={geometry.x + geometry.w / 2}
                  y={geometry.y + (geometry.h > 40 ? 28 : 23)}
                  textAnchor="middle"
                  fontSize={geometry.h > 40 ? "17" : "14"}
                  fill={breaker ? "rgb(30,72,126)" : "#c8c5bf"}
                  fontWeight="700"
                  pointerEvents="none"
                >
                  {breaker ? `${breaker.amps}A` : ""}
                </text>
                <text
                  x={geometry.x + geometry.w / 2}
                  y={geometry.y + geometry.h - (breaker ? 7 : 8)}
                  textAnchor="middle"
                  fontSize="6.5"
                  fill={breaker ? "oklch(0.52 0.14 142)" : "#b0ada8"}
                  pointerEvents="none"
                >
                  {breaker ? "3-POLE" : "TAP TO ASSIGN"}
                </text>
                <title>{`${geometry.zone}: ${slot.label}, circuits ${slot.circuitNumbers}`}</title>
              </g>
            );
          })}

          <rect x="14" y={bottomY} width="292" height={872 - bottomY + 14} fill="#c8c5bf" />
          <rect x="30" y={bottomY + 12} width="260" height="18" fill="#9a9590" rx="2" />
          <text x="160" y={bottomY + 24} textAnchor="middle" fontSize="8" fill="white" fontWeight="600">
            NEUTRAL BAR
          </text>
          <rect x="30" y={bottomY + 36} width="260" height="18" fill="#7a7770" rx="2" />
          <text x="160" y={bottomY + 48} textAnchor="middle" fontSize="8" fill="white" fontWeight="600">
            GROUND BAR
          </text>
          <text x="160" y={bottomY + 88} textAnchor="middle" fontSize="9" fill="#6b6560">
            32.0 in W x 90 in H x 12.75 in D
          </text>
          <text x="160" y={bottomY + 103} textAnchor="middle" fontSize="8" fill="#8a8680">
            {data.selectedFrame.catalogNumber}
          </text>
          <circle cx="22" cy="22" r="3" fill="#b0ada8" />
          <circle cx="298" cy="22" r="3" fill="#b0ada8" />
          <circle cx="22" cy="878" r="3" fill="#b0ada8" />
          <circle cx="298" cy="878" r="3" fill="#b0ada8" />
        </svg>
      </div>
    </section>
  );
}
