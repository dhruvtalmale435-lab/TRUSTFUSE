import type { Page } from "../App";

export default function Footer({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <footer style={{ background: "#0A1F3D", color: "white" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#163561" }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 1.5L2.5 4.5V9C2.5 12.8 5.4 16.2 9 17.1C12.6 16.2 15.5 12.8 15.5 9V4.5L9 1.5Z" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/>
                  <path d="M6 9L8 11L12 7" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-display text-lg font-semibold">SafeInvest<span style={{ color: "#4FD1C5" }}>AI</span></span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm" style={{ color: "#7B96B2" }}>
              Helping retail investors in India identify potential investment fraud before they invest — using multi-modal AI analysis.
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              {["🛡️ Investor protection", "⚖️ SEBI-aligned", "🔒 Privacy-first"].map(t => (
                <span key={t} className="text-xs px-3 py-1.5 rounded-full" style={{ background: "#163561", color: "#7B96B2" }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Platform links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#4FD1C5" }}>Platform</p>
            <ul className="space-y-3">
              {([["How it Works","how-it-works"],["Check an Offer","investor"],["For Investors","about"],["About","about"]] as [string,Page][]).map(([l,p]) => (
                <li key={l}>
                  <button onClick={() => onNavigate(p)} className="text-sm transition-colors" style={{ color: "#7B96B2" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "white")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#7B96B2")}>{l}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#4FD1C5" }}>Legal</p>
            <ul className="space-y-3">
              {["Privacy Policy","Terms of Use","Contact Us","SEBI Guidelines"].map(l => (
                <li key={l}><span className="text-sm cursor-pointer" style={{ color: "#7B96B2" }}>{l}</span></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t pt-6" style={{ borderColor: "#172D4A" }}>
          <p className="text-xs text-center leading-relaxed" style={{ color: "#4A6280" }}>
            <strong style={{ color: "#5A728A" }}>Important Disclaimer:</strong> SafeInvest AI is a decision-support tool, not a guarantee. Always verify investment offers through official SEBI channels before investing. This platform is not affiliated with or endorsed by SEBI. Not a substitute for professional financial advice.
          </p>
          <p className="text-xs text-center mt-2" style={{ color: "#36526A" }}>© 2024 SafeInvest AI · For investor awareness only</p>
        </div>
      </div>
    </footer>
  );
}
