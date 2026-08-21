import { useState } from "react";
import type { Page } from "../App";

export default function Header({ currentPage, onNavigate }: { currentPage: Page; onNavigate: (p: Page) => void }) {
  const [open, setOpen] = useState(false);
  const nav = (p: Page) => { onNavigate(p); setOpen(false); };

  const links: { label: string; page: Page }[] = [
    { label: "Home", page: "landing" },
    { label: "Verify an Offer", page: "investor" },
    { label: "Fraud Database", page: "fraud-cases" },
    { label: "About", page: "about" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200" style={{ boxShadow: "0 1px 4px rgba(14,42,82,0.07)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <button onClick={() => nav("landing")} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: "#0E2A52" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 1L2 4.5V9C2 13 5.5 16.5 9 17C12.5 16.5 16 13 16 9V4.5L9 1Z" stroke="white" strokeWidth="1.4" strokeLinejoin="round" fill="white" fillOpacity="0.1"/>
              <path d="M6 9L8 11L12 7" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-display text-lg font-semibold" style={{ color: "#0E2A52" }}>
            SafeInvest<span style={{ color: "#0D7A72" }}>AI</span>
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <button key={l.label} onClick={() => nav(l.page)}
              className="text-sm font-medium transition-colors"
              style={{ color: currentPage === l.page ? "#0D7A72" : "#374151" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#0D7A72")}
              onMouseLeave={(e) => (e.currentTarget.style.color = currentPage === l.page ? "#0D7A72" : "#374151")}>
              {l.label}
            </button>
          ))}
        </nav>

        <button onClick={() => nav("investor")} className="hidden md:inline-flex px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
          style={{ backgroundColor: "#0D7A72" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0B6E67")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0D7A72")}>
          Check an Offer Now
        </button>

        {/* Hamburger */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open
            ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4l12 12M16 4L4 16" stroke="#374151" strokeWidth="1.8" strokeLinecap="round"/></svg>
            : <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14" stroke="#374151" strokeWidth="1.8" strokeLinecap="round"/></svg>}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-1">
          {links.map((l) => (
            <button key={l.label} onClick={() => nav(l.page)}
              className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
              {l.label}
            </button>
          ))}
          <button onClick={() => nav("investor")} className="mt-2 w-full py-3 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: "#0D7A72" }}>
            Check an Offer Now
          </button>
        </div>
      )}
    </header>
  );
}
