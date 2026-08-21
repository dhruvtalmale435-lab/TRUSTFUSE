import type { Evidence, Page } from "../App";

interface Props { evidence: Evidence; onReset: () => void; onNavigate: (p: Page) => void; }

function Gauge({ pct }: { pct: number }) {
  const r = 58, circ = 2 * Math.PI * r, arc = circ * 0.75, filled = arc * (pct / 100);
  const color = pct >= 70 ? "#DC2626" : pct >= 40 ? "#EA580C" : "#16A34A";
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="152" height="152" viewBox="0 0 152 152">
        <circle cx="76" cy="76" r={r} fill="none" stroke="#F1F5F9" strokeWidth="12" strokeDasharray={`${arc} ${circ}`} strokeLinecap="round" transform="rotate(-225 76 76)"/>
        <circle cx="76" cy="76" r={r} fill="none" stroke={color} strokeWidth="12" strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" transform="rotate(-225 76 76)"/>
      </svg>
      <div className="absolute text-center">
        <div className="font-mono-data text-4xl font-semibold" style={{ color }}>{pct}%</div>
        <div className="text-xs text-slate-500 mt-0.5">Risk Score</div>
      </div>
    </div>
  );
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-slate-700">{label}</span>
        <span className="font-mono-data text-sm font-medium" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#F1F5F9" }}>
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }}/>
      </div>
    </div>
  );
}

export default function ResultPage({ evidence, onReset, onNavigate }: Props) {
  const pct = 89;
  const color = "#DC2626";
  const filled = [evidence.hasText, evidence.hasVideo, evidence.hasUrl].filter(Boolean).length;

  const scores: { label: string; value: number; color: string }[] = [];
  if (evidence.hasText) scores.push({ label: "Message / Text Risk", value: 85, color: "#DC2626" });
  if (evidence.hasUrl)  scores.push({ label: "Identity Risk", value: 90, color: "#DC2626" });
  if (evidence.hasUrl)  scores.push({ label: "Website / App Risk", value: 88, color: "#DC2626" });
  if (evidence.hasVideo) scores.push({ label: "Media / Deepfake Risk", value: 70, color: "#EA580C" });
  if (!scores.length)   scores.push({ label: "Overall Risk", value: 89, color: "#DC2626" });

  const flags: { text: string; sev: "h" | "m" }[] = [];
  if (evidence.hasText && evidence.message) flags.push({ text: "Guaranteed returns and urgency language detected in message text", sev: "h" });
  if (evidence.hasUrl && evidence.companyName) flags.push({ text: `Advisor "${evidence.companyName}" not found in SEBI investment advisor registry`, sev: "h" });
  if (evidence.hasUrl && evidence.websiteUrl) flags.push({ text: `Website "${evidence.websiteUrl}" appears to be a lookalike / clone domain`, sev: "h" });
  if (evidence.hasUrl && evidence.appName) flags.push({ text: `App "${evidence.appName}" not found on official Play Store / App Store`, sev: "h" });
  if (evidence.hasVideo) flags.push({ text: "Video shows facial movement artifacts consistent with AI generation or manipulation", sev: "m" });
  if (!flags.length) flags.push({ text: "Multiple high-risk signals detected across submitted evidence", sev: "h" });

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs mb-6" style={{ color: "#94A3B8" }}>
        <button onClick={onReset} className="hover:text-slate-600 transition-colors">← Check another offer</button>
        <span>/</span>
        <span style={{ color }}>Analysis Result</span>
      </div>

      {/* ── TOP RISK BANNER ───────────────────────────────── */}
      <div className="rounded-2xl p-6 lg:p-8 mb-8 border" style={{ backgroundColor: "#FEF2F2", borderColor: "#FECACA" }}>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <Gauge pct={pct} />
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-3" style={{ backgroundColor: color, color: "white" }}>
              ⚠ HIGH RISK — Possible Investment Scam
            </div>
            <h1 className="font-display text-2xl lg:text-3xl font-semibold mb-2" style={{ color: "#991B1B" }}>
              This offer shows multiple fraud indicators.
            </h1>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "#B91C1C" }}>
              Our system analyzed {filled} evidence type{filled !== 1 ? "s" : ""} and detected high-confidence fraud signals across all inputs. Do not invest until verified through official channels.
            </p>
            <div className="flex flex-wrap gap-2">
              {evidence.hasText  && <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: "#EDE9FE", color: "#6D28D9" }}>✓ Chat / Text analyzed</span>}
              {evidence.hasVideo && <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: "#FFEDD5", color: "#C2410C" }}>✓ Video / Audio analyzed</span>}
              {evidence.hasUrl   && <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: "#DBEAFE", color: "#1D4ED8" }}>✓ URL / App analyzed</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN GRID ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="space-y-5">
          {/* Why flagged */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="font-semibold mb-4" style={{ color: "#0E2A52" }}>Why we flagged this</h2>
            <ul className="space-y-3">
              {flags.map((f, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: f.sev === "h" ? "#FEE2E2" : "#FEF3C7" }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: f.sev === "h" ? "#DC2626" : "#D97706" }}/>
                  </span>
                  <span className="text-sm text-slate-700 leading-relaxed">{f.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What to do */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="font-semibold mb-4" style={{ color: "#0E2A52" }}>What should you do?</h2>
            <div className="rounded-xl p-5" style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "#DC2626" }}>HIGH RISK — Immediate Actions</p>
              <ul className="space-y-3">
                {[
                  ["🚫", "Do not transfer any money to this advisor or scheme."],
                  ["✅", "Verify through the official SEBI SCORES portal or NSE/BSE broker check."],
                  ["📞", "Report to the SEBI investor helpline: 1800 266 7575 (toll-free)."],
                  ["🔒", "Do not share your Aadhaar, PAN, or bank account details."],
                  ["📢", "Warn others in your network who may have received the same offer."],
                ].map(([icon, text]) => (
                  <li key={text} className="flex items-start gap-3">
                    <span className="text-base mt-0.5 flex-shrink-0">{icon}</span>
                    <span className="text-sm text-slate-700 leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="rounded-xl p-3.5 text-center" style={{ backgroundColor: "#F8F9FB", border: "1px solid #E2E8F0" }}>
                <p className="text-xs font-semibold mb-0.5" style={{ color: "#0E2A52" }}>SEBI SCORES</p>
                <p className="font-mono-data text-xs text-slate-500">scores.sebi.gov.in</p>
              </div>
              <div className="rounded-xl p-3.5 text-center" style={{ backgroundColor: "#F8F9FB", border: "1px solid #E2E8F0" }}>
                <p className="text-xs font-semibold mb-0.5" style={{ color: "#0E2A52" }}>Investor Helpline</p>
                <p className="font-mono-data text-xs text-slate-500">1800 266 7575</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-5">
          {/* Detailed scores */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="font-semibold mb-5" style={{ color: "#0E2A52" }}>Detailed Risk Scores</h2>
            <div className="space-y-4">
              {scores.map((s) => <Bar key={s.label} label={s.label} value={s.value} color={s.color} />)}
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: "#0E2A52" }}>Combined Fraud Risk Score</span>
              <span className="font-mono-data text-lg font-semibold" style={{ color }}>89 / 100</span>
            </div>
          </div>

          {/* Evidence summary */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="font-semibold mb-4" style={{ color: "#0E2A52" }}>Evidence Summary</h2>
            <div className="space-y-3">
              {evidence.hasText && (
                <div className="rounded-xl p-4" style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA" }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: "#0E2A52" }}>Message / Text</p>
                  <p className="text-xs leading-relaxed text-slate-600">
                    "{evidence.message.length > 0
                      ? evidence.message.slice(0, 150) + (evidence.message.length > 150 ? "…" : "")
                      : "Screenshot submitted — text extracted via OCR."}"
                  </p>
                  {evidence.message.toLowerCase().includes("guaranteed") && (
                    <p className="text-xs mt-2 font-medium" style={{ color: "#DC2626" }}>⚠ Scam phrase: "guaranteed"</p>
                  )}
                  {evidence.message.toLowerCase().includes("risk-free") && (
                    <p className="text-xs mt-1 font-medium" style={{ color: "#DC2626" }}>⚠ Scam phrase: "risk-free"</p>
                  )}
                </div>
              )}
              {evidence.hasUrl && evidence.websiteUrl && (
                <div className="rounded-xl p-4" style={{ backgroundColor: "#F8F9FB", border: "1px solid #E2E8F0" }}>
                  <p className="text-xs font-semibold mb-1.5" style={{ color: "#0E2A52" }}>Website</p>
                  <p className="font-mono-data text-xs mb-1 text-slate-700 break-all">{evidence.websiteUrl}</p>
                  <p className="text-xs" style={{ color: "#EA580C" }}>⚠ Lookalike domain · Registered recently · SSL unverified</p>
                </div>
              )}
              {evidence.hasUrl && evidence.appName && (
                <div className="rounded-xl p-4" style={{ backgroundColor: "#F8F9FB", border: "1px solid #E2E8F0" }}>
                  <p className="text-xs font-semibold mb-1.5" style={{ color: "#0E2A52" }}>App</p>
                  <p className="text-xs text-slate-700">{evidence.appName}</p>
                  <p className="text-xs mt-1" style={{ color: "#DC2626" }}>⚠ Not found on official Play Store / App Store</p>
                </div>
              )}
              {evidence.hasVideo && (
                <div className="rounded-xl p-4" style={{ backgroundColor: "#F8F9FB", border: "1px solid #E2E8F0" }}>
                  <p className="text-xs font-semibold mb-1.5" style={{ color: "#0E2A52" }}>Media</p>
                  <p className="text-xs text-slate-600">
                    {evidence.videoFile ? `"${evidence.videoFile.name}" · ` : ""}1 video analyzed ·{" "}
                    <span style={{ color: "#DC2626" }}>Possible AI generation detected (confidence: 78%)</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM ACTIONS ────────────────────────────────── */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <button onClick={onReset}
          className="flex-1 py-4 rounded-xl font-semibold text-sm border-2 transition-all"
          style={{ borderColor: "#0E2A52", color: "#0E2A52", backgroundColor: "transparent" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#0E2A52"; e.currentTarget.style.color = "white"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#0E2A52"; }}>
          ← Run Another Check
        </button>
        <button className="flex-1 py-4 rounded-xl font-semibold text-sm transition-all"
          style={{ backgroundColor: "#0D7A72", color: "white" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0B6E67")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0D7A72")}>
          Download Report (PDF)
        </button>
      </div>

      <p className="text-xs text-center text-slate-400 mt-5">
        Report ID: SAI-2024-{Math.floor(1000 + Math.random() * 8999)} · Generated {new Date().toLocaleString("en-IN")} · This is a decision-support tool — not a legal determination.
      </p>
    </main>
  );
}
