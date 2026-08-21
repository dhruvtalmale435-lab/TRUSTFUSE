import { useState } from "react";
import type { Page } from "../App";

const NAV: { label: string; page: Page }[] = [
  { label: "How it Works", page: "how-it-works" },
  { label: "For Investors", page: "about" },
  { label: "For Brokers",   page: "about" },
  { label: "About",         page: "about" },
];

export default function Header({ currentPage, onNavigate }: { currentPage: Page; onNavigate: (p: Page) => void }) {
  const [open, setOpen] = useState(false);
  const go = (p: Page) => { onNavigate(p); setOpen(false); };

  return (
    <header className="sticky top-0 z-50 bg-white" style={{ borderBottom: "1px solid #E8EDF6", boxShadow: "0 1px 6px rgba(14,42,82,0.07)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">

        {/* Logo */}
        <button onClick={() => go("landing")} className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#0E2A52" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 1.5L2.5 4.5V9C2.5 12.8 5.4 16.2 9 17.1C12.6 16.2 15.5 12.8 15.5 9V4.5L9 1.5Z" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/>
              <path d="M6 9L8 11L12 7" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-display text-[17px] font-semibold tracking-tight" style={{ color: "#0E2A52" }}>
            SafeInvest<span style={{ color: "#0D7A72" }}>AI</span>
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV.map(l => (
            <button key={l.label} onClick={() => go(l.page)}
              className="text-sm font-medium transition-colors"
              style={{ color: currentPage === l.page ? "#0D7A72" : "#4B5563" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#0D7A72")}
              onMouseLeave={e => (e.currentTarget.style.color = currentPage === l.page ? "#0D7A72" : "#4B5563")}>
              {l.label}
            </button>
          ))}
        </nav>

        {/* CTA */}
        <button onClick={() => go("investor")}
          className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
          style={{ background: "#0D7A72" }}
          onMouseEnter={e => (e.currentTarget.style.background = "#0B6E67")}
          onMouseLeave={e => (e.currentTarget.style.background = "#0D7A72")}>
          Check an Offer Now
        </button>

        {/* Mobile toggle */}
        <button className="md:hidden p-1.5" onClick={() => setOpen(!open)} aria-label="menu">
          {open
            ? <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 4l14 14M18 4L4 18" stroke="#374151" strokeWidth="1.8" strokeLinecap="round"/></svg>
            : <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 6h16M3 11h16M3 16h16" stroke="#374151" strokeWidth="1.8" strokeLinecap="round"/></svg>}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 pb-4 pt-2">
          {NAV.map(l => (
            <button key={l.label} onClick={() => go(l.page)}
              className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              {l.label}
            </button>
          ))}
          <button onClick={() => go("investor")}
            className="mt-3 w-full py-3 rounded-xl text-sm font-semibold text-white" style={{ background: "#0D7A72" }}>
            Check an Offer Now
          </button>
        </div>
      )}
    </header>
  );
}
