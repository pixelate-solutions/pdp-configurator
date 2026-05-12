"use client";

import { useMemo, useState } from "react";
import { SignUpButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Check,
  LockKeyhole,
  Maximize2,
  Minimize2,
  Save,
} from "lucide-react";
import type {
  BreakerOption,
  ConfiguratorData,
  PanelSlot,
  SlotSelection,
} from "@/lib/configurator-types";
import type { SavedConfigurationImportOption } from "@/lib/db/queries";
import type { PricingAccess } from "@/lib/pricing-access";
import {
  buildBom,
  createDefaultSelections,
  getAllowedBreakers,
  validateSelection,
} from "@/lib/bom";
import { maskedPrice } from "@/lib/pricing-access";
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
import { LiveBom } from "@/components/configurator/LiveBom";
import { ConfigurationSummary } from "@/components/configurator/ConfigurationSummary";
import { SaveConfigurationDialog } from "@/components/configurator/SaveConfigurationDialog";
import { RequestPricingButton } from "@/components/configurator/RequestPricingButton";

type ConfiguratorStep = "frame" | "breakers" | "quote";

const stepOrder: ConfiguratorStep[] = ["frame", "breakers", "quote"];
const pendingReviewStorageKey = "pdp-configurator-pending-review";
const defaultPricingAccess: PricingAccess = {
  clerkEnabled: false,
  signedIn: false,
  emailVerified: false,
  email: null,
};

function readPendingReviewSelections(frameId: string, step: ConfiguratorStep) {
  if (step !== "quote" || typeof window === "undefined") return null;

  const stored = window.sessionStorage.getItem(pendingReviewStorageKey);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as {
      frameId?: string;
      selections?: SlotSelection;
    };
    if (parsed.frameId === frameId && parsed.selections) return parsed.selections;
  } catch {
    window.sessionStorage.removeItem(pendingReviewStorageKey);
  }

  return null;
}

function PricingGateActions({
  pricingAccess,
  returnUrl,
  onBeforeAuth,
}: {
  pricingAccess: PricingAccess;
  returnUrl: string;
  onBeforeAuth: () => void;
}) {
  if (!pricingAccess.clerkEnabled) {
    return (
      <p className="text-center text-xs font-semibold text-danger">
        Configure Clerk to enable account creation and pricing requests.
      </p>
    );
  }

  if (!pricingAccess.signedIn) {
    return (
      <div className="grid gap-2 rounded-[1.75rem] border border-primary/18 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(232,244,255,0.84))] p-3 shadow-[0_18px_42px_rgba(26,83,141,0.16)]">
        <SignUpButton
          mode="modal"
          forceRedirectUrl={returnUrl}
          fallbackRedirectUrl={returnUrl}
          signInForceRedirectUrl={returnUrl}
          signInFallbackRedirectUrl={returnUrl}
        >
          <Button
            type="button"
            size="lg"
            className="price-request-cta group min-h-14 w-full rounded-[1.4rem] bg-[linear-gradient(135deg,var(--primary),var(--blue-light))] text-base shadow-[0_16px_34px_rgba(26,83,141,0.34)] hover:shadow-[0_22px_48px_rgba(26,83,141,0.4)]"
            onClick={onBeforeAuth}
          >
            <LockKeyhole className="size-5 transition group-hover:-translate-y-0.5" />
            Create account to request price
          </Button>
        </SignUpButton>
      </div>
    );
  }

  return (
    <div className="space-y-2 text-center">
      <p className="text-xs font-semibold text-muted-foreground">
        Your account is ready. Send this configuration to request pricing.
      </p>
    </div>
  );
}

export function ConfiguratorWorkspace({
  data,
  pricingAccess = defaultPricingAccess,
  savedConfigurations = [],
  initialSelections,
  initialStep = "frame",
  initialFrameSelected = false,
}: {
  data: ConfiguratorData;
  pricingAccess?: PricingAccess;
  savedConfigurations?: SavedConfigurationImportOption[];
  initialSelections?: SlotSelection;
  initialStep?: ConfiguratorStep;
  initialFrameSelected?: boolean;
}) {
  const router = useRouter();
  const [selections, setSelections] = useState<SlotSelection>(
    () =>
      initialSelections ??
      readPendingReviewSelections(data.selectedFrame.id, initialStep) ??
      createDefaultSelections(data),
  );
  const [activeStep, setActiveStep] = useState<ConfiguratorStep>(initialStep);
  const [frameSelected, setFrameSelected] = useState(initialFrameSelected);
  const [breakerStarted, setBreakerStarted] = useState(initialStep === "quote");
  const [walkIndex, setWalkIndex] = useState(0);
  const [invalidSlotId, setInvalidSlotId] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState("");
  const [saveOpen, setSaveOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(true);
  const [completed, setCompleted] = useState(false);

  const bom = useMemo(() => buildBom(data, selections), [data, selections]);
  const canRequestPricing = pricingAccess.signedIn && frameSelected;
  const quoteReturnUrl = `/configurator?frameId=${data.selectedFrame.id}&step=quote`;
  const selectedSlot = data.slots[walkIndex] ?? data.slots[0] ?? null;
  const selectedSlotId = selectedSlot?.id ?? null;
  const selectedBreakerId = selectedSlot
    ? selections[selectedSlot.id] ?? null
    : null;
  const selectedBreaker = selectedBreakerId
    ? data.breakerOptions.find((option) => option.id === selectedBreakerId)
    : null;
  const allowedBreakers = selectedSlot
    ? getAllowedBreakers(data, selectedSlot.id)
    : [];
  const filledCount = data.slots.filter((slot) => selections[slot.id]).length;
  const selectedAmpTotal = data.slots.reduce((sum, slot) => {
    const breakerId = selections[slot.id];
    const breaker = breakerId
      ? data.breakerOptions.find((option) => option.id === breakerId)
      : null;
    return sum + (breaker?.amps ?? 0);
  }, 0);
  const progressPct =
    data.slots.length > 0 ? Math.round((filledCount / data.slots.length) * 100) : 0;
  const projectedAmpTotal = (breaker: BreakerOption | null) => {
    const currentAmps = selectedBreaker?.amps ?? 0;
    return selectedAmpTotal - currentAmps + (breaker?.amps ?? 0);
  };
  const exceedsFrame = (breaker: BreakerOption | null) =>
    projectedAmpTotal(breaker) > data.selectedFrame.mainBusAmps;

  const persistReviewState = () => {
    window.sessionStorage.setItem(
      pendingReviewStorageKey,
      JSON.stringify({
        frameId: data.selectedFrame.id,
        selections,
      }),
    );
  };

  const goToStep = (step: ConfiguratorStep) => {
    setActiveStep(step);
    if (step === "breakers" && !breakerStarted) {
      setBreakerStarted(false);
    }
  };

  const openFrameConfiguration = (frameId: string) => {
    setFrameSelected(true);
    setActiveStep("breakers");
    setBreakerStarted(false);
    setPreviewMode(true);
    setCompleted(false);
    setWalkIndex(0);

    if (frameId === data.selectedFrame.id) {
      setActiveStep("breakers");
      return;
    }

    router.push(`/configurator?frameId=${frameId}&step=breakers`);
  };

  const chooseSlot = (slot: PanelSlot) => {
    const index = data.slots.findIndex((item) => item.id === slot.id);
    if (index >= 0) setWalkIndex(index);
    setBreakerStarted(true);
    setInvalidSlotId(null);
    setValidationMessage("");
    setCompleted(false);
  };

  const walkTo = (index: number) => {
    const nextIndex = Math.max(0, Math.min(index, data.slots.length - 1));
    setWalkIndex(nextIndex);
    setInvalidSlotId(null);
    setValidationMessage("");
    setCompleted(false);
  };

  const chooseBreaker = (breaker: BreakerOption | null, autoAdvance = true) => {
    if (!selectedSlot) return;

    const validation = validateSelection(data, selectedSlot.id, breaker?.id ?? null);
    if (!validation.valid) {
      setInvalidSlotId(selectedSlot.id);
      setValidationMessage(validation.message);
      return;
    }

    if (breaker && exceedsFrame(breaker)) {
      setInvalidSlotId(selectedSlot.id);
      setValidationMessage(
        `This selection would total ${projectedAmpTotal(breaker)}A, above the ${data.selectedFrame.mainBusAmps}A frame limit.`,
      );
      return;
    }

    setSelections((current) => ({
      ...current,
      [selectedSlot.id]: breaker?.id ?? null,
    }));
    setInvalidSlotId(null);
    setValidationMessage("");
    setCompleted(false);

    if (breaker && autoAdvance) {
      window.setTimeout(() => {
        if (walkIndex < data.slots.length - 1) walkTo(walkIndex + 1);
      }, 220);
    }
  };

  const clearAll = () => {
    setClearOpen(true);
  };

  const confirmClearAll = () => {
    setSelections(createDefaultSelections(data));
    setValidationMessage("");
    setInvalidSlotId(null);
    setCompleted(false);
    setClearOpen(false);
  };

  const finishWithCovers = () => {
    setValidationMessage("");
    setInvalidSlotId(null);
    setCompleted(true);
    setPreviewMode(true);
    goToStep("quote");
  };

  const stepIndex = stepOrder.indexOf(activeStep);
  const stepTab = (
    step: ConfiguratorStep,
    label: string,
    mobileLabel: string,
    index: number,
  ) => {
    const currentIndex = stepOrder.indexOf(step);
    const done = currentIndex < stepIndex;
    const active = activeStep === step;

    return (
      <button
        key={step}
        type="button"
        onClick={() => goToStep(step)}
        className={`pressable flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full px-1.5 py-2 text-[11px] transition hover:cursor-pointer sm:gap-2 sm:px-4 sm:py-2.5 sm:text-[13px] ${
          active
            ? "bg-white/14 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]"
            : done
              ? "text-white/70 hover:text-white"
              : "text-white/45 hover:text-white/70"
        }`}
      >
        <span
          className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-semibold sm:size-[22px] sm:text-[11px] ${
            active
              ? "border-white bg-white text-primary"
              : done
                ? "border-[var(--green)] bg-[var(--green)] text-white"
                : "border-current"
          }`}
        >
          {done ? <Check className="size-3" /> : index}
        </span>
        <span className="min-w-0 truncate sm:hidden">{mobileLabel}</span>
        <span className="hidden min-w-0 truncate sm:inline">{label}</span>
      </button>
    );
  };

  return (
    <main className="min-h-screen">
      <nav className="no-print sticky top-14 z-20 flex w-full items-center gap-1 border-b border-white/12 bg-[rgba(20,64,118,0.84)] px-1.5 py-1.5 shadow-[0_10px_28px_rgba(20,64,118,0.18)] backdrop-blur-xl sm:px-6">
        {stepTab("frame", "Select Frame", "Frame", 1)}
        <span className="flex shrink-0 items-center px-0.5 text-sm text-white/20 sm:px-0 sm:text-lg">›</span>
        {stepTab("breakers", "Configure Breakers", "Breakers", 2)}
        <span className="flex shrink-0 items-center px-0.5 text-sm text-white/20 sm:px-0 sm:text-lg">›</span>
        {stepTab("quote", "Review & Quote", "Quote", 3)}
      </nav>

      <div className="mx-auto w-full max-w-[1200px] px-3 py-6 sm:px-6 sm:py-8">
        {activeStep === "frame" ? (
          <section>
            <FrameSelector
              frames={data.frames}
              selectedFrame={data.selectedFrame}
              savedConfigurations={savedConfigurations}
              onSelectFrame={openFrameConfiguration}
            />
          </section>
        ) : null}

        {activeStep === "breakers" && !breakerStarted ? (
          <section className="flex min-h-[60vh] items-center justify-center px-1 py-8">
            <div className="glass-panel scroll-rise grid w-full max-w-[760px] items-center gap-8 rounded-[2rem] p-6 sm:p-10 md:grid-cols-[170px_1fr]">
              <div className="mx-auto rounded-[1.75rem] bg-[#1f2933] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_18px_38px_rgba(24,48,74,0.18)]">
                <svg viewBox="0 0 320 900" className="block h-auto w-[120px]">
                  <rect x="0" y="0" width="320" height="900" fill="#e8e6e2" />
                  <rect x="8" y="8" width="304" height="884" fill="#d4d1cc" />
                  <rect x="14" y="14" width="292" height="872" fill="#f0eeeb" />
                  <rect x="14" y="14" width="292" height="85" fill="#c8c5bf" />
                  <rect x="30" y="99" width="260" height="116" fill="#1e4882" rx="3" />
                  {[241, 279].map((y) =>
                    [18, 163].map((x) => (
                      <rect key={`${x}-${y}`} x={x} y={y} width="139" height="36" fill="#e2e0db" rx="2" stroke="#c8c5bf" />
                    )),
                  )}
                  {Array.from({ length: 8 }).map((_, row) =>
                    [18, 163].map((x) => (
                      <rect key={`${x}-${row}`} x={x} y={333 + row * 50} width="139" height="48" fill="#e2e0db" rx="2" stroke="#c8c5bf" />
                    )),
                  )}
                  <rect x="14" y="733" width="292" height="139" fill="#c8c5bf" />
                </svg>
              </div>
              <div className="text-center md:text-left">
                <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  Ready to configure
                </div>
                <h2 className="text-2xl font-bold leading-tight text-primary">
                  {data.selectedFrame.panelType} · {data.selectedFrame.heightInches} in
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {data.selectedFrame.systemVoltage} · {data.selectedFrame.irRating} ·{" "}
                  {data.selectedFrame.feed} Feed · {data.selectedFrame.mounting} Mount
                </p>
                <p className="mt-4 text-sm text-muted-foreground">
                  {data.slots.length} configurable slots ·{" "}
                  {data.slots.filter((slot) => slot.breakerFamily === "3VA41").length} top 3VA41 +{" "}
                  {data.slots.filter((slot) => slot.breakerFamily === "3VA52").length} lower 3VA52
                </p>
                <Button
                  type="button"
                  className="mt-6 w-full px-8 py-3 text-base sm:w-auto"
                  onClick={() => {
                    setBreakerStarted(true);
                    setPreviewMode(false);
                    setCompleted(false);
                    walkTo(0);
                  }}
                >
                  Get Started →
                </Button>
                <p className="mt-3 text-xs text-muted-foreground">
                  You will be guided through each slot one at a time.
                </p>
              </div>
            </div>
          </section>
        ) : null}

        {activeStep === "breakers" && breakerStarted ? (
          <>
            <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
              <div className="order-2 lg:order-1 lg:sticky lg:top-28 lg:self-start">
                <div className="grid content-start items-start gap-3">
                <div className="liquid-surface rounded-3xl p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                        Slot Progress
                      </div>
                      <div className="mt-0.5 text-sm font-bold">
                        Slot {walkIndex + 1} of {data.slots.length}
                      </div>
                    </div>
                    <div className="min-w-0 sm:text-right">
                      <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                        Frame Load
                      </div>
                      <div className="mt-0.5 text-sm font-bold">
                        {selectedAmpTotal}A / {data.selectedFrame.mainBusAmps}A
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div>
                      <div className="mb-1 flex justify-between text-[10px] font-semibold text-muted-foreground">
                        <span>{filledCount} of {data.slots.length} assigned</span>
                        <span>{progressPct}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-primary/10">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,var(--primary),var(--blue-light),var(--accent))] shadow-[0_0_18px_rgba(43,129,191,0.28)] transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-[10px] font-semibold text-muted-foreground">
                        <span>Load</span>
                        <span>
                          {Math.min(100, Math.round((selectedAmpTotal / data.selectedFrame.mainBusAmps) * 100))}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-primary/10">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,var(--primary),var(--blue-light),var(--accent))] shadow-[0_0_18px_rgba(43,129,191,0.28)] transition-all duration-500"
                          style={{
                            width: `${Math.min(100, Math.round((selectedAmpTotal / data.selectedFrame.mainBusAmps) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="pointer-events-none sticky top-12 z-10 -mb-30 flex justify-end px-6 pt-18">
                    <Button
                      type="button"
                      variant="secondary"
                      className="pointer-events-auto size-11 bg-white/88 p-2 shadow-[0_12px_28px_rgba(24,48,74,0.18)] backdrop-blur"
                      aria-label={previewMode ? "Minimize panel preview" : "Maximize panel preview"}
                      title={previewMode ? "Back to Slot" : "Preview Full Panel"}
                      onClick={() => setPreviewMode((current) => !current)}
                    >
                      {previewMode ? (
                        <Minimize2 className="size-4" />
                      ) : (
                        <Maximize2 className="size-4" />
                      )}
                    </Button>
                  </div>
                  <PanelboardGraphic
                    data={data}
                    selections={selections}
                    selectedSlotId={selectedSlotId}
                    invalidSlotId={invalidSlotId}
                    previewMode={previewMode}
                    completed={completed}
                    onSelectSlot={chooseSlot}
                  />
                </div>
                {completed ? (
                  <div className="glass-panel rounded-[2rem] bg-[rgba(20,64,118,0.9)] p-6 text-center text-white">
                    <h2 className="text-xl font-bold">Configuration Complete</h2>
                    <p className="mt-2 text-sm text-white/75">
                      {filledCount} of {data.slots.length} slots populated ·{" "}
                      {data.slots.length - filledCount} cover plates
                    </p>
                    <Button
                      type="button"
                      className="mt-5 bg-white text-primary hover:bg-white/90"
                      onClick={() => goToStep("quote")}
                    >
                      Review & Quote →
                    </Button>
                  </div>
                ) : null}
                </div>
              </div>

              <aside className="order-1 lg:order-2 lg:sticky lg:top-44 lg:self-start">
              <div className="glass-panel rounded-4xl p-4 text-sm">
                <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                  {selectedSlot?.breakerFamily === "3VA41" ? "Top Zone" : "Lower Zone"}
                </div>
                <div className="mt-1 text-[26px] font-bold leading-none text-primary">
                  Circuit {selectedSlot?.circuitNumbers.split("/")[0]}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {selectedSlot?.breakerFamily} Frame · 3-Pole
                </div>

                <div className="mt-4 mb-2 text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                  Select amperage rating:
                </div>
                {validationMessage ? (
                  <div className="mb-3 rounded border border-orange-200 bg-orange-50 p-2 text-xs font-semibold text-danger">
                    {validationMessage}
                  </div>
                ) : null}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-3">
                  {allowedBreakers.map((breaker) => {
                    const disabled =
                      selectedBreakerId !== breaker.id && exceedsFrame(breaker);
                    return (
                      <button
                        key={breaker.id}
                        type="button"
                        disabled={disabled}
                        className={`pressable cursor-pointer rounded-2xl border-2 px-2 py-3 text-center text-[17px] font-bold transition hover:cursor-pointer hover:border-primary hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 ${
                          selectedBreakerId === breaker.id
                            ? "border-primary bg-[rgba(43,129,191,0.12)] text-primary shadow-[0_10px_24px_rgba(26,83,141,0.12)]"
                            : "border-gray-200 text-foreground"
                        }`}
                        title={
                          disabled
                            ? `Would exceed ${data.selectedFrame.mainBusAmps}A frame limit`
                            : undefined
                        }
                        onClick={() => chooseBreaker(breaker)}
                      >
                        {breaker.amps}A
                        <span className="mt-1 block text-[9px] font-normal text-muted-foreground">
                          3-Pole
                        </span>
                      </button>
                    );
                  })}
                </div>

                {selectedBreaker ? (
                  <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[var(--green)] bg-[var(--green-bg)] p-3 shadow-[0_10px_26px_rgba(22,163,117,0.12)]">
                    <div className="shrink-0 text-[9px] font-bold uppercase tracking-[0.06em] text-[var(--green)]">
                      Selected
                    </div>
                    <div className="flex-1 leading-tight text-[15px] font-bold text-[var(--green)]">
                      <div>{selectedBreaker.amps}A</div>
                      <div className="text-[11px] font-semibold">3-Pole</div>
                    </div>
                    <button
                      type="button"
                      className="pressable cursor-pointer rounded-full border border-danger/30 bg-white px-2 py-1 text-[10px] font-semibold text-danger hover:cursor-pointer hover:bg-danger hover:text-white"
                      onClick={() => chooseBreaker(null, false)}
                    >
                      Clear
                    </button>
                  </div>
                ) : null}

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="min-h-9 text-xs"
                    disabled={walkIndex === 0}
                    onClick={() => walkTo(walkIndex - 1)}
                  >
                    ← Back
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="min-h-9 text-xs"
                    onClick={() => {
                      if (walkIndex < data.slots.length - 1) walkTo(walkIndex + 1);
                      else if (selectedBreaker) {
                        setCompleted(true);
                        setPreviewMode(true);
                      } else {
                        goToStep("quote");
                      }
                    }}
                  >
                    {walkIndex === data.slots.length - 1
                      ? selectedBreaker
                        ? "Finish →"
                        : "Skip & Finish →"
                      : selectedBreaker
                        ? "Next →"
                        : "Skip →"}
                  </Button>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="mt-2 min-h-9 w-full text-xs"
                  onClick={finishWithCovers}
                >
                  Finish with cover plates →
                </Button>

                <div className="mt-4 mb-2 h-2 overflow-hidden rounded-full bg-primary/10">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,var(--primary),var(--blue-light),var(--accent))] shadow-[0_0_18px_rgba(43,129,191,0.28)] transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{filledCount} of {data.slots.length} assigned</span>
                  <span className="font-semibold text-foreground">{progressPct}%</span>
                </div>

                <Button type="button" size="sm" variant="outline" className="mt-2 min-h-9 w-full text-xs text-danger" onClick={clearAll}>
                  Clear all
                </Button>
              </div>
              </aside>
            </section>
          </>
        ) : null}

        {activeStep === "quote" ? (
          <section>
            <h2 className="text-[22px] font-semibold">Configuration Summary</h2>
            <p className="mt-1 mb-7 text-sm text-muted-foreground">
              Review your configuration and request verified pricing.
            </p>
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <div className="glass-panel rounded-[2rem] p-6">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Configuration
                  </div>
                  <div className="mb-5 break-all rounded-2xl border border-white/70 bg-white/58 px-4 py-3 font-mono text-base font-bold tracking-normal text-primary backdrop-blur">
                    {data.selectedFrame.catalogNumber}
                  </div>
                  <div className="mb-5 rounded-[1.75rem] bg-primary p-5 text-center text-white shadow-[0_18px_40px_rgba(26,83,141,0.24)]">
                    <div className="mb-1 text-xs text-white/70">Total Price</div>
                    <div className="select-none text-4xl font-bold tracking-normal blur-[7px]">
                      {maskedPrice}
                    </div>
                    <div className="mt-1 text-[11px] text-white/60">
                      Hidden until your pricing request is reviewed
                    </div>
                  </div>
                  <div className="mb-5 rounded-3xl border border-white/70 bg-white/62 p-4 backdrop-blur">
                    {!frameSelected ? (
                      <div className="space-y-3 text-center">
                        <p className="text-xs font-semibold text-danger">
                          Select a frame size before requesting pricing.
                        </p>
                        <Button
                          type="button"
                          variant="secondary"
                          className="w-full"
                          onClick={() => goToStep("frame")}
                        >
                          Select frame size
                        </Button>
                      </div>
                    ) : canRequestPricing ? (
                      <RequestPricingButton
                        frameId={data.selectedFrame.id}
                        selections={selections}
                      />
                    ) : (
                      <PricingGateActions
                        pricingAccess={pricingAccess}
                        returnUrl={quoteReturnUrl}
                        onBeforeAuth={persistReviewState}
                      />
                    )}
                  </div>
                  <div className="text-xs leading-6 text-muted-foreground">
                    <strong className="text-foreground">
                      {data.selectedFrame.panelType} · {data.selectedFrame.heightInches} in
                    </strong>
                    <br />
                    {filledCount} of {data.slots.length} slots populated ·{" "}
                    {data.slots.length - filledCount} cover plates
                    <br />
                    {data.selectedFrame.systemVoltage} · 65 KAIC · {data.selectedFrame.mainBusAmps}A Main
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 text-sm">
                  <button
                    type="button"
                    className="pressable inline-flex h-10 w-full cursor-pointer items-center justify-center gap-1 rounded-full bg-primary px-3 text-xs font-semibold leading-none text-primary-foreground shadow-sm transition hover:cursor-pointer hover:bg-[var(--blue-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    onClick={() => setSaveOpen(true)}
                  >
                    <Save className="size-3" /> Save
                  </button>
                </div>
              </div>
              <div className="grid gap-5">
                <LiveBom bom={bom} />
                <ConfigurationSummary data={data} />
              </div>
            </div>
          </section>
        ) : null}
      </div>

      <SaveConfigurationDialog
        open={saveOpen}
        onOpenChange={setSaveOpen}
        data={data}
        selections={selections}
      />
      <Dialog open={clearOpen} onOpenChange={setClearOpen}>
        <DialogContent className="max-w-xl rounded-[2rem] bg-white/80 px-6 pb-8 pt-14 text-center sm:px-10">
          <DialogHeader className="mx-auto mb-7 max-w-md pr-0">
            <DialogTitle>Clear breaker selections?</DialogTitle>
            <DialogDescription>
              This will remove every selected breaker. Empty slots will keep
              cover plates in the quote.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="secondary"
              className="min-w-36"
              onClick={() => setClearOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              className="min-w-36"
              onClick={confirmClearAll}
            >
              Clear all
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
