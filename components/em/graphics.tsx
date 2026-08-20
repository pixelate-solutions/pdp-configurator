"use client";

import type { PduSelections } from "@/lib/em/pdu";
import { PDU_BRANCH_FRAME_AMPS, PDU_FIXED_SPECS } from "@/lib/em/pdu";
import type { RppBreakerAmp, RppSelections } from "@/lib/em/rpp";
import { RPP_BREAKER_AMPS, rppTotalPoles } from "@/lib/em/rpp";
import type { ControlSelections, WeldSelections } from "@/lib/em/pdp";
import {
  CONTROL_FRAME_CONFIG,
  PDP_VOLTAGE_LABELS,
  WELD_BRANCH_AMP_VALUES,
  controlLargeOption,
  weldMaxBreakers,
} from "@/lib/em/pdp";

const STEEL = "#d7dade";
const STEEL_DARK = "#b8bcc2";
const STEEL_LIGHT = "#eceef0";
const BREAKER_BODY = "#2c2d33";
const BLANK = "#c6c9cd";
const BRAND = "#005daa";
const ORANGE = "#e29024";

function Breaker({
  x,
  y,
  width,
  height,
  label,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}) {
  const toggleWidth = Math.min(10, width * 0.28);
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={2} fill={BREAKER_BODY} />
      <rect
        x={x + width / 2 - toggleWidth / 2}
        y={y + height * 0.22}
        width={toggleWidth}
        height={height * 0.34}
        rx={2}
        fill="#f4f4f4"
      />
      {label ? (
        <text
          x={x + width / 2}
          y={y + height * 0.85}
          textAnchor="middle"
          fontSize={Math.min(9, width * 0.32)}
          fontWeight={700}
          fill="#f4f4f4"
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}

function BlankCover({ x, y, width, height }: { x: number; y: number; width: number; height: number }) {
  return <rect x={x} y={y} width={width} height={height} rx={2} fill={BLANK} stroke={STEEL_DARK} />;
}

function Cabinet({
  x,
  y,
  width,
  height,
  children,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  children: React.ReactNode;
}) {
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={4} fill={STEEL} stroke={STEEL_DARK} strokeWidth={2} />
      <rect x={x + 8} y={y + 8} width={width - 16} height={height - 16} rx={2} fill={STEEL_LIGHT} stroke={STEEL_DARK} />
      {children}
    </g>
  );
}

// ---------------------------------------------------------------------------
// PDU
// ---------------------------------------------------------------------------

export const PDU_IMAGE_SIZE = { width: 1280, height: 840 };

export function PduGraphic({
  sel,
  svgRef,
}: {
  sel: PduSelections;
  svgRef?: React.RefObject<SVGSVGElement | null>;
}) {
  const specs = PDU_FIXED_SPECS[sel.kva];
  const branches: { amps: number }[] = [
    ...Array.from({ length: sel.branch1Qty }, () => ({ amps: PDU_BRANCH_FRAME_AMPS[sel.branch1Frame] })),
    ...Array.from({ length: sel.branch2Qty }, () => ({ amps: PDU_BRANCH_FRAME_AMPS[sel.branch2Frame] })),
  ];

  const perColumn = 8;
  const columns = Math.max(1, Math.ceil(branches.length / perColumn));
  const distWidth = Math.max(150, columns * 78 + 30);

  const width = 430 + distWidth;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} 420`}
      className="h-auto w-full"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="PDU front view"
    >
      <rect width={width} height={420} fill="#ffffff" />
      <rect x={20} y={392} width={width - 40} height={10} fill={STEEL_DARK} />

      {/* Main breaker bay */}
      <Cabinet x={20} y={30} width={150} height={362}>
        <text x={95} y={56} textAnchor="middle" fontSize={12} fontWeight={700} fill={BRAND}>
          MAIN
        </text>
        <rect x={45} y={80} width={100} height={130} rx={4} fill={BREAKER_BODY} />
        <text x={95} y={140} textAnchor="middle" fontSize={15} fontWeight={700} fill="#fff">
          {specs.mainBreakerAmps} A
        </text>
        <text x={95} y={158} textAnchor="middle" fontSize={8} fill="#c9ced6">
          SIEMENS 3WA
        </text>
        {sel.disconnect === "MD" ? (
          <g>
            <rect x={140} y={236} width={14} height={64} rx={4} fill="#1c1d21" />
            <rect x={143} y={242} width={8} height={26} rx={3} fill="#e04c4c" />
          </g>
        ) : null}
        <rect x={45} y={318} width={100} height={26} rx={3} fill={ORANGE} />
        <text x={95} y={335} textAnchor="middle" fontSize={10} fontWeight={700} fill="#1c1d21">
          480 VAC
        </text>
      </Cabinet>

      {/* Transformer bay */}
      <Cabinet x={180} y={30} width={190} height={362}>
        <text x={275} y={56} textAnchor="middle" fontSize={12} fontWeight={700} fill={BRAND}>
          TRANSFORMER
        </text>
        {Array.from({ length: 9 }).map((_, index) => (
          <rect key={index} x={210} y={84 + index * 24} width={130} height={10} rx={2} fill={STEEL_DARK} />
        ))}
        <rect x={210} y={310} width={130} height={40} rx={3} fill="#ffffff" stroke={STEEL_DARK} />
        <text x={275} y={328} textAnchor="middle" fontSize={11} fontWeight={700} fill={BREAKER_BODY}>
          {sel.kva} kVA
        </text>
        <text x={275} y={342} textAnchor="middle" fontSize={8} fill="#5b6068">
          {sel.outputVoltage} V OUT
        </text>
      </Cabinet>

      {/* Distribution bay */}
      <Cabinet x={380} y={30} width={distWidth + 30} height={362}>
        <text x={395 + distWidth / 2} y={56} textAnchor="middle" fontSize={12} fontWeight={700} fill={BRAND}>
          DISTRIBUTION
        </text>
        {branches.map((branch, index) => {
          const column = Math.floor(index / perColumn);
          const row = index % perColumn;
          return (
            <Breaker
              key={index}
              x={402 + column * 78}
              y={74 + row * 38}
              width={66}
              height={32}
              label={`${branch.amps}A`}
            />
          );
        })}
        {branches.length === 0 ? (
          <BlankCover x={402} y={74} width={distWidth - 14} height={300} />
        ) : null}
      </Cabinet>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// RPP
// ---------------------------------------------------------------------------

export const RPP_IMAGE_SIZE = { width: 760, height: 1000 };

export function RppGraphic({
  sel,
  svgRef,
}: {
  sel: RppSelections;
  svgRef?: React.RefObject<SVGSVGElement | null>;
}) {
  const groups = RPP_BREAKER_AMPS.filter((amp) => sel.breakerCounts[amp] > 0);
  const totalPoles = rppTotalPoles(sel);
  const panelTop = 130;
  const panelBottom = sel.transformer === "TR1" ? 350 : 430;
  const panelHeight = panelBottom - panelTop;

  const groupLayouts: { amp: RppBreakerAmp; count: number; y: number; height: number }[] = [];
  for (const amp of groups) {
    const count = sel.breakerCounts[amp];
    const height = Math.max(26, (count / Math.max(totalPoles, 1)) * (panelHeight - 8));
    const y = groupLayouts.length
      ? groupLayouts[groupLayouts.length - 1].y + groupLayouts[groupLayouts.length - 1].height + 4
      : panelTop;
    groupLayouts.push({ amp, count, y, height });
  }

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 304 500"
      className="mx-auto h-auto w-full max-w-[300px]"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="RPP front view"
    >
      <rect width={304} height={500} fill="#ffffff" />
      <rect x={30} y={472} width={244} height={10} fill={STEEL_DARK} />
      <Cabinet x={30} y={20} width={244} height={452}>
        <text x={152} y={48} textAnchor="middle" fontSize={13} fontWeight={700} fill={BRAND}>
          {sel.kva} kVA
        </text>
        {/* Main section */}
        <rect x={92} y={62} width={120} height={46} rx={3} fill={BREAKER_BODY} />
        <text x={152} y={89} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff">
          MAIN
        </text>
        {sel.disconnect === "MD" ? (
          <g>
            <rect x={247} y={62} width={12} height={52} rx={4} fill="#1c1d21" />
            <rect x={250} y={68} width={6} height={20} rx={2} fill="#e04c4c" />
          </g>
        ) : null}

        {/* Branch groups */}
        {groupLayouts.map(({ amp, count, y, height }) => {
          const rows = Math.min(count, Math.max(2, Math.floor(height / 12)));
          return (
            <g key={amp}>
              <rect x={54} y={y} width={150} height={height} rx={3} fill={BREAKER_BODY} />
              {Array.from({ length: rows }).map((_, index) => (
                <rect
                  key={index}
                  x={120}
                  y={y + 4 + index * ((height - 8) / rows)}
                  width={18}
                  height={Math.max(4, (height - 8) / rows - 3)}
                  rx={1}
                  fill="#f4f4f4"
                />
              ))}
              <text
                x={222}
                y={y + height / 2 + 4}
                textAnchor="start"
                fontSize={10}
                fontWeight={700}
                fill={BREAKER_BODY}
              >
                {count} × {amp}A
              </text>
            </g>
          );
        })}
        {groups.length === 0 ? <BlankCover x={54} y={panelTop} width={196} height={panelHeight} /> : null}

        {/* Transformer section */}
        {sel.transformer === "TR1" ? (
          <g>
            <rect x={46} y={366} width={212} height={92} rx={3} fill={STEEL} stroke={STEEL_DARK} />
            {Array.from({ length: 4 }).map((_, index) => (
              <rect key={index} x={62} y={378 + index * 16} width={180} height={7} rx={2} fill={STEEL_DARK} />
            ))}
            <text x={152} y={452} textAnchor="middle" fontSize={9} fontWeight={700} fill={BREAKER_BODY}>
              ISOLATION TRANSFORMER
            </text>
          </g>
        ) : null}
      </Cabinet>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Weld PDP
// ---------------------------------------------------------------------------

export const WELD_PDP_IMAGE_SIZE = { width: 880, height: 1160 };

export function WeldPdpGraphic({
  sel,
  svgRef,
}: {
  sel: WeldSelections;
  svgRef?: React.RefObject<SVGSVGElement | null>;
}) {
  const breakers: number[] = [];
  const push = (amp: string, qty: number) => {
    if (amp !== "0" && qty > 0) {
      const amps = WELD_BRANCH_AMP_VALUES[amp as keyof typeof WELD_BRANCH_AMP_VALUES];
      for (let index = 0; index < qty; index += 1) breakers.push(amps);
    }
  };
  push(sel.size1Amp, sel.size1Qty);
  push(sel.size2Amp, sel.size2Qty);
  push(sel.size3Amp, sel.size3Qty);

  const rows = sel.frame === 200 ? [4, 4] : [4, 6, 6];
  const max = weldMaxBreakers(sel.frame);
  const positions = breakers.slice(0, max);

  const rowSlots: (number | null)[][] = [];
  let filled = 0;
  for (const slotCount of rows) {
    rowSlots.push(
      Array.from({ length: slotCount }, (_, slot) => positions[filled + slot] ?? null),
    );
    filled += slotCount;
  }

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 440 580"
      className="mx-auto h-auto w-full max-w-[420px]"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Weld PDP interior view"
    >
      <rect width={440} height={580} fill="#ffffff" />
      {/* plinth */}
      <rect x={48} y={544} width={344} height={18} fill="#8f939a" />
      <Cabinet x={48} y={24} width={344} height={520}>
        {/* nameplate */}
        <rect x={150} y={40} width={140} height={22} rx={2} fill="#ffffff" stroke={BREAKER_BODY} />
        <text x={220} y={55} textAnchor="middle" fontSize={11} fontWeight={700} fill={BREAKER_BODY}>
          WELD PDP
        </text>
        {/* voltage tag */}
        <rect x={168} y={68} width={104} height={16} rx={2} fill={ORANGE} />
        <text x={220} y={80} textAnchor="middle" fontSize={9} fontWeight={700} fill="#1c1d21">
          {PDP_VOLTAGE_LABELS[sel.voltage]}
        </text>

        {/* disconnect handle */}
        <rect x={368} y={200} width={14} height={80} rx={4} fill="#1c1d21" />
        <rect x={371} y={208} width={8} height={30} rx={3} fill="#e04c4c" />

        {/* busbar rows */}
        {rows.map((slotCount, rowIndex) => {
          const rowY = 108 + rowIndex * 142;
          const isFirst = rowIndex === 0;
          const busX = 68;
          const busWidth = isFirst ? 200 : 300;
          const slotWidth = (busWidth - 10) / slotCount;

          return (
            <g key={rowIndex}>
              {/* busbar */}
              {[0, 1, 2].map((bar) => (
                <rect key={bar} x={busX} y={rowY + 100 + bar * 7} width={300} height={4} fill="#b87333" />
              ))}
              {/* main breaker on first row */}
              {isFirst ? (
                <g>
                  <rect x={276} y={rowY} width={92} height={96} rx={3} fill={BREAKER_BODY} />
                  <rect x={306} y={rowY + 20} width={32} height={30} rx={2} fill="#f4f4f4" />
                  <text x={322} y={rowY + 74} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">
                    {sel.frame} A
                  </text>
                </g>
              ) : null}
              {rowSlots[rowIndex].map((amps, slot) => {
                const x = busX + slot * slotWidth;
                return amps ? (
                  <Breaker
                    key={slot}
                    x={x + 2}
                    y={rowY}
                    width={slotWidth - 6}
                    height={96}
                    label={`${amps}A`}
                  />
                ) : (
                  <BlankCover key={slot} x={x + 2} y={rowY} width={slotWidth - 6} height={96} />
                );
              })}
            </g>
          );
        })}
      </Cabinet>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Control PDP
// ---------------------------------------------------------------------------

export const CONTROL_PDP_IMAGE_SIZE = { width: 880, height: 800 };

export function ControlPdpGraphic({
  sel,
  svgRef,
}: {
  sel: ControlSelections;
  svgRef?: React.RefObject<SVGSVGElement | null>;
}) {
  const config = CONTROL_FRAME_CONFIG[sel.frame];
  const largeOption = controlLargeOption(sel);
  const perRow = config.positions <= 8 ? 4 : 8;
  const rowCount = Math.ceil(config.positions / perRow);
  const gridWidth = 250;
  const slotWidth = gridWidth / perRow;

  const slots: ("small" | "large" | "empty")[] = [];
  for (let index = 0; index < config.positions; index += 1) {
    if (index < sel.branch30Qty) slots.push("small");
    else if (index >= config.positions - largeOption.slots) slots.push("large");
    else slots.push("empty");
  }

  const boxHeight = 150 + rowCount * 64 + (sel.e2Code !== "000" || sel.dcCode !== "000" ? 74 : 0);
  const height = boxHeight + (sel.isoTransformer ? 120 : 0) + 60;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 440 ${height}`}
      className="mx-auto h-auto w-full max-w-[420px]"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Control PDP front view"
    >
      <rect width={440} height={height} fill="#ffffff" />
      <Cabinet x={60} y={24} width={320} height={boxHeight}>
        <rect x={155} y={38} width={130} height={20} rx={2} fill="#ffffff" stroke={BREAKER_BODY} />
        <text x={220} y={52} textAnchor="middle" fontSize={10} fontWeight={700} fill={BREAKER_BODY}>
          CONTROL PDP
        </text>
        <rect x={168} y={62} width={104} height={14} rx={2} fill={ORANGE} />
        <text x={220} y={73} textAnchor="middle" fontSize={8} fontWeight={700} fill="#1c1d21">
          {PDP_VOLTAGE_LABELS[sel.voltage]}
        </text>

        {/* main breaker + disconnect */}
        <rect x={80} y={88} width={70} height={52} rx={3} fill={BREAKER_BODY} />
        <text x={115} y={118} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff">
          {sel.frame} A
        </text>
        <rect x={356} y={88} width={12} height={56} rx={4} fill="#1c1d21" />
        <rect x={359} y={94} width={6} height={22} rx={2} fill="#e04c4c" />

        {/* branch grid */}
        {slots.map((slotType, index) => {
          const row = Math.floor(index / perRow);
          const column = index % perRow;
          const x = 80 + column * slotWidth;
          const y = 152 + row * 64;
          if (slotType === "small") {
            return <Breaker key={index} x={x + 2} y={y} width={slotWidth - 6} height={56} label="30A" />;
          }
          if (slotType === "large") {
            return (
              <g key={index}>
                <rect x={x + 1} y={y - 3} width={slotWidth - 4} height={62} rx={2} fill="#3d3f47" />
                <rect
                  x={x + slotWidth / 2 - 5}
                  y={y + 12}
                  width={10}
                  height={20}
                  rx={2}
                  fill="#f4f4f4"
                />
              </g>
            );
          }
          return <BlankCover key={index} x={x + 2} y={y} width={slotWidth - 6} height={56} />;
        })}

        {/* E2 / 24VDC section */}
        {sel.e2Code !== "000" || sel.dcCode !== "000" ? (
          <g>
            {sel.e2Code !== "000" ? (
              <g>
                <rect
                  x={80}
                  y={152 + rowCount * 64 + 8}
                  width={150}
                  height={54}
                  rx={3}
                  fill={STEEL}
                  stroke={STEEL_DARK}
                />
                <text
                  x={155}
                  y={152 + rowCount * 64 + 40}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight={700}
                  fill={BREAKER_BODY}
                >
                  {sel.e2Code.slice(0, 2).replace(/^0/, "")} kVA CONTROL XFMR
                </text>
              </g>
            ) : null}
            {sel.dcCode !== "000" ? (
              <g>
                <rect
                  x={244}
                  y={152 + rowCount * 64 + 8}
                  width={116}
                  height={54}
                  rx={3}
                  fill="#3d3f47"
                />
                <text
                  x={302}
                  y={152 + rowCount * 64 + 40}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight={700}
                  fill="#fff"
                >
                  24 VDC
                </text>
              </g>
            ) : null}
          </g>
        ) : null}
      </Cabinet>

      {/* Isolation transformer below */}
      {sel.isoTransformer ? (
        <g>
          <rect x={100} y={boxHeight + 40} width={240} height={96} rx={4} fill={STEEL} stroke={STEEL_DARK} strokeWidth={2} />
          {Array.from({ length: 4 }).map((_, index) => (
            <rect key={index} x={118} y={boxHeight + 52 + index * 16} width={204} height={7} rx={2} fill={STEEL_DARK} />
          ))}
          <text
            x={220}
            y={boxHeight + 128}
            textAnchor="middle"
            fontSize={10}
            fontWeight={700}
            fill={BREAKER_BODY}
          >
            {config.isoKva} kVA ISOLATION TRANSFORMER
          </text>
        </g>
      ) : null}
    </svg>
  );
}
