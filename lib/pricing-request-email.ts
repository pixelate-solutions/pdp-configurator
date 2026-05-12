import { Buffer } from "node:buffer";
import type { BomSummary, ConfiguratorData } from "@/lib/configurator-types";

function csvEscape(value: string | number) {
  const text = String(value);
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function buildPricingRequestCsv(bom: BomSummary) {
  const rows = [
    ["Item type", "Catalog number", "Description", "Quantity", "Unit price", "Extended price"],
    ...bom.lines.map((line) => [
      line.itemType,
      line.catalogNumber,
      line.description,
      line.quantity,
      line.unitSellPrice,
      line.extendedSellPrice,
    ]),
    [],
    ["Total", "", "", "", "", bom.totalSellPrice],
  ];

  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

function pricingRecipients() {
  return (process.env.PRICING_REQUEST_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

export async function sendPricingRequestEmail({
  data,
  bom,
  requesterEmail,
  configurationId,
}: {
  data: ConfiguratorData;
  bom: BomSummary;
  requesterEmail: string;
  configurationId: string | null;
}) {
  const recipients = pricingRecipients();
  if (recipients.length === 0) {
    return {
      ok: false,
      message: "Add PRICING_REQUEST_EMAILS to choose pricing request recipients.",
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      message: "Add RESEND_API_KEY before sending pricing request emails.",
    };
  }

  const from = process.env.PRICING_REQUEST_FROM_EMAIL;
  if (!from) {
    return {
      ok: false,
      message: "Add PRICING_REQUEST_FROM_EMAIL before sending pricing request emails.",
    };
  }

  const catalogNumber = data.selectedFrame.catalogNumber;
  try {
    const csv = buildPricingRequestCsv(bom);
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject: `Pricing request: ${catalogNumber}`,
        text: [
          `A pricing request was submitted by ${requesterEmail}.`,
          "",
          `Configuration: ${catalogNumber}`,
          `Panel: ${data.selectedFrame.panelType} - ${data.selectedFrame.heightInches} in`,
          `Frame: ${data.selectedFrame.mainBusAmps}A ${data.selectedFrame.systemVoltage}`,
          configurationId
            ? `Saved configuration ID: ${configurationId}`
            : "Saved configuration ID: not stored",
          "",
          "The BOM with pricing is attached as a CSV.",
        ].join("\n"),
        attachments: [
          {
            filename: `${catalogNumber}-pricing-request.csv`,
            content: Buffer.from(csv, "utf8").toString("base64"),
          },
        ],
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      return {
        ok: false,
        message: `Pricing request email failed: ${details || response.statusText}`,
      };
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? `Pricing request email failed: ${error.message}`
          : "Pricing request email failed.",
    };
  }

  return {
    ok: true,
    message: "Pricing request sent.",
  };
}
