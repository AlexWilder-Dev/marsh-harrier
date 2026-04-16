"use client";

import { useEffect, useRef, useState } from "react";

export default function QRGenerator() {
  const [tableNumber, setTableNumber] = useState("");
  const [domain, setDomain] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generated, setGenerated] = useState(false);

  // Use the current origin as the default domain, editable for production
  useEffect(() => {
    setDomain(window.location.origin);
  }, []);

  const url =
    tableNumber && !isNaN(parseInt(tableNumber))
      ? `${domain}/order?table=${tableNumber}`
      : "";

  const generateQR = async () => {
    if (!url || !canvasRef.current) return;
    const QRCode = (await import("qrcode")).default;
    // Cap at container width minus padding (max 400px) so it never overflows
    const maxWidth = Math.min(400, window.innerWidth - 80);
    await QRCode.toCanvas(canvasRef.current, url, {
      width: maxWidth,
      margin: 2,
      color: { dark: "#0C1A10", light: "#F8F3E8" },
    });
    setGenerated(true);
  };

  const download = () => {
    if (!canvasRef.current || !tableNumber) return;
    const link = document.createElement("a");
    link.download = `table-${tableNumber}-qr.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-parchment-dark">
      {/* Header */}
      <header className="bg-forest-deep px-5 py-4 flex items-center justify-between">
        <div>
          <p className="font-sans text-ochre text-[10px] tracking-widest uppercase">
            Staff — QR Codes
          </p>
          <h1 className="font-serif font-light text-parchment-light text-xl">
            Table QR Generator
          </h1>
        </div>
        <a
          href="/admin"
          className="font-sans text-xs tracking-widest uppercase text-parchment-light/40 hover:text-parchment-light transition-colors"
        >
          ← Dashboard
        </a>
      </header>

      <main className="max-w-lg mx-auto px-5 py-10">
        {/* Inputs */}
        <div className="space-y-4 mb-8">
          <div>
            <label
              htmlFor="table"
              className="block font-sans text-[10px] tracking-widest uppercase text-ink/50 mb-2"
            >
              Table Number
            </label>
            <input
              id="table"
              type="number"
              min={1}
              max={99}
              value={tableNumber}
              onChange={(e) => { setTableNumber(e.target.value); setGenerated(false); }}
              className="w-full bg-parchment-light border border-forest-deep/15 text-forest-deep font-sans text-base px-4 py-3 focus:outline-none focus:border-ochre/50 transition-colors"
              placeholder="e.g. 4"
            />
          </div>

          <div>
            <label
              htmlFor="domain"
              className="block font-sans text-[10px] tracking-widest uppercase text-ink/50 mb-2"
            >
              Site Domain
            </label>
            <input
              id="domain"
              type="text"
              value={domain}
              onChange={(e) => { setDomain(e.target.value); setGenerated(false); }}
              className="w-full bg-parchment-light border border-forest-deep/15 text-forest-deep font-sans text-sm px-4 py-3 focus:outline-none focus:border-ochre/50 transition-colors"
              placeholder="https://marshharriercowley.co.uk"
            />
          </div>

          {url && (
            <p className="font-sans text-xs text-ink/40 break-all">
              Will encode: <span className="text-forest-deep">{url}</span>
            </p>
          )}
        </div>

        <button
          onClick={generateQR}
          disabled={!url}
          className="w-full font-sans text-xs tracking-widest uppercase px-6 py-4 bg-forest-deep text-parchment-light hover:bg-forest-rich disabled:opacity-40 transition-colors mb-8"
        >
          Generate QR Code
        </button>

        {/* QR canvas + download */}
        <div
          className={`flex flex-col items-center gap-6 transition-opacity ${generated ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <div className="p-6 bg-parchment-light w-full flex justify-center">
            <canvas ref={canvasRef} className="max-w-full h-auto" />
          </div>

          <div className="text-center">
            <p className="font-sans text-xs tracking-widest uppercase text-ink/50 mb-1">
              Table {tableNumber}
            </p>
            <p className="font-sans text-xs text-ink/30 break-all">{url}</p>
          </div>

          <button
            onClick={download}
            className="font-sans text-xs tracking-widest uppercase px-8 py-4 bg-ochre text-parchment-light hover:bg-ochre-light transition-colors"
          >
            Download PNG
          </button>
        </div>
      </main>
    </div>
  );
}
