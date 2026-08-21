import { useState } from "react";
import type { Page } from "../App";

interface FraudCase {
  id: string;
  name: string;
  type: "website" | "app" | "advisor" | "scheme";
  url?: string;
  appName?: string;
  advisorName?: string;
  riskScore: number;
  detectedOn: string;
  category: string;
  signals: string[];
  sebiStatus: "Unregistered" | "Blacklisted" | "Impersonating" | "Suspended";
  victims?: string;
  amountLost?: string;
  description: string;
}

const CASES: FraudCase[] = [
  {
    id: "1",
    name: "WealthMax India",
    type: "website",
    url: "wealthmax-india.com",
    riskScore: 97,
    detectedOn: "2026-08-14",
    category: "Guaranteed Returns Scheme",
    sebiStatus: "Unregistered",
    victims: "1,200+",
    amountLost: "₹4.2 Cr",
    signals: ["Domain registered 12 days ago", "Clones HDFC Securities branding", "Promises 45% monthly returns", "No SEBI registration found", "Fake testimonials detected"],
    description: "Website impersonating a major Indian brokerage, offering 'guaranteed' 45% monthly returns through a 'proprietary algo trading system'. No regulatory registration found. Domain was 12 days old at detection.",
  },
  {
    id: "2",
    name: "InvestSafe Pro",
    type: "app",
    appName: "InvestSafe Pro",
    riskScore: 94,
    detectedOn: "2026-08-10",
    category: "Fake Trading App",
    sebiStatus: "Blacklisted",
    victims: "3,400+",
    amountLost: "₹11.8 Cr",
    signals: ["Not on official Play Store", "APK distributed via WhatsApp", "Withdrawal blocked after ₹5,000 deposit", "Deepfake CEO endorsement video", "Copy of legitimate app UI"],
    description: "Fake trading app distributed via WhatsApp APK links. App showed inflated 'paper profits' to encourage larger deposits, then blocked withdrawals. Deepfake video of a known fintech founder used for promotion.",
  },
  {
    id: "3",
    name: "Rajesh K. Sharma — 'SEBI Advisor'",
    type: "advisor",
    advisorName: "Rajesh K. Sharma",
    riskScore: 99,
    detectedOn: "2026-08-07",
    category: "Fake SEBI Registration",
    sebiStatus: "Impersonating",
    victims: "870+",
    amountLost: "₹6.7 Cr",
    signals: ["SEBI reg# INH000009931 does not exist", "Telegram group with 18,000 members", "Cold-call targeting retirees", "Promises 'insider' NSE tips", "Uses forged SEBI letterhead"],
    description: "Individual claiming SEBI registration number INH000009931, which does not exist in the SEBI database. Operated large Telegram groups with fabricated trade calls and forged SEBI letters to establish trust.",
  },
  {
    id: "4",
    name: "CryptoGrowth India",
    type: "website",
    url: "cryptogrowth-india.net",
    riskScore: 96,
    detectedOn: "2026-08-03",
    category: "Crypto + SEBI Hybrid Scam",
    sebiStatus: "Unregistered",
    victims: "5,100+",
    amountLost: "₹23.4 Cr",
    signals: ["Fake celebrity endorsements (Amitabh Bachchan, Mukesh Ambani)", "Deepfake news clips on YouTube", "Promises 300% return in 60 days", "Domain spoofs a known financial news site", "WhatsApp blast targeting Tier-2 cities"],
    description: "Large-scale operation using AI-generated deepfake videos of celebrities to promote a fake crypto-investment platform. Victims in Tier-2 and Tier-3 Indian cities were primary targets. Linked to international fraud network.",
  },
  {
    id: "5",
    name: "SmartTrade Advisor App",
    type: "app",
    appName: "SmartTrade Advisor",
    riskScore: 88,
    detectedOn: "2026-07-28",
    category: "Unregistered Investment Advisor App",
    sebiStatus: "Unregistered",
    signals: ["Published on third-party app store only", "Charges ₹2,999/month subscription", "No grievance officer listed", "No SEBI IA registration", "Manipulated track record screenshots"],
    description: "Mobile app offering 'premium stock tips' for a monthly subscription. Published only on third-party app stores. Advertised fabricated win rates. No SEBI Investment Advisor registration.",
  },
  {
    id: "6",
    name: "FutureWealth Capital",
    type: "scheme",
    advisorName: "FutureWealth Capital Pvt. Ltd.",
    url: "futurewealthcapital.co.in",
    riskScore: 98,
    detectedOn: "2026-07-19",
    category: "Ponzi Scheme",
    sebiStatus: "Blacklisted",
    victims: "9,200+",
    amountLost: "₹47 Cr",
    signals: ["Classic Ponzi structure confirmed", "SEBI issued public notice", "Early investors paid with new investor funds", "Promised 24% annual 'guaranteed' return", "Office existed only for 3 months before shutdown"],
    description: "Registered as an NBFC but operated as an unregistered collective investment scheme. Early investors paid with newer investor capital. SEBI issued public notice and froze accounts. Case referred to ED for FEMA violations.",
  },
  {
    id: "7",
    name: "NSE Options Academy",
    type: "website",
    url: "nse-options-academy.com",
    riskScore: 91,
    detectedOn: "2026-07-11",
    category: "Fake SEBI Training / Advisory",
    sebiStatus: "Impersonating",
    signals: ["Domain spoofs NSE's official domain", "Charges ₹50,000 for 'SEBI-certified' course", "NSE has no affiliation", "Fake NSE logo and branding", "No grievance redressal"],
    description: "Website impersonating NSE India, selling 'SEBI-certified' options trading courses for ₹50,000. NSE has officially clarified it has no association with this entity. Hundreds of investors defrauded before takedown.",
  },
  {
    id: "8",
    name: "AlgoTrade Pro Bot",
    type: "app",
    appName: "AlgoTrade Pro Bot",
    riskScore: 93,
    detectedOn: "2026-07-05",
    category: "Automated Trading Scam",
    sebiStatus: "Unregistered",
    signals: ["Claims 98% win rate with no proof", "Requires Zerodha/Groww API key access", "Withdraws funds without user consent", "No company registration found", "Promoted via YouTube influencers"],
    description: "App claiming to be an 'AI algo trading bot' with a 98% win rate. Requested Zerodha API access to execute trades. Multiple users reported unauthorized transfers. Promoted by YouTube finance influencers (some unknowingly).",
  },
];

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  website: { bg: "#EFF6FF", text: "#1E3A8A", border: "#BFDBFE", label: "Website" },
  app:     { bg: "#F5F3FF", text: "#4C1D95", border: "#C4B5FD", label: "App" },
  advisor: { bg: "#FFF7ED", text: "#7C2D12", border: "#FED7AA", label: "Advisor" },
  scheme:  { bg: "#FEF2F2", text: "#7F1D1D", border: "#FECACA", label: "Scheme" },
};

const SEBI_COLORS: Record<string, { bg: string; text: string }> = {
  Unregistered: { bg: "#FEF3C7", text: "#92400E" },
  Blacklisted:  { bg: "#FEE2E2", text: "#991B1B" },
  Impersonating:{ bg: "#FCE7F3", text: "#831843" },
  Suspended:    { bg: "#E0E7FF", text: "#3730A3" },
};

function RiskBadge({ score }: { score: number }) {
  const color = score >= 90 ? "#DC2626" : score >= 70 ? "#EA580C" : "#D97706";
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-10 h-10">
        <svg viewBox="0 0 40 40" className="w-10 h-10 -rotate-90">
          <circle cx="20" cy="20" r="16" fill="none" stroke="#F1F5F9" strokeWidth="4"/>
          <circle cx="20" cy="20" r="16" fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={`${(score / 100) * 100.5} 100.5`} strokeLinecap="round"/>
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold font-mono" style={{ color }}>{score}</span>
      </div>
      <div>
        <p className="text-xs font-bold" style={{ color }}>{score >= 90 ? "CRITICAL" : score >= 70 ? "HIGH" : "MEDIUM"}</p>
        <p className="text-[10px] text-slate-400">Risk Score</p>
      </div>
    </div>
  );
}

function CaseCard({ c, onClick }: { c: FraudCase; onClick: () => void }) {
  const tc = TYPE_COLORS[c.type];
  const sc = SEBI_COLORS[c.sebiStatus];
  return (
    <button onClick={onClick} className="w-full text-left bg-white rounded-2xl border border-slate-100 shadow-sm p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 focus:outline-none"
      style={{ borderLeft: "4px solid #DC2626" }}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>{tc.label}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.text }}>{c.sebiStatus}</span>
          </div>
          <h3 className="font-semibold text-base leading-snug mb-0.5" style={{ color: "#0E2A52" }}>{c.name}</h3>
          {(c.url || c.appName) && (
            <p className="text-xs font-mono text-slate-400 truncate">{c.url || c.appName}</p>
          )}
        </div>
        <RiskBadge score={c.riskScore}/>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">{c.description}</p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {c.signals.slice(0, 3).map(s => (
          <span key={s} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "#FEF2F2", color: "#DC2626" }}>⚑ {s}</span>
        ))}
        {c.signals.length > 3 && <span className="text-[10px] px-2 py-0.5 rounded-full text-slate-400" style={{ background: "#F1F5F9" }}>+{c.signals.length - 3} more</span>}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex gap-4">
          {c.victims && <span className="text-xs text-slate-500"><span className="font-semibold text-slate-700">{c.victims}</span> victims</span>}
          {c.amountLost && <span className="text-xs text-slate-500"><span className="font-semibold" style={{ color: "#DC2626" }}>{c.amountLost}</span> lost</span>}
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Detected {c.detectedOn}</span>
      </div>
    </button>
  );
}

function Modal({ c, onClose }: { c: FraudCase; onClose: () => void }) {
  const tc = TYPE_COLORS[c.type];
  const sc = SEBI_COLORS[c.sebiStatus];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(10,31,61,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>{tc.label}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.text }}>{c.sebiStatus}</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="flex items-start gap-4 mb-5">
            <div className="flex-1">
              <h2 className="font-display text-xl font-semibold mb-1" style={{ color: "#0E2A52" }}>{c.name}</h2>
              {(c.url || c.appName) && <p className="text-xs font-mono text-slate-400">{c.url || c.appName}</p>}
            </div>
            <RiskBadge score={c.riskScore}/>
          </div>

          {/* Stats row */}
          {(c.victims || c.amountLost) && (
            <div className="grid grid-cols-2 gap-3 mb-5">
              {c.victims && (
                <div className="rounded-xl p-4 text-center" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
                  <p className="font-display text-2xl font-semibold" style={{ color: "#DC2626" }}>{c.victims}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Reported victims</p>
                </div>
              )}
              {c.amountLost && (
                <div className="rounded-xl p-4 text-center" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
                  <p className="font-display text-2xl font-semibold" style={{ color: "#DC2626" }}>{c.amountLost}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Estimated losses</p>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="mb-5">
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#64748B" }}>Case Summary</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{c.description}</p>
          </div>

          {/* Category */}
          <div className="mb-5">
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#64748B" }}>Fraud Category</h3>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0" }}>{c.category}</span>
          </div>

          {/* Signals */}
          <div className="mb-5">
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#64748B" }}>Fraud Signals Detected ({c.signals.length})</h3>
            <ul className="space-y-2">
              {c.signals.map(s => (
                <li key={s} className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5" style={{ background: "#FEE2E2" }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#DC2626" }}/>
                  </span>
                  <span className="text-sm text-slate-700">{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* SEBI action */}
          <div className="rounded-xl p-4" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
            <p className="text-xs font-semibold mb-1" style={{ color: "#92400E" }}>SEBI / Regulatory Status</p>
            <p className="text-xs text-slate-600">Entity status: <strong style={{ color: SEBI_COLORS[c.sebiStatus].text }}>{c.sebiStatus}</strong> · Detected on {c.detectedOn}</p>
            <p className="text-xs text-slate-500 mt-1">If you have interacted with this entity, file a complaint at <span style={{ color: "#0D7A72" }}>scores.gov.in</span> or call SEBI helpline <strong>1800 266 7575</strong>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const FILTERS = ["All", "Website", "App", "Advisor", "Scheme"] as const;
type Filter = typeof FILTERS[number];

export default function FraudCasesPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [filter, setFilter] = useState<Filter>("All");
  const [selected, setSelected] = useState<FraudCase | null>(null);

  const filtered = CASES.filter(c =>
    filter === "All" ? true :
    filter === "Website" ? c.type === "website" :
    filter === "App" ? c.type === "app" :
    filter === "Advisor" ? c.type === "advisor" :
    c.type === "scheme"
  );

  const totalVictims = "19,770+";
  const totalLost = "₹93.1 Cr";

  return (
    <main>
      {/* Hero */}
      <section style={{ background: "linear-gradient(160deg,#1A0A0A 0%,#3B0A0A 60%,#7F1D1D 100%)" }} className="py-14 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-semibold" style={{ background: "rgba(220,38,38,0.2)", color: "#FCA5A5", border: "1px solid rgba(220,38,38,0.3)" }}>
              ⚑ Live Fraud Intelligence Database
            </div>
            <h1 className="font-display text-3xl lg:text-4xl font-semibold text-white mb-4">
              Confirmed Investment Fraud Cases
            </h1>
            <p className="text-base leading-relaxed max-w-2xl mx-auto" style={{ color: "#FCA5A5" }}>
              These platforms, apps, advisors, and schemes were independently flagged by SafeInvest AI as <strong style={{ color: "white" }}>100% confirmed fraud</strong>. Do not interact with any entity listed here.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { val: CASES.length.toString(), label: "Confirmed cases" },
              { val: totalVictims, label: "Reported victims" },
              { val: totalLost, label: "Estimated losses" },
            ].map(s => (
              <div key={s.label} className="text-center rounded-2xl py-4 px-3" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <p className="font-display text-2xl font-bold text-white">{s.val}</p>
                <p className="text-xs mt-0.5" style={{ color: "#FCA5A5" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters + Grid */}
      <section style={{ background: "#F2F5FA" }} className="py-10 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter bar */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mr-1">Filter:</p>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: filter === f ? "#DC2626" : "white",
                  color: filter === f ? "white" : "#64748B",
                  border: `1.5px solid ${filter === f ? "#DC2626" : "#E2E8F0"}`,
                }}>
                {f}
              </button>
            ))}
            <span className="ml-auto text-xs text-slate-400">{filtered.length} case{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Warning banner */}
          <div className="rounded-xl p-4 mb-6 flex items-start gap-3" style={{ background: "#FEF2F2", border: "1.5px solid #FECACA" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="flex-shrink-0 mt-0.5">
              <path d="M9 2L1.5 15.5h15L9 2z" stroke="#DC2626" strokeWidth="1.6" strokeLinejoin="round"/>
              <path d="M9 7v4" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="9" cy="13" r="0.8" fill="#DC2626"/>
            </svg>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong style={{ color: "#DC2626" }}>Important:</strong> All cases below have been confirmed as fraudulent through multi-modal AI analysis and cross-checked against SEBI/RBI databases. If you have sent money to any of these entities, immediately file a complaint at <strong>scores.gov.in</strong> and call Cyber Crime helpline <strong>1930</strong>.
            </p>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map(c => (
              <CaseCard key={c.id} c={c} onClick={() => setSelected(c)}/>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 rounded-2xl p-8 text-center" style={{ background: "#0E2A52" }}>
            <p className="font-display text-xl font-semibold text-white mb-2">Think you received an offer from a suspicious source?</p>
            <p className="text-sm mb-6" style={{ color: "#94B0CC" }}>Run our multi-modal check — it takes under 3 minutes and could save your savings.</p>
            <button onClick={() => onNavigate("investor")}
              className="px-8 py-3.5 rounded-xl font-semibold text-sm text-white transition-all"
              style={{ background: "#DC2626" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#B91C1C")}
              onMouseLeave={e => (e.currentTarget.style.background = "#DC2626")}>
              Verify an Offer Now →
            </button>
          </div>
        </div>
      </section>

      {/* Modal */}
      {selected && <Modal c={selected} onClose={() => setSelected(null)}/>}
    </main>
  );
}
