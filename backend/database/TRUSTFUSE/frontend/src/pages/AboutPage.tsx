import { useState } from "react";
import type { Page } from "../App";

const FAQS = [
  { q: "Is this official SEBI software?", a: "No. SafeInvest AI is an independent decision-support tool aligned with SEBI's investor-protection goals, but it is not developed, endorsed, or operated by SEBI. Always verify registrations and complaints through the official SEBI portal at sebi.gov.in." },
  { q: "Does this guarantee that an offer is safe?", a: "No. SafeInvest AI provides a risk score and the reasons behind it. A low score means fewer red flags were detected — not that the offer is definitively safe. Always conduct your own due diligence and verify through official channels before investing." },
  { q: "What data do you store?", a: "Evidence you submit is processed for the duration of your analysis session only. No personal identifying data is stored without your explicit consent. You may choose to save your report for future reference." },
  { q: "Who can use SafeInvest AI?", a: "Any retail investor in India. No login is required. The platform is also designed for use by investor helplines, brokerage compliance teams, and consumer protection agencies." },
  { q: "How accurate is the risk score?", a: "The system uses multiple validated models across each check type. However, fraud tactics evolve rapidly. Treat the score as one input in your decision — not the final word. When in doubt, contact SEBI or your registered broker directly." },
];

export default function AboutPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <main>
      {/* ── HERO ─────────────────────────────────────── */}
      <section style={{ background: "linear-gradient(160deg,#0E2A52 0%,#163561 100%)" }} className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#4FD1C5" }}>About the Platform</p>
          <h1 className="font-display text-3xl lg:text-4xl font-semibold text-white mb-5">About SafeInvest AI</h1>
          <p className="leading-relaxed max-w-2xl mx-auto" style={{ color: "#A8BDD4" }}>
            Built to address a real and growing problem: investment scams in India are becoming more sophisticated, using deepfakes, fake SEBI registrations, and lookalike trading apps to defraud retail investors.
          </p>
        </div>
      </section>

      {/* ── WHY BUILT ────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <h2 className="font-display text-2xl lg:text-3xl font-semibold mb-5" style={{ color: "#0E2A52" }}>Why this was built</h2>
              <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                <p>India has over 90 million retail investors, most of whom are first-generation investors with limited experience identifying fraud. Investment scams have evolved dramatically — from simple pump-and-dump schemes to sophisticated operations using WhatsApp groups, fake SEBI registration numbers, cloned brokerage websites, and AI-generated celebrity endorsement videos.</p>
                <p>SEBI has consistently emphasized investor protection as a core mandate. Yet no accessible, automated tool exists for an ordinary investor to quickly cross-check a suspicious offer before committing money.</p>
                <p>SafeInvest AI fills this gap: a multi-modal, multi-signal fraud detection platform that any investor can use — in seconds, for free, without technical knowledge.</p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { val: "₹1,800 Cr+", label: "Lost to investment scams in India annually (estimated)" },
                { val: "73%", label: "Of scam victims received the offer via WhatsApp or Telegram" },
                { val: "40%+", label: "Increase in deepfake-related financial fraud since 2022" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl p-5 border" style={{ backgroundColor: "#F2F5FA", borderColor: "#E8EDF6" }}>
                  <div className="font-display text-3xl font-semibold mb-1" style={{ color: "#0E2A52" }}>{s.val}</div>
                  <p className="text-sm text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SEBI ALIGNMENT ───────────────────────────── */}
      <section style={{ backgroundColor: "#F2F5FA" }} className="py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border p-8" style={{ backgroundColor: "#EBF7F6", borderColor: "#A7F3D0" }}>
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#0D7A72" }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M11 2L3 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6L11 2z" stroke="white" strokeWidth="1.7" strokeLinejoin="round"/>
                  <path d="M8 11l2.5 2.5 4-4" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold mb-3" style={{ color: "#0B6E67" }}>Aligned with SEBI's Investor Protection Mandate</h2>
                <p className="text-sm text-slate-700 leading-relaxed mb-3">SEBI's investor protection framework mandates that intermediaries take steps to protect investors from fraud and malpractice. SafeInvest AI supports this mandate by providing technology that helps retail investors independently verify investment offers before they become victims.</p>
                <p className="text-sm text-slate-600 leading-relaxed">The platform checks against publicly available SEBI registration data, monitors for known scam patterns, and provides plain-language explanations aligned with SEBI's investor education communication style.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHO BENEFITS ─────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl lg:text-3xl font-semibold" style={{ color: "#0E2A52" }}>Who can benefit</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "👤", title: "Retail Investors", desc: "Anyone who received an unsolicited investment offer, a 'guaranteed return' scheme, or a tip from an unknown advisor." },
              { icon: "🏢", title: "Registered Brokers", desc: "SEBI-registered intermediaries who want to protect clients from fraudulent impersonators or lookalike platforms." },
              { icon: "📞", title: "Investor Helplines", desc: "Consumer forums, legal aid organizations, and SEBI-associated helplines that assist fraud victims." },
            ].map((a) => (
              <div key={a.title} className="rounded-2xl border border-slate-100 p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">{a.icon}</div>
                <h3 className="font-semibold mb-2" style={{ color: "#0E2A52" }}>{a.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────── */}
      <section style={{ backgroundColor: "#F2F5FA" }} className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl lg:text-3xl font-semibold" style={{ color: "#0E2A52" }}>Frequently asked questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <button className="w-full px-6 py-4 flex items-center justify-between text-left" onClick={() => setOpen(open === i ? null : i)}>
                  <span className="font-semibold text-sm pr-4" style={{ color: "#0E2A52" }}>{f.q}</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 transition-transform"
                    style={{ transform: open === i ? "rotate(180deg)" : "none", color: "#6B7280" }}>
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {open === i && <div className="px-6 pb-5"><p className="text-sm text-slate-600 leading-relaxed">{f.a}</p></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section style={{ backgroundColor: "#0E2A52" }} className="py-14">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-display text-2xl font-semibold text-white mb-3">Received something suspicious?</h2>
          <p className="mb-6 text-sm" style={{ color: "#8DA0B8" }}>Run a quick check before you invest. No login, no cost, no data stored without consent.</p>
          <button onClick={() => onNavigate("investor")} className="px-8 py-3.5 rounded-xl font-semibold text-sm text-white transition-all"
            style={{ backgroundColor: "#0D7A72" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0B6E67")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0D7A72")}>
            Check an Offer Now →
          </button>
        </div>
      </section>
    </main>
  );
}
