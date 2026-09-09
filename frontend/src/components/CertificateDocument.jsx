import React from "react";

/**
 * Renders a single certificate as a full, official-looking document —
 * shop, owner, every inspected instrument, verification result, QR, and
 * tamper-check status. Used both on the shop owner's "Certificates" tab
 * and on the public /verify page when someone scans a certificate QR.
 *
 * Props:
 *  - certificate: the Certificate object from the API. Expected shape:
 *      {
 *        certificateId, issueDate, validUntil, status,
 *        shop: { shopName, licenseNumber, address, city, state, pincode,
 *                owner: { name } },
 *        instruments: [{ instrumentType, manufacturer, modelNumber,
 *                        capacity, serialNumber, verificationStatus }],
 *        issuedBy: { name },
 *        qrCode,               // data URL, generated server-side
 *      }
 *    (shop.owner must be populated server-side — see certificateController.js
 *     and verifyController.js)
 *  - currentlyValid: boolean|undefined — whether the cert is still in date
 *      and active. If omitted, it's derived from status + validUntil.
 *  - integrityVerified: boolean|undefined — tamper-check result. Only
 *      rendered when explicitly passed (e.g. from the /verify endpoint).
 *  - showActions: boolean (default true) — show the print/copy-link bar.
 */
export default function CertificateDocument({
  certificate,
  currentlyValid,
  integrityVerified,
  showActions = true,
}) {
  if (!certificate) return null;

  const shop = certificate.shop || {};
  const owner = shop.owner || {};
  const instruments = certificate.instruments || [];

  const isValid =
    currentlyValid ??
    (certificate.status === "active" && new Date(certificate.validUntil) > new Date());

  const verifyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verify/certificate/${certificate.certificateId}`
      : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(verifyUrl);
    } catch {
      // clipboard API unavailable — silently ignore, the link is visible on the page
    }
  };

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
      : "—";

  const resultLabel = (status) => {
    if (status === "verified") return { text: "Found Correct", cls: "text-ok" };
    if (status === "rejected") return { text: "Found Incorrect", cls: "text-danger" };
    if (status === "expired") return { text: "Verification Expired", cls: "text-warn" };
    return { text: "Pending", cls: "text-ink/60" };
  };

  return (
    <div>
      <div
        id={`certificate-${certificate.certificateId}`}
        className="relative bg-white p-1 print:p-0"
      >
        {/* outer + inner border, certificate-style double frame */}
        <div className="border-2 border-brass p-1">
          <div className="border border-brass/50 px-8 py-8 sm:px-12 sm:py-10 relative overflow-hidden">
            {/* faint watermark, purely decorative */}
            <div
              aria-hidden="true"
              className="pointer-events-none select-none absolute inset-0 flex items-center justify-center"
            >
              <span className="text-[11rem] font-serif font-bold text-ink/[0.03] rotate-[-18deg] whitespace-nowrap">
                MAANDRISHTI
              </span>
            </div>

            <div className="relative">
              {/* header */}
              <div className="flex items-start justify-between gap-6 border-b border-line pb-5 mb-6">
                <div>
                  <p className="text-xs tracking-wide text-ink/60 uppercase">Government of India</p>
                  <p className="text-sm text-ink/80">Ministry of Consumer Affairs, Food &amp; Public Distribution</p>
                  <p className="text-sm font-medium text-inkdeep">Department of Consumer Affairs</p>
                </div>
                <div className="text-right">
                  <p className="font-serif text-lg text-brass leading-none">MaanDrishti</p>
                  <p className="text-[11px] text-ink/50 leading-tight mt-1">
                    Transparent Measurement
                    <br />
                    for a Fair India
                  </p>
                </div>
              </div>

              {/* title */}
              <div className="text-center mb-8">
                <h2 className="font-serif text-2xl sm:text-3xl text-inkdeep tracking-wide">
                  VERIFICATION CERTIFICATE
                </h2>
                <p className="text-sm text-ink/70 mt-1">
                  Legal Metrology Verification of Weighing &amp; Measuring Instrument
                  {instruments.length > 1 ? "s" : ""}
                </p>
                <p className="text-xs text-ink/50 italic mt-1">
                  Issued under the Legal Metrology Act, 2009 and Rules made thereunder
                </p>
              </div>

              {/* body: details + QR/status */}
              <div className="grid sm:grid-cols-[1fr_auto] gap-10">
                <div>
                  <dl className="text-sm space-y-2">
                    <Row label="Certificate No." value={certificate.certificateId} mono />
                    <Row label="Date of Issue" value={fmtDate(certificate.issueDate)} />
                    <Row label="Valid Till" value={fmtDate(certificate.validUntil)} />
                    <Row label="Name of Owner" value={owner.name || "—"} />
                    <Row label="Name of Establishment" value={shop.shopName || "—"} />
                    {shop.licenseNumber && <Row label="License No." value={shop.licenseNumber} />}
                    <Row
                      label="Address"
                      value={[shop.address, shop.city, shop.state && shop.pincode ? `${shop.state} – ${shop.pincode}` : shop.state]
                        .filter(Boolean)
                        .join(", ")}
                    />
                  </dl>

                  <div className="border-t border-line mt-5 pt-5 space-y-5">
                    {instruments.length === 0 && (
                      <p className="text-sm text-ink/50">No instruments recorded on this certificate.</p>
                    )}
                    {instruments.map((inst, idx) => {
                      const result = resultLabel(inst.verificationStatus);
                      return (
                        <dl key={inst._id || idx} className="text-sm space-y-2">
                          {instruments.length > 1 && (
                            <p className="text-xs font-medium text-ink/50 uppercase tracking-wide mb-1">
                              Instrument {idx + 1}
                            </p>
                          )}
                          <Row label="Instrument Type" value={inst.instrumentType || "—"} />
                          <Row
                            label="Make / Model"
                            value={[inst.manufacturer, inst.modelNumber].filter(Boolean).join(" / ") || "—"}
                          />
                          <Row label="Capacity" value={inst.capacity || "—"} />
                          <Row label="Serial No." value={inst.serialNumber || "—"} mono />
                          <Row
                            label="Verification Result"
                            value={<span className={`font-semibold ${result.cls}`}>{result.text}</span>}
                          />
                        </dl>
                      );
                    })}
                  </div>
                </div>

                {/* right column: QR + seals */}
                <div className="flex flex-col items-center gap-4 sm:w-48">
                  {certificate.qrCode && (
                    <div className="text-center">
                      <img
                        src={certificate.qrCode}
                        alt="Scan to verify this certificate"
                        className="w-32 h-32 border border-line p-1 bg-white"
                      />
                      <p className="text-[11px] text-ink/50 mt-1 leading-tight">
                        Scan to verify
                        <br />
                        on MaanDrishti Portal
                      </p>
                    </div>
                  )}

                  <span className={isValid ? "seal-compliant" : "seal-noncompliant"}>
                    {isValid ? "VERIFIED · FIT FOR USE" : "NOT CURRENTLY VALID"}
                  </span>

                  {integrityVerified !== undefined && (
                    <p className="text-[11px] text-center">
                      Tamper check:{" "}
                      {integrityVerified ? (
                        <span className="text-ok font-medium">passed</span>
                      ) : (
                        <span className="text-danger font-medium">FAILED</span>
                      )}
                    </p>
                  )}

                  <div className="w-24 h-24 rounded-full border-2 border-double border-brass/70 flex items-center justify-center text-center p-2">
                    <span className="text-[9px] leading-tight text-brass font-medium uppercase tracking-wide">
                      Dept. of Legal Metrology
                    </span>
                  </div>
                </div>
              </div>

              {/* footer notes + signature */}
              <div className="grid sm:grid-cols-[1fr_auto] gap-6 border-t border-line mt-8 pt-6 items-end">
                <div className="text-[11px] text-ink/50 space-y-1">
                  <p className="font-medium text-ink/70 mb-1">Note:</p>
                  <p>1. This certificate is valid only for the instrument(s) listed above.</p>
                  <p>2. Any tampering, alteration or misuse of this certificate is punishable under the Legal Metrology Act, 2009.</p>
                  <p className="break-all">3. Authenticity of this certificate can be verified at {verifyUrl}</p>
                </div>
                <div className="text-center min-w-[10rem]">
                  <p className="font-serif italic text-lg text-inkdeep">{certificate.issuedBy?.name || "—"}</p>
                  <p className="border-t border-ink/40 mt-1 pt-1 text-xs text-ink/70">Inspector of Legal Metrology</p>
                  <p className="text-[11px] text-ink/50">(Authorised Signatory)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showActions && (
        <div className="flex items-center gap-3 mt-3 print:hidden">
          <button className="btn-outline !py-1.5 text-xs" onClick={() => window.print()}>
            Print / Save as PDF
          </button>
          <button className="btn-outline !py-1.5 text-xs" onClick={copyLink}>
            Copy verification link
          </button>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, mono = false }) {
  return (
    <div className="flex gap-3">
      <dt className="w-40 shrink-0 text-ink/60">{label}</dt>
      <dd className={`flex-1 text-inkdeep ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}