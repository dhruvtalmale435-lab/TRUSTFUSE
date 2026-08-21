# InvestorShield — AI Context

## 1. PROJECT

AI-Based Investor Fraud & Impersonation Detection
Domain: FinTech / Investor Protection

Goal: Detect suspicious investor-facing video, audio, messages and trading-platform indicators and produce an explainable fraud-risk score.

Core flow: `INPUT → DETECTION → SIGNAL FUSION → RISK ENGINE → EXPLANATION → REPORT`

This is a screening/decision-support system, not a legal fraud determination.

## 2. FIXED STACK

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite + Tailwind |
| Backend | Python + FastAPI |
| Database/Auth/Storage | Supabase |
| ML | Python + OpenCV + pretrained deepfake model |
| Audio | FFmpeg + Speech-to-Text |
| Text | Regex + NLP |
| Platform | TRIP/API adapter + local URL checks |
| AI layer | MCP |
| Version control | Git/GitHub |

**DO NOT change the stack.**

## 3. FINAL ARCHITECTURE

```
React Frontend
↓
FastAPI API
↓
┌─────────────────────────────────────┐
│ Detection Engines                   │
│                                     │
│ Media  → OpenCV → Deepfake Model    │
│ Audio  → FFmpeg → STT → Analysis   │
│ Text   → Regex + NLP               │
│ Identity → Impersonation Analysis  │
│ URL    → TRIP/API + Local Checks   │
└─────────────────────────────────────┘
↓
Signal Engine → Risk Engine → Explanation Engine
↓
Supabase
↓
Dashboard / Evidence / Report
```

MCP sits above existing backend services and calls them. MCP must **NOT** duplicate detection logic.

## 4. DETECTION ENGINES

### Media
Video → OpenCV → frame sampling → face processing → pretrained deepfake model.
Return: `deepfake_score`, `confidence`, `frames_analyzed`, `suspicious_frames`, `evidence`.
Do NOT train a model from scratch.

### Audio
Video → FFmpeg → audio → speech-to-text → Regex/NLP.
Audio manipulation detection is optional if unstable.

### Regex
Detect: guaranteed/fixed returns, urgency, payment requests, SEBI/registered-advisor claims, VIP/Telegram/WhatsApp patterns, investment solicitation.
Regex must return evidence.

### NLP
Detect context: scam intent, investment solicitation, guaranteed-return claims, urgency, payment request, impersonation, suspicious financial advice.

### Impersonation
Analyze: name + claimed role + organization + message + available identity signals.

### Platform
URL → TRIP/API adapter + local checks.
Signals: domain, reputation, HTTPS, redirects, suspicious keywords, financial claims, payment instructions, brand impersonation.
External API failure must fall back to local checks.

## 5. SIGNAL ENGINE

Normalize all detectors into:
```json
{
  "score": 0.0,
  "confidence": 0.0,
  "signals": [],
  "evidence": []
}
```
Combined signals: `deepfake`, `audio`, `fraud_language`, `impersonation`, `platform`

## 6. RISK ENGINE

**Weights:**
| Signal | Weight |
|---|---|
| Deepfake | 25% |
| Audio | 10% |
| Fraud language | 25% |
| Impersonation | 20% |
| Platform | 20% |

**Risk Levels:**
| Score | Level |
|---|---|
| 0–30 | LOW |
| 31–60 | MEDIUM |
| 61–80 | HIGH |
| 81–100 | CRITICAL |

Always preserve component scores and reasons.

## 7. API CONTRACT

```
GET  /health
POST /cases
POST /analyze/text
POST /analyze/video
POST /analyze/url
POST /risk
GET  /cases/{id}
GET  /cases/{id}/report
```

Do not change API response structures without team agreement.

## 8. SUPABASE

Use Supabase for: PostgreSQL database, Authentication if required, Storage for uploaded media.
Core tables: `cases`, `evidence`, `detections`, `risk_scores`, `reports`.
Do not introduce another database.

## 9. MCP TOOLS

`analyze_video()` · `analyze_message()` · `analyze_platform()` · `check_impersonation()` · `calculate_risk()` · `explain_case()` · `generate_report()`

MCP calls existing FastAPI/services.

## 10. FRONTEND SCREENS

1. Command Center
2. Investigation / Upload
3. Analysis Result
4. Evidence Timeline
5. Report

Main result must show: Risk score, Risk level, Detection breakdown, Evidence, Reasons, Recommended action.

## 11. 24-HOUR PRIORITY

| Priority | Scope |
|---|---|
| **P0** | End-to-end flow, FastAPI, Supabase, Risk engine, Frontend, Text detection, Video/deepfake pipeline |
| **P1** | Audio, Platform/API, MCP, Report |
| **P2** | UI polish / extras |

If behind schedule, cut P2 first.

## 12. FALLBACK

| Failure | Fallback |
|---|---|
| ML failure | Demo/precomputed result |
| API failure | Local URL checks |
| MCP failure | Normal REST flow |
| Network failure | Local demo case |

The demo must remain functional.

## 13. AI AGENT RULES

Before coding: (1) Read this file. (2) Inspect existing code. (3) Modify only the requested module.

**Never:**
- Change architecture or stack
- Add unnecessary dependencies
- Rewrite unrelated code
- Duplicate services
- Modify another member's module
- Train a model from scratch
- Introduce MongoDB/Firebase/Appwrite
- Introduce microservices/Kubernetes

Keep changes minimal and compatible with existing APIs.

## 14. TEAM

| Role | Responsibilities |
|---|---|
| Tech Lead | FastAPI + Supabase + Risk Engine + Integration + MCP + Deployment |
| ML | OpenCV + Deepfake + Audio + Regex + NLP |
| Frontend | React UI + Dashboard + Investigation + Results + Report |
| Product/QA | Demo cases + Testing + Documentation + Pitch + MCP support |

## 15. DEMO

```
Fake advisor video/message
→ OpenCV/deepfake → Audio/STT → Regex + NLP → Impersonation → Platform checks
→ Signal Fusion → 91/100 CRITICAL
→ Evidence + Explanation → AI Investigation → Report
```

> **BUILD LESS. INTEGRATE EARLY. KEEP THE MAIN DEMO WORKING.**
