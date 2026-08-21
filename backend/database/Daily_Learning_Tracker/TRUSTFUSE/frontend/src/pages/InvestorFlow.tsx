import type { Evidence, Page } from "../App";

const MODALITIES = [
  {
    page: "upload-video" as Page,
    key: "hasVideo" as keyof Evidence,
    color: "#EA580C",
    bg: "#FFF7ED",
    border: "#FED7AA",
    doneBorder: "#16A34A",
    iconBg: "#FFEDD5",
    darkText: "#7C2D12",
    label: "Video / Audio",
    desc: "Upload a promotional video, voice note, or audio clip you received about an investment offer.",
    examples: ["WhatsApp video forward", "Celebrity endorsement video", "Voice message / audio clip"],
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="2" y="7" width="19" height="18" rx="2.5" stroke="#EA580C" strokeWidth="2"/>
        <path d="M21 13l9-4v14l-9-4V13z" stroke="#EA580C" strokeWidth="2" strokeLinejoin="round"/>
        <circle cx="11" cy="16" r="3" fill="#EA580C" fillOpacity="0.18" stroke="#EA580C" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    page: "upload-text" as Page,
    key: "hasText" as keyof Evidence,
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#C4B5FD",
    doneBorder: "#16A34A",
    iconBg: "#EDE9FE",
    darkText: "#3B0764",
    label: "Chat / Text",
    desc: "Paste a message, email, or SMS you received — or upload a screenshot of the conversation.",
    examples: ["WhatsApp / Telegram message", "Email offer or SMS", "Screenshot of a chat"],
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M4 4h24v19H18l-5 5v-5H4V4z" stroke="#7C3AED" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M10 13h12M10 18h7" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    page: "upload-url" as Page,
    key: "hasUrl" as keyof Evidence,
    color: "#1D4ED8",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    doneBorder: "#16A34A",
    iconBg: "#DBEAFE",
    darkText: "#1E3A8A",
    label: "URL / App",
    desc: "Share a website link, trading app name, advisor details, or SEBI registration number.",
    examples: ["Investment website URL", "Trading app name or download link", "Advisor / company name & reg. number"],
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="12" stroke="#1D4ED8" strokeWidth="2"/>
        <path d="M4 16h24" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round"/>
        <path d="M16 4C12 8 11 13 11 16s1 8 5 12" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round"/>
        <path d="M16 4C20 8 21 13 21 16s-1 8-5 12" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function InvestorFlow({ evidence, onNavigate }: { evidence: Evidence; onNavigate: (p: Page) => void }) {
  const filled = MODALITIES.filter((m) => evidence[m.key]).length;

  return (
    <main>
      {/* ── USER / INVESTOR HERO ─────────────────────────── */}
      <section style={{ background: "linear-gradient(160deg,#0E2A52 0%,#163561 70%,#1A4070 100%)" }} className="py-14 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          {/* Node */}
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl mb-8"
            style={{ backgroundColor: "#DBEAFE", border: "1.5px solid #93C5FD" }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="7.5" r="4" stroke="#1E40AF" strokeWidth="1.7"/>
              <path d="M3 19c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="#1E40AF" strokeWidth="1.7" strokeLinecap="round"/>
            </svg>
            <span className="font-semibold text-base" style={{ color: "#1E40AF" }}>USER / INVESTOR</span>
          </div>

          <h1 className="font-display text-3xl lg:text-4xl font-semibold text-white leading-tight mb-4">
            What evidence do you have about this offer?
          </h1>
          <p style={{ color: "#A8BDD4" }} className="text-base leading-relaxed mb-8 max-w-xl mx-auto">
            Select the type of evidence you received. Tap each one to add your evidence. You can submit one, two, or all three — the more you share, the sharper the analysis.
          </p>

          {/* Dashed arrow */}
          <div className="flex justify-center">
            <svg width="2" height="32" viewBox="0 0 2 32">
              <line x1="1" y1="0" x2="1" y2="32" stroke="#4FD1C5" strokeWidth="1.8" strokeDasharray="5 4"/>
            </svg>
          </div>
        </div>
      </section>

      {/* ── THREE MODALITY CARDS ─────────────────────────── */}
      <section className="py-10" style={{ backgroundColor: "#F2F5FA" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            {MODALITIES.map((m) => {
              const done = !!evidence[m.key];
              return (
                <button
                  key={m.page}
                  onClick={() => onNavigate(m.page)}
                  className="relative text-left rounded-2xl p-6 transition-all focus:outline-none"
                  style={{
                    backgroundColor: m.bg,
                    border: `2px solid ${done ? m.doneBorder : m.border}`,
                    boxShadow: done ? "0 0 0 3px rgba(22,163,74,0.12)" : "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.10)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = done ? "0 0 0 3px rgba(22,163,74,0.12)" : "0 2px 8px rgba(0,0,0,0.04)"; }}
                >
                  {done && (
                    <div className="absolute top-4 right-4">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "#16A34A" }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  )}

                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: m.iconBg }}>
                    {m.icon}
                  </div>

                  <h2 className="font-display text-xl font-semibold mb-2" style={{ color: m.darkText }}>{m.label}</h2>
                  <p className="text-sm leading-relaxed mb-4 text-slate-600">{m.desc}</p>

                  <ul className="space-y-1.5 mb-5">
                    {m.examples.map((ex) => (
                      <li key={ex} className="flex items-center gap-2 text-xs" style={{ color: m.color }}>
                        <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
                        {ex}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: done ? "#16A34A" : m.color }}>
                    {done ? (
                      <><span style={{ color: "#16A34A" }}>✓</span> Saved · Tap to edit</>
                    ) : (
                      <><span style={{ color: m.color }}>+</span> Add {m.label} evidence</>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Progress + Analyze */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-5 flex flex-col sm:flex-row items-center gap-5 justify-between">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex gap-1.5">
                {MODALITIES.map((m) => (
                  <div key={m.page} className="w-10 h-2 rounded-full transition-all"
                    style={{ backgroundColor: evidence[m.key] ? "#16A34A" : "#E2E8F0" }} />
                ))}
              </div>
              <p className="text-sm text-slate-600">
                {filled === 0
                  ? "No evidence submitted yet — tap a card above to begin"
                  : `${filled} of 3 type${filled > 1 ? "s" : ""} submitted`}
              </p>
            </div>

            <button
              onClick={() => onNavigate("result")}
              disabled={filled === 0}
              className="px-8 py-3.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap"
              style={{
                backgroundColor: filled > 0 ? "#0E2A52" : "#E2E8F0",
                color: filled > 0 ? "white" : "#9CA3AF",
                cursor: filled > 0 ? "pointer" : "not-allowed",
              }}
              onMouseEnter={(e) => { if (filled > 0) e.currentTarget.style.backgroundColor = "#163561"; }}
              onMouseLeave={(e) => { if (filled > 0) e.currentTarget.style.backgroundColor = "#0E2A52"; }}>
              {filled === 0 ? "Add evidence first" : "Analyze Evidence →"}
            </button>
          </div>

          {filled > 0 && filled < 3 && (
            <p className="text-center text-xs text-slate-400 mt-3">
              You can add more evidence types for a more complete analysis — or analyze now with what you have.
            </p>
          )}
        </div>
      </section>

      {/* Trust strip */}
      <div style={{ backgroundColor: "#0E2A52" }} className="py-4">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {["🛡️ No login required", "⚖️ Aligned with SEBI goals", "🔒 No data stored without consent"].map((t) => (
              <span key={t} className="text-sm" style={{ color: "#8DA0B8" }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
