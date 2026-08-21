import type { Page } from "../App";

export default function Footer({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <footer style={{ backgroundColor: "#0A1F3D" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: "#163561" }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 1L2 4.5V9C2 13 5.5 16.5 9 17C12.5 16.5 16 13 16 9V4.5L9 1Z" stroke="white" strokeWidth="1.4" strokeLinejoin="round" fill="white" fillOpacity="0.1"/>
                  <path d="M6 9L8 11L12 7" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-display text-lg font-semibold text-white">SafeInvest<span style={{ color: "#4FD1C5" }}>AI</span></span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "#8DA0B8" }}>
              Helping retail investors in India identify potential investment fraud before they invest — using multi-modal AI analysis.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#4FD1C5" }}>Platform</p>
            <ul className="space-y-2.5">
              {([["Verify an Offer","investor"],["Fraud Database","fraud-cases"],["About","about"]] as [string,Page][]).map(([l,p]) => (
                <li key={l}><button onClick={() => onNavigate(p)} className="text-sm transition-colors" style={{ color: "#8DA0B8" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#8DA0B8")}>{l}</button></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#4FD1C5" }}>Legal</p>
            <ul className="space-y-2.5">
              {["Privacy Policy","Terms of Use","Contact Us"].map((l) => (
                <li key={l}><span className="text-sm cursor-pointer transition-colors" style={{ color: "#8DA0B8" }}>{l}</span></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t" style={{ borderColor: "#1A3354" }}>
          <p className="text-xs text-center leading-relaxed" style={{ color: "#4A6280" }}>
            <strong style={{ color: "#6B849E" }}>Disclaimer:</strong> This is a decision-support tool, not a guarantee. Always verify investment offers through official SEBI channels before investing. SafeInvest AI is not affiliated with or endorsed by SEBI.
          </p>
        </div>
      </div>
    </footer>
  );
}
