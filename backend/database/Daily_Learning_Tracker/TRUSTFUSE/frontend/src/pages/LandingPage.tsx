import type { Page } from "../App";

/* ── Hero illustration ─────────────────────────────────────────── */
function HeroIllustration() {
  return (
    <div className="relative w-full max-w-[400px] mx-auto select-none">
      {/* Shield */}
      <div className="flex justify-center">
        <svg width="160" height="180" viewBox="0 0 160 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M80 8L16 36V88C16 130 44 166 80 176C116 166 144 130 144 88V36L80 8Z"
            fill="url(#shieldGrad)" stroke="#1E4072" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M80 28L36 48V84C36 116 54 142 80 150C106 142 124 116 124 84V48L80 28Z"
            fill="white" fillOpacity="0.07" stroke="#4FD1C5" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M62 88L74 100L98 74" stroke="#4FD1C5" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
          <defs>
            <linearGradient id="shieldGrad" x1="16" y1="8" x2="144" y2="176" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#163561"/>
              <stop offset="100%" stopColor="#0E2A52"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Floating evidence cards */}
      {/* Message card */}
      <div className="absolute top-4 -left-6 bg-white rounded-2xl shadow-xl p-3.5 flex items-center gap-3" style={{ border: "1px solid #EEF2F9", transform: "rotate(-4deg)" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#EDE9FE" }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M3 3h14v11H11l-3 3v-3H3V3z" stroke="#7C3AED" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M6 8h8M6 11h5" stroke="#7C3AED" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold" style={{ color: "#1F2937" }}>Message</p>
          <p className="text-xs font-mono-data" style={{ color: "#DC2626" }}>85% risk</p>
        </div>
      </div>

      {/* Video card */}
      <div className="absolute top-16 -right-6 bg-white rounded-2xl shadow-xl p-3.5 flex items-center gap-3" style={{ border: "1px solid #EEF2F9", transform: "rotate(3deg)" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#FFEDD5" }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="4" width="12" height="12" rx="2" stroke="#EA580C" strokeWidth="1.5"/>
            <path d="M14 8l5-2.5v9L14 12V8z" stroke="#EA580C" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold" style={{ color: "#1F2937" }}>Video</p>
          <p className="text-xs font-mono-data" style={{ color: "#EA580C" }}>Deepfake?</p>
        </div>
      </div>

      {/* Website card */}
      <div className="absolute bottom-20 -left-8 bg-white rounded-2xl shadow-xl p-3.5 flex items-center gap-3" style={{ border: "1px solid #EEF2F9", transform: "rotate(2deg)" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#DBEAFE" }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="7.5" stroke="#1D4ED8" strokeWidth="1.5"/>
            <path d="M2.5 10h15" stroke="#1D4ED8" strokeWidth="1.4"/>
            <path d="M10 2.5C7.5 5 7 8 7 10s.5 5 3 7.5" stroke="#1D4ED8" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M10 2.5C12.5 5 13 8 13 10s-.5 5-3 7.5" stroke="#1D4ED8" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold" style={{ color: "#1F2937" }}>Website</p>
          <p className="text-xs font-mono-data" style={{ color: "#DC2626" }}>Lookalike</p>
        </div>
      </div>

      {/* App card */}
      <div className="absolute bottom-8 -right-4 bg-white rounded-2xl shadow-xl p-3.5 flex items-center gap-3" style={{ border: "1px solid #EEF2F9", transform: "rotate(-3deg)" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#FEE2E2" }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <rect x="5.5" y="1.5" width="9" height="17" rx="2" stroke="#DC2626" strokeWidth="1.5"/>
            <path d="M9 15h2" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold" style={{ color: "#1F2937" }}>App</p>
          <p className="text-xs font-mono-data" style={{ color: "#DC2626" }}>Fake app</p>
        </div>
      </div>
    </div>
  );
}

/* ── How It Works steps ────────────────────────────────────────── */
const HOW_STEPS = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
        <path d="M8 10h8M8 13.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    title: "Submit Evidence",
    body: "Paste the message, upload video or audio, and share the app link or website URL — whatever you received from the offer.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7"/>
        <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
        <path d="M11 8v3l2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "System Checks",
    body: "Our system checks for scam language, fake apps and websites, impersonation, and deepfake media — all in parallel.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.7"/>
        <path d="M7 12l3.5 3.5 7-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Get a Clear Risk Score",
    body: "You receive a 0–100 fraud risk score with plain-language reasons — exactly what was flagged and why.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L4 6V12C4 17.5 7.5 21.5 12 23C16.5 21.5 20 17.5 20 12V6L12 2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
        <path d="M9 12l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Make a Safer Decision",
    body: "With a clear risk assessment and recommended actions, you can decide confidently before any money moves.",
  },
];

/* ── Use Cases ─────────────────────────────────────────────────── */
const USE_CASES = [
  {
    tag: "WhatsApp / Telegram",
    risk: "HIGH", riskBg: "#FEF2F2", riskColor: "#DC2626", riskBorder: "#FECACA",
    title: "You received a 'guaranteed return' offer on WhatsApp/Telegram.",
    body: "An unknown advisor promises 40% monthly returns and sends a payment link. Paste the message and check instantly before responding.",
  },
  {
    tag: "Identity Claim",
    risk: "MEDIUM", riskBg: "#FFF7ED", riskColor: "#EA580C", riskBorder: "#FED7AA",
    title: "Someone claims to be a SEBI-registered advisor and shares a trading app link.",
    body: "They share their registration number and an app download link. Verify both against official records in seconds.",
  },
  {
    tag: "Video / Social Media",
    risk: "HIGH", riskBg: "#FEF2F2", riskColor: "#DC2626", riskBorder: "#FECACA",
    title: "You see a celebrity-style video promoting a 'risk-free' investment scheme.",
    body: "A famous person appears endorsing an investment scheme. Our deepfake detector analyzes the media for manipulation.",
  },
];

/* ── Main component ────────────────────────────────────────────── */
export default function LandingPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <main>
      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: "linear-gradient(150deg,#0A1F3D 0%,#0E2A52 50%,#143264 100%)" }} className="py-20 lg:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-7"
                style={{ background: "rgba(13,122,114,0.2)", color: "#4FD1C5", border: "1px solid rgba(79,209,197,0.25)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#4FD1C5" }}/>
                AI-Powered Investor Protection · India
              </div>

              <h1 className="font-display text-4xl lg:text-5xl xl:text-[56px] font-semibold text-white leading-[1.1] mb-6">
                Check if an investment offer is safe before you invest.
              </h1>

              <p className="text-lg lg:text-xl leading-relaxed mb-8" style={{ color: "#94B0CC" }}>
                Paste the message, upload video or audio, and share app or website details. Our system analyzes it and gives you a clear risk score with reasons.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <button onClick={() => onNavigate("investor")}
                  className="px-7 py-4 rounded-xl text-white font-semibold text-sm transition-all"
                  style={{ background: "#0D7A72" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#0B6E67")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#0D7A72")}>
                  Start New Check
                </button>
                <button onClick={() => onNavigate("how-it-works")}
                  className="px-7 py-4 rounded-xl font-semibold text-sm border transition-all"
                  style={{ borderColor: "rgba(255,255,255,0.2)", color: "white", background: "transparent" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  How it works →
                </button>
              </div>

              {/* Mini trust signals */}
              <div className="flex flex-wrap gap-5">
                {["✓ No login required", "✓ Free to use", "✓ No data stored without consent"].map(t => (
                  <span key={t} className="text-sm" style={{ color: "#5A8BAA" }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Right — illustration */}
            <div className="hidden lg:flex justify-center items-center">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TRUST / ALIGNMENT STRIP
      ══════════════════════════════════════════════════════ */}
      <div style={{ background: "#0D7A72" }} className="py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
            {[
              { icon: "🛡️", text: "Built for investor protection" },
              { icon: "⚖️", text: "Aligned with SEBI's investor-protection goals" },
              { icon: "🔒", text: "No personal data stored without consent" },
            ].map(t => (
              <div key={t.text} className="flex items-center gap-2">
                <span className="text-lg">{t.icon}</span>
                <span className="text-sm font-medium text-white">{t.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          HOW IT WORKS — 4 steps
      ══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#0D7A72" }}>Simple process</p>
            <h2 className="font-display text-3xl lg:text-4xl font-semibold" style={{ color: "#0E2A52" }}>How SafeInvest AI works</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">Submit your evidence in any format. Our multi-signal system analyzes it and tells you exactly what it found.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOW_STEPS.map((s, i) => (
              <div key={s.title} className="relative bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg transition-all group">
                <div className="flex items-start gap-3 mb-5">
                  <span className="font-mono-data text-2xl font-medium" style={{ color: "#E2E8F0" }}>0{i + 1}</span>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "#EBF7F6", color: "#0D7A72" }}>
                    {s.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-base mb-2" style={{ color: "#0E2A52" }}>{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.body}</p>
                {i < HOW_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3.5 z-10 -translate-y-1/2">
                    <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
                      <path d="M0 6h16M11 1l6 5-6 5" stroke="#0D7A72" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button onClick={() => onNavigate("how-it-works")} className="text-sm font-semibold" style={{ color: "#0D7A72" }}>
              See full technical pipeline →
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          USE CASES
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: "#F2F5FA" }} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#0D7A72" }}>When to use SafeInvest AI</p>
            <h2 className="font-display text-3xl lg:text-4xl font-semibold mb-3" style={{ color: "#0E2A52" }}>Real situations we're built for</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm">Recognise any of these? Our platform is designed exactly for them.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {USE_CASES.map(u => (
              <div key={u.title} className="bg-white rounded-2xl p-7 border border-slate-100 hover:shadow-lg transition-all flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: "#E8EDF6", color: "#0E2A52" }}>{u.tag}</span>
                  <span className="text-xs font-bold font-mono-data px-3 py-1.5 rounded-full" style={{ background: u.riskBg, color: u.riskColor, border: `1px solid ${u.riskBorder}` }}>{u.risk} RISK</span>
                </div>
                <h3 className="font-semibold text-sm mb-3 leading-relaxed" style={{ color: "#0E2A52" }}>"{u.title}"</h3>
                <p className="text-sm text-slate-500 leading-relaxed flex-1">{u.body}</p>
                <button onClick={() => onNavigate("investor")} className="mt-5 text-xs font-semibold" style={{ color: "#0D7A72" }}>
                  Check a similar offer →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          BOTTOM CTA
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: "#0E2A52" }} className="py-18 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <h2 className="font-display text-3xl lg:text-4xl font-semibold text-white mb-4">
            Received an offer you're unsure about?
          </h2>
          <p className="text-lg mb-8" style={{ color: "#7B96B2" }}>
            It takes less than two minutes. You don't need to fill every field — share whatever you have and our system will work with it.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => onNavigate("investor")}
              className="px-8 py-4 rounded-xl text-white font-semibold transition-all"
              style={{ background: "#0D7A72" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#0B6E67")}
              onMouseLeave={e => (e.currentTarget.style.background = "#0D7A72")}>
              Start New Check
            </button>
            <button onClick={() => onNavigate("how-it-works")}
              className="px-8 py-4 rounded-xl font-semibold border transition-all"
              style={{ borderColor: "#2A4A6E", color: "#7B96B2", background: "transparent" }}
              onMouseEnter={e => { e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "#4A6A8E"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#7B96B2"; e.currentTarget.style.borderColor = "#2A4A6E"; }}>
              Learn how it works
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
