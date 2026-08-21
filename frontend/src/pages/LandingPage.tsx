import type { Page } from "../App";

const STATS = [
  { val: "₹1,800 Cr+", label: "Lost to investment scams in India per year" },
  { val: "93%", label: "Of fraud offers arrive via WhatsApp or social media" },
  { val: "40%+", label: "Rise in deepfake-related financial fraud since 2022" },
  { val: "8 confirmed", label: "Fraud cases already in our database" },
];

const FRAUD_TYPES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="2" y="5" width="17" height="15" rx="2.5" stroke="#EA580C" strokeWidth="1.8"/>
        <path d="M19 10.5l7-3.5v14l-7-3.5V10.5z" stroke="#EA580C" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M8 12l2 2 4-4" stroke="#EA580C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Deepfake Celebrity Videos",
    desc: "AI-generated videos of Amitabh Bachchan, Mukesh Ambani, and other public figures promoting fake investment schemes.",
    count: "4,200+ cases",
    color: "#EA580C", bg: "#FFF7ED", border: "#FED7AA",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M3 4h22v16H18l-4 4v-4H3V4z" stroke="#7C3AED" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M8 11h12M8 15h7" stroke="#7C3AED" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    title: "WhatsApp / Telegram Scams",
    desc: "Unsolicited messages promising guaranteed returns, 'insider' NSE tips, or SEBI-registered advisor claims.",
    count: "11,000+ cases",
    color: "#7C3AED", bg: "#F5F3FF", border: "#C4B5FD",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="11" stroke="#1D4ED8" strokeWidth="1.8"/>
        <path d="M3 14h22" stroke="#1D4ED8" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M14 3c-3 3.5-4 7-4 11s1 7.5 4 11" stroke="#1D4ED8" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M14 3c3 3.5 4 7 4 11s-1 7.5-4 11" stroke="#1D4ED8" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M9 8l9 12" stroke="#DC2626" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M19 8L10 20" stroke="#DC2626" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    title: "Fake / Lookalike Websites",
    desc: "Domains cloning real brokerages (Zerodha, HDFC Securities, Angel One) to steal credentials and deposits.",
    count: "2,800+ cases",
    color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="7" y="2" width="14" height="24" rx="3" stroke="#0D7A72" strokeWidth="1.8"/>
        <path d="M11 6h6" stroke="#0D7A72" strokeWidth="1.6" strokeLinecap="round"/>
        <circle cx="14" cy="20" r="1.5" fill="#DC2626"/>
        <path d="M10 12h8M10 15.5h5" stroke="#0D7A72" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    title: "Fraudulent Trading Apps",
    desc: "Fake apps distributed via APK links showing paper profits, then blocking withdrawals after deposits are made.",
    count: "3,600+ cases",
    color: "#0D7A72", bg: "#ECFDF5", border: "#6EE7B7",
  },
];

const TESTIMONIALS = [
  {
    text: "I almost sent ₹2 lakhs to a 'SEBI advisor' on Telegram. SafeInvest AI flagged it as 99% fraud in under a minute — the registration number was completely fake.",
    name: "Priya M.",
    location: "Pune, Maharashtra",
    saved: "Saved ₹2 lakh",
  },
  {
    text: "Received a WhatsApp forward of a video with Mukesh Ambani promoting some stock tips. The deepfake detector caught it immediately. Shared the result with my whole family.",
    name: "Ramesh K.",
    location: "Bengaluru, Karnataka",
    saved: "Family protected",
  },
  {
    text: "My father was convinced by a website that looked exactly like Zerodha. We ran the URL through the tool — it was registered 8 days ago. Crisis averted.",
    name: "Ananya S.",
    location: "Chennai, Tamil Nadu",
    saved: "Saved ₹5 lakh",
  },
];

const USE_CASES = [
  {
    tag: "WhatsApp / Telegram",
    risk: "HIGH",
    title: '"Guaranteed 40% monthly returns — join our elite group"',
    body: "Paste the message and let our NLP engine analyze every word for fraud phrases, urgency tactics, and regulatory violations.",
    riskBg: "#FEF2F2", riskColor: "#DC2626", riskBorder: "#FECACA",
  },
  {
    tag: "Identity Claim",
    risk: "VERIFY",
    title: '"I am a SEBI-registered advisor. Here is my certificate."',
    body: "Share the registration number and advisor name. We cross-check it against official SEBI records in real time.",
    riskBg: "#FFF7ED", riskColor: "#EA580C", riskBorder: "#FED7AA",
  },
  {
    tag: "Video / Social Media",
    risk: "HIGH",
    title: '"Celebrity-endorsed scheme with zero risk, 300% in 90 days"',
    body: "Upload the video. Our deepfake classifier and face-authenticity engine analyze every frame for AI manipulation.",
    riskBg: "#FEF2F2", riskColor: "#DC2626", riskBorder: "#FECACA",
  },
];

export default function LandingPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <main>
      {/* ══════════════════ HERO ══════════════════ */}
      <section style={{ background: "linear-gradient(155deg,#0A1728 0%,#0E2A52 55%,#163561 100%)" }} className="pt-16 pb-0 lg:pt-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            {/* Left copy */}
            <div className="pb-16 lg:pb-24">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-7"
                style={{ background: "rgba(13,122,114,0.22)", color: "#4FD1C5", border: "1px solid rgba(79,209,197,0.3)" }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#4FD1C5" }}/>
                AI Fraud Detection · Built for India
              </div>

              <h1 className="font-display text-4xl lg:text-5xl xl:text-[56px] font-semibold text-white leading-[1.1] mb-6">
                Protect your savings from investment fraud — <span style={{ color: "#4FD1C5" }}>before you invest.</span>
              </h1>

              <p className="text-base lg:text-lg leading-relaxed mb-8 max-w-lg" style={{ color: "#94B0CC" }}>
                Upload any WhatsApp message, video, or website link and get a clear fraud risk score in under 3 minutes. No login. No fees. Always free for retail investors.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <button onClick={() => onNavigate("investor")}
                  className="px-7 py-4 rounded-xl text-white font-semibold text-sm transition-all shadow-xl"
                  style={{ background: "#0D7A72", boxShadow: "0 8px 32px rgba(13,122,114,0.35)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#0B6E67")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#0D7A72")}>
                  Verify an Offer Now — Free
                </button>
                <button onClick={() => onNavigate("fraud-cases")}
                  className="px-7 py-4 rounded-xl font-semibold text-sm border transition-all"
                  style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.85)", background: "rgba(255,255,255,0.05)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}>
                  View Fraud Database →
                </button>
              </div>

              {/* Mini trust signals */}
              <div className="flex flex-wrap gap-4">
                {["No login required", "SEBI-aligned", "Privacy-first — no data stored"].map(t => (
                  <div key={t} className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 3" stroke="#4FD1C5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="text-xs" style={{ color: "#7B96B2" }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — mockup interface */}
            <div className="hidden lg:flex justify-end items-end pb-0">
              <div className="relative w-[380px]">
                {/* Main card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden" style={{ boxShadow: "0 40px 100px rgba(0,0,0,0.4)" }}>
                  {/* Card header */}
                  <div className="px-5 pt-5 pb-4" style={{ background: "linear-gradient(135deg,#FEF2F2,#FEE2E2)" }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#991B1B" }}>SafeInvest AI · Analysis Result</span>
                      <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: "#DC2626" }}/>
                    </div>
                    {/* Gauge ring */}
                    <div className="flex items-center gap-4">
                      <div className="relative w-20 h-20">
                        <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
                          <circle cx="40" cy="40" r="32" fill="none" stroke="#FECACA" strokeWidth="8"/>
                          <circle cx="40" cy="40" r="32" fill="none" stroke="#DC2626" strokeWidth="8"
                            strokeDasharray="151 201" strokeLinecap="round"/>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="font-display text-2xl font-bold" style={{ color: "#DC2626" }}>89%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: "#DC2626" }}>HIGH RISK</p>
                        <p className="font-display text-sm font-semibold" style={{ color: "#0E2A52" }}>Possible Investment Scam</p>
                        <p className="text-xs text-slate-500 mt-0.5">3 evidence types analyzed</p>
                      </div>
                    </div>
                  </div>

                  {/* Signal bars */}
                  <div className="px-5 py-4 space-y-2.5">
                    {[
                      { label: "Fraud Language (NLP)", val: 91, color: "#DC2626" },
                      { label: "Domain Spoofing", val: 84, color: "#DC2626" },
                      { label: "Deepfake Detection", val: 78, color: "#EA580C" },
                      { label: "SEBI Registration", val: 3, color: "#16A34A" },
                    ].map(b => (
                      <div key={b.label}>
                        <div className="flex justify-between mb-0.5">
                          <span className="text-xs text-slate-600">{b.label}</span>
                          <span className="text-xs font-mono font-semibold" style={{ color: b.color }}>{b.val}%</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: "#F1F5F9" }}>
                          <div className="h-1.5 rounded-full transition-all" style={{ width: `${b.val}%`, background: b.color }}/>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action bar */}
                  <div className="px-5 py-4 border-t border-slate-100 flex gap-2">
                    <div className="flex-1 text-center py-2 rounded-lg text-xs font-semibold text-white" style={{ background: "#DC2626" }}>
                      Do NOT invest
                    </div>
                    <div className="flex-1 text-center py-2 rounded-lg text-xs font-semibold" style={{ background: "#F1F5F9", color: "#64748B" }}>
                      Download Report
                    </div>
                  </div>
                </div>

                {/* Floating signal badges */}
                <div className="absolute -top-4 -left-8 bg-white rounded-2xl shadow-lg px-3 py-2.5 flex items-center gap-2.5" style={{ border: "1px solid #FFEDD5" }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#FFF7ED" }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="10" height="10" rx="1.5" stroke="#EA580C" strokeWidth="1.2"/><path d="M11 6.5l4-2v7l-4-2V6.5z" stroke="#EA580C" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Video</p>
                    <p className="text-xs font-semibold" style={{ color: "#EA580C" }}>Deepfake detected</p>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-10 bg-white rounded-2xl shadow-lg px-3 py-2.5 flex items-center gap-2.5" style={{ border: "1px solid #C4B5FD" }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#F5F3FF" }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 2h12v9H9l-3 3v-3H2V2z" stroke="#7C3AED" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Message</p>
                    <p className="text-xs font-semibold" style={{ color: "#7C3AED" }}>Fraud phrases ×6</p>
                  </div>
                </div>

                <div className="absolute top-8 -right-10 bg-white rounded-2xl shadow-lg px-3 py-2.5 flex items-center gap-2.5" style={{ border: "1px solid #BFDBFE" }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#EFF6FF" }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#1D4ED8" strokeWidth="1.2"/><path d="M2 8h12" stroke="#1D4ED8" strokeWidth="1.2" strokeLinecap="round"/><path d="M8 2c-1.8 2-2 4.5-2 6s.2 4 2 6" stroke="#1D4ED8" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Website</p>
                    <p className="text-xs font-semibold" style={{ color: "#1D4ED8" }}>7-day old domain</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <svg viewBox="0 0 1440 60" className="w-full block" style={{ marginTop: -1 }}>
          <path d="M0 40 C360 0 1080 80 1440 40 L1440 60 L0 60 Z" fill="#F8F9FB"/>
        </svg>
      </section>

      {/* ══════════════════ STATS STRIP ══════════════════ */}
      <section style={{ background: "#F8F9FB" }} className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map(s => (
              <div key={s.label} className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-slate-100 text-center">
                <p className="font-display text-2xl font-semibold mb-1" style={{ color: "#0E2A52" }}>{s.val}</p>
                <p className="text-xs text-slate-500 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ TRUST STRIP ══════════════════ */}
      <div style={{ background: "#0D7A72" }} className="py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center gap-6 lg:gap-12">
          {[
            { icon: "🛡️", text: "Built for retail investor protection" },
            { icon: "⚖️", text: "Aligned with SEBI's investor-protection mandate" },
            { icon: "🔒", text: "No personal data stored without consent" },
          ].map(t => (
            <div key={t.text} className="flex items-center gap-2">
              <span>{t.icon}</span>
              <span className="text-sm font-medium text-white opacity-90">{t.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════ FRAUD TYPES ══════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#DC2626" }}>Know the threats</p>
            <h2 className="font-display text-3xl lg:text-4xl font-semibold mb-4" style={{ color: "#0E2A52" }}>
              The 4 most common investment frauds in India
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm">Our AI is trained to detect all of these — submit any evidence and we check for every pattern simultaneously.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FRAUD_TYPES.map(f => (
              <div key={f.title} className="rounded-2xl p-6 border transition-all hover:shadow-lg hover:-translate-y-1"
                style={{ background: f.bg, borderColor: f.border }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: "white" }}>{f.icon}</div>
                <h3 className="font-semibold text-sm mb-2" style={{ color: "#0E2A52" }}>{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{f.desc}</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: f.color }}/>
                  <span className="text-xs font-semibold font-mono" style={{ color: f.color }}>{f.count}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button onClick={() => onNavigate("fraud-cases")} className="text-sm font-semibold transition-colors" style={{ color: "#0D7A72" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#0B6E67")} onMouseLeave={e => (e.currentTarget.style.color = "#0D7A72")}>
              View our confirmed fraud database →
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════ HOW IT WORKS ══════════════════ */}
      <section style={{ background: "#F2F5FA" }} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#0D7A72" }}>Simple 4-step process</p>
            <h2 className="font-display text-3xl lg:text-4xl font-semibold" style={{ color: "#0E2A52" }}>How SafeInvest AI works</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { n: "01", icon: "💬", title: "Submit Evidence", body: "Paste the message, upload a video or audio file, or share the website/app link — whatever you received." },
              { n: "02", icon: "🔍", title: "Multi-Engine Analysis", body: "Three AI engines run in parallel: deepfake detection, NLP fraud analysis, and platform verification." },
              { n: "03", icon: "📊", title: "Risk Score Generated", body: "All signals fuse into a single 0–100% fraud risk score with plain-language explanations for every flag." },
              { n: "04", icon: "🛡️", title: "Action Plan", body: "You get specific next steps — before any money leaves your account — with SEBI complaint links." },
            ].map((s, i, arr) => (
              <div key={s.n} className="relative bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-lg transition-all">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-2xl font-mono font-bold" style={{ color: "#E2E8F0" }}>{s.n}</span>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ background: "#EBF7F6" }}>{s.icon}</div>
                </div>
                <h3 className="font-semibold mb-2" style={{ color: "#0E2A52" }}>{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.body}</p>
                {i < arr.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 z-10 -translate-y-1/2">
                    <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                      <path d="M0 7h16M12 2l5 5-5 5" stroke="#0D7A72" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ USE CASES ══════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#0D7A72" }}>Real situations</p>
            <h2 className="font-display text-3xl lg:text-4xl font-semibold mb-4" style={{ color: "#0E2A52" }}>Recognised any of these?</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm">SafeInvest AI is built exactly for these scenarios. Submit your evidence and know in minutes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {USE_CASES.map(u => (
              <div key={u.title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "#E8EDF6", color: "#0E2A52" }}>{u.tag}</span>
                  <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-full" style={{ background: u.riskBg, color: u.riskColor, border: `1px solid ${u.riskBorder}` }}>{u.risk}</span>
                </div>
                <p className="font-semibold text-sm mb-3 leading-relaxed" style={{ color: "#0E2A52" }}>{u.title}</p>
                <p className="text-sm text-slate-500 leading-relaxed flex-1">{u.body}</p>
                <button onClick={() => onNavigate("investor")} className="mt-5 text-xs font-semibold transition-colors text-left" style={{ color: "#0D7A72" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#0B6E67")} onMouseLeave={e => (e.currentTarget.style.color = "#0D7A72")}>
                  Check a similar offer →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ TESTIMONIALS ══════════════════ */}
      <section style={{ background: "#F2F5FA" }} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#0D7A72" }}>Investor stories</p>
            <h2 className="font-display text-3xl lg:text-4xl font-semibold" style={{ color: "#0E2A52" }}>Fraud stopped before the damage was done</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
                <svg width="24" height="18" viewBox="0 0 24 18" fill="none" className="mb-4">
                  <path d="M0 18V10C0 4.477 3.582 1.1 10.745 0l1.255 2C8.236 3.123 6.236 5.167 5.818 8H10V18H0ZM14 18V10C14 4.477 17.582 1.1 24.745 0L26 2c-3.764 1.123-5.764 3.167-6.182 6H24V18H14Z" fill="#E2E8F0"/>
                </svg>
                <p className="text-sm text-slate-600 leading-relaxed flex-1 mb-5 italic">"{t.text}"</p>
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#0E2A52" }}>{t.name}</p>
                    <p className="text-xs text-slate-400">{t.location}</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: "#DCFCE7", color: "#166534" }}>{t.saved}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ SEBI ALIGNMENT CALLOUT ══════════════════ */}
      <section className="py-14 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-2" style={{ background: "linear-gradient(135deg,#0D7A72,#0A5F59)" }}>
            <div className="p-8 lg:p-12">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: "rgba(255,255,255,0.15)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L3 6.5V12C3 17.25 7 21.75 12 23C17 21.75 21 17.25 21 12V6.5L12 2Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
                  <path d="M9 12l2.5 2.5L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="font-display text-2xl font-semibold text-white mb-4">Designed in the spirit of SEBI investor-protection mandates</h2>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "#A7D9D5" }}>Our detection logic, fraud-phrase library, and SEBI registration cross-check are all derived from SEBI's published guidelines and investor-awareness circulars.</p>
              <button onClick={() => onNavigate("about")} className="text-sm font-semibold" style={{ color: "#4FD1C5" }}>
                Learn more about our approach →
              </button>
            </div>
            <div className="p-8 lg:p-12 border-t lg:border-t-0 lg:border-l" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "#4FD1C5" }}>If you are already a victim</p>
              <div className="space-y-3">
                {[
                  { label: "SEBI Investor Helpline", value: "1800 266 7575", note: "Toll-free · Mon–Sat 9am–6pm" },
                  { label: "SEBI SCORES Portal", value: "scores.gov.in", note: "Online complaint registration" },
                  { label: "Cyber Crime Helpline", value: "1930", note: "24×7 · cybercrime.gov.in" },
                ].map(r => (
                  <div key={r.label} className="rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: "#A7D9D5" }}>{r.label}</p>
                    <p className="font-display font-bold text-white">{r.value}</p>
                    <p className="text-[10px]" style={{ color: "#A7D9D5" }}>{r.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ FINAL CTA ══════════════════ */}
      <section style={{ background: "#0E2A52" }} className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(13,122,114,0.25)", border: "1.5px solid rgba(79,209,197,0.3)" }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L4 8V16C4 23.5 9 29.5 16 32C23 29.5 28 23.5 28 16V8L16 2Z" stroke="#4FD1C5" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M11 16l4 4 7-7" stroke="#4FD1C5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="font-display text-3xl lg:text-4xl font-semibold text-white mb-4">
            Received an offer you are unsure about?
          </h2>
          <p className="text-base leading-relaxed mb-8 max-w-xl mx-auto" style={{ color: "#8DA0B8" }}>
            It takes under 3 minutes. You do not need to fill every field — share whatever evidence you have and our AI will do the rest. Always free for retail investors in India.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => onNavigate("investor")}
              className="px-9 py-4 rounded-xl text-white font-semibold transition-all"
              style={{ background: "#0D7A72", boxShadow: "0 8px 24px rgba(13,122,114,0.3)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#0B6E67")}
              onMouseLeave={e => (e.currentTarget.style.background = "#0D7A72")}>
              Verify an Offer Now →
            </button>
            <button onClick={() => onNavigate("fraud-cases")}
              className="px-9 py-4 rounded-xl font-semibold border-2 transition-all"
              style={{ borderColor: "rgba(255,255,255,0.2)", color: "white" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              Browse Fraud Database
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
