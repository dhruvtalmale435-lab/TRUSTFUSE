import { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import InvestorFlow from "./pages/InvestorFlow";
import UploadVideo from "./pages/UploadVideo";
import UploadText from "./pages/UploadText";
import UploadUrl from "./pages/UploadUrl";
import ResultPage from "./pages/ResultPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import AboutPage from "./pages/AboutPage";
import FraudCasesPage from "./pages/FraudCasesPage";

export type Page =
  | "landing"
  | "investor"
  | "upload-video"
  | "upload-text"
  | "upload-url"
  | "result"
  | "how-it-works"
  | "about"
  | "fraud-cases";

export interface Evidence {
  videoFile: File | null;
  videoNote: string;
  hasVideo: boolean;
  message: string;
  screenshot: File | null;
  hasText: boolean;
  websiteUrl: string;
  appName: string;
  companyName: string;
  regNumber: string;
  hasUrl: boolean;
}

const blank: Evidence = {
  videoFile: null, videoNote: "", hasVideo: false,
  message: "", screenshot: null, hasText: false,
  websiteUrl: "", appName: "", companyName: "", regNumber: "", hasUrl: false,
};

export default function App() {
  const [page, setPage] = useState<Page>("landing");
  const [evidence, setEvidence] = useState<Evidence>(blank);

  const nav = (p: Page) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const patch = (p: Partial<Evidence>) => setEvidence((e) => ({ ...e, ...p }));
  const reset = () => { setEvidence(blank); nav("investor"); };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F8F9FB" }}>
      <Header currentPage={page} onNavigate={nav} />
      <div className="flex-1">
        {page === "landing"       && <LandingPage onNavigate={nav} />}
        {page === "investor"      && <InvestorFlow evidence={evidence} onNavigate={nav} />}
        {page === "upload-video"  && <UploadVideo  evidence={evidence} onSave={(p) => { patch(p); nav("investor"); }} onBack={() => nav("investor")} />}
        {page === "upload-text"   && <UploadText   evidence={evidence} onSave={(p) => { patch(p); nav("investor"); }} onBack={() => nav("investor")} />}
        {page === "upload-url"    && <UploadUrl    evidence={evidence} onSave={(p) => { patch(p); nav("investor"); }} onBack={() => nav("investor")} />}
        {page === "result"        && <ResultPage   evidence={evidence} onReset={reset} onNavigate={nav} />}
        {page === "how-it-works"  && <HowItWorksPage onNavigate={nav} />}
        {page === "about"         && <AboutPage onNavigate={nav} />}
        {page === "fraud-cases"   && <FraudCasesPage onNavigate={nav} />}
      </div>
      <Footer onNavigate={nav} />
    </div>
  );
}
