"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { requestPricingAction } from "@/lib/actions";
import type { SlotSelection } from "@/lib/configurator-types";
import { Button } from "@/components/ui/button";

export function RequestPricingButton({
  frameId,
  selections,
}: {
  frameId: string;
  selections: SlotSelection;
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const requestPricing = () => {
    setMessage("");
    startTransition(async () => {
      const result = await requestPricingAction({ frameId, selections });
      setMessage(result.message);
      setSent(result.ok);
    });
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        className="w-full"
        disabled={isPending || sent}
        onClick={requestPricing}
      >
        <Send className="size-4" />
        {sent ? "Pricing requested" : isPending ? "Sending request..." : "Request pricing"}
      </Button>
      {message ? (
        <p
          className={`text-center text-xs font-semibold ${
            sent ? "text-[var(--green)]" : "text-danger"
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
