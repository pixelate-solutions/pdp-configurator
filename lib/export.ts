"use client";

function triggerDownload(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function downloadTextFile(filename: string, mime: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  triggerDownload(url, filename);
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export function downloadJsonFile(filename: string, value: unknown) {
  downloadTextFile(filename, "application/json", JSON.stringify(value, null, 2));
}

function csvEscape(value: string | number) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function downloadCsvFile(filename: string, rows: (string | number)[][]) {
  const content = rows.map((row) => row.map(csvEscape).join(",")).join("\r\n");
  downloadTextFile(filename, "text/csv", content);
}

export function safeFilename(name: string) {
  return name.trim().replace(/[^a-z0-9_.-]+/gi, "-").replace(/^-+|-+$/g, "") || "configuration";
}

export async function downloadSvgAsPng(
  sourceSvg: SVGSVGElement,
  filename: string,
  exportWidth: number,
  exportHeight: number,
) {
  const svg = sourceSvg.cloneNode(true) as SVGSVGElement;
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("width", String(exportWidth));
  svg.setAttribute("height", String(exportHeight));

  const serialized = new XMLSerializer().serializeToString(svg);
  const svgUrl = URL.createObjectURL(
    new Blob([serialized], { type: "image/svg+xml;charset=utf-8" }),
  );

  try {
    const image = new Image();
    image.decoding = "async";
    image.src = svgUrl;
    await image.decode();

    const canvas = document.createElement("canvas");
    canvas.width = exportWidth;
    canvas.height = exportHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable.");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, exportWidth, exportHeight);
    context.drawImage(image, 0, 0, exportWidth, exportHeight);

    const png = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("PNG generation failed."));
      }, "image/png");
    });

    const pngUrl = URL.createObjectURL(png);
    triggerDownload(pngUrl, filename);
    window.setTimeout(() => URL.revokeObjectURL(pngUrl), 1_000);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

export function readJsonFile<T>(file: File): Promise<T> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(String(reader.result)) as T);
      } catch {
        reject(new Error("The file is not valid JSON."));
      }
    };
    reader.onerror = () => reject(new Error("The file could not be read."));
    reader.readAsText(file);
  });
}
