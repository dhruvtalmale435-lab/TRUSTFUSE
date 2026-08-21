# 🛡️ FroudFuse AI

### **AI-Based Investor Fraud & Impersonation Detection**

> **Detect suspicious signals. Explain the risk. Protect the investor.**

FroudFuse AI is an AI-powered **FinTech and cybersecurity platform** that analyzes suspicious investment **videos, audio, messages, and trading-platform URLs** to identify potential fraud and impersonation.

It combines multimodal AI, rule-based detection, platform intelligence, and explainable risk scoring to help investors make safer decisions.

> ⚠️ **FroudFuse AI is a screening and decision-support system, not a legal fraud determination.**

---

## 🚨 Problem

Investors are increasingly targeted through:

* 🎭 Fake financial advisors and celebrity impersonation
* 🎥 Deepfake investment videos
* 💬 Fraudulent WhatsApp/Telegram messages
* 💰 Guaranteed-return and urgency-based scams
* 🌐 Fake trading platforms and suspicious URLs
* 💳 Requests for direct payments or transfers

Traditional tools often analyze only one type of signal. FroudFuse AI combines **multiple signals into one explainable risk assessment**.

---

## 💡 Our Solution

FroudFuse AI follows a multimodal detection pipeline:

```mermaid
flowchart LR
    A["Video / Audio / Message / URL"] --> B["Detection Engines"]
    B --> C["Signal Fusion"]
    C --> D["Risk Engine"]
    D --> E["Explanation"]
    E --> F["Investigation Report"]
```

### 🔍 Detection Capabilities

| Module      | Detection                              |
| ----------- | -------------------------------------- |
| 🎥 Media    | Deepfake and suspicious-frame analysis |
| 🎙️ Audio   | Audio extraction + Speech-to-Text      |
| 💬 Text     | Regex + NLP fraud-language detection   |
| 🎭 Identity | Potential impersonation detection      |
| 🔗 Platform | URL and trading-platform risk analysis |

---

## ⚖️ Explainable Risk Engine

All signals are normalized and combined into a **0–100 risk score**.

| Signal            | Weight |
| ----------------- | -----: |
| 🎥 Deepfake       |    25% |
| 🎙️ Audio         |    10% |
| 🚨 Fraud Language |    25% |
| 🎭 Impersonation  |    20% |
| 🌐 Platform       |    20% |

### Risk Levels

* 🟢 **0–30:** LOW
* 🟡 **31–60:** MEDIUM
* 🟠 **61–80:** HIGH
* 🔴 **81–100:** CRITICAL

The system preserves **component scores, evidence, and reasons** so users can understand *why* a case was flagged.

---

## 🏗️ System Architecture

<img width="713" height="1600" alt="FroudFuse AI System Architecture" src="https://github.com/user-attachments/assets/3768aa4a-a233-4829-8531-fb3dff7e44d3" />

---

## 🛠️ Technology Stack

| Layer                     | Technology                                  |
| ------------------------- | ------------------------------------------- |
| 🎨 Frontend               | React + TypeScript + Vite + Tailwind        |
| ⚡ Backend                 | Python + FastAPI                            |
| 🤖 ML                     | Python + OpenCV + Pretrained Deepfake Model |
| 🎙️ Audio                 | FFmpeg + Speech-to-Text                     |
| 📝 Text                   | Regex + NLP                                 |
| 🌐 Platform               | TRIP/API Adapter + Local URL Checks         |
| 🗄️ Database/Auth/Storage | Supabase                                    |
| 🧠 AI Orchestration       | MCP                                         |
| 🔧 Version Control        | Git + GitHub                                |

---

## 🖥️ Key Features

* 📤 Multimodal investigation input
* 🎥 Deepfake detection
* 💬 Fraud-language detection
* 🎭 Impersonation analysis
* 🔗 Suspicious platform/URL detection
* 📊 Explainable risk scoring
* 🔎 Evidence and detection breakdown
* 📈 Investigation dashboard
* 📄 Automated investigation report
* 🛟 Fallback mechanisms for API/ML failures

---

## 🔄 Demo Workflow

```mermaid
flowchart TD
    A["🎥 Suspicious Investment Video / Message"] --> B["🔍 Multimodal Detection"]

    B --> B1["🎥 Deepfake Detection"]
    B --> B2["🎙️ Audio Analysis"]
    B --> B3["💬 Fraud Language Analysis"]
    B --> B4["🎭 Impersonation Analysis"]
    B --> B5["🔗 Platform / URL Analysis"]

    B1 --> C["🔀 Signal Fusion"]
    B2 --> C
    B3 --> C
    B4 --> C
    B5 --> C

    C --> D["⚖️ Risk Engine"]
    D --> E["🔴 91 / 100 - CRITICAL"]
    E --> F["💡 Evidence + Explanation"]
    F --> G["📄 Investigation Report"]
```

### 🎬 Example Result

```text
Suspicious Investment Video / Message
                ↓
       Multimodal Detection
                ↓
          Signal Fusion
                ↓
          Risk Calculation
                ↓
       🔴 91/100 — CRITICAL
                ↓
      Evidence + Explanation
                ↓
       Investigation Report
```

---

## 🛡️ Reliability & Fallbacks

FroudFuse AI is designed to keep the demo functional even when individual components fail.

| Failure            | Fallback                |
| ------------------ | ----------------------- |
| 🤖 ML failure      | Precomputed/demo result |
| 🌐 API failure     | Local URL analysis      |
| 🧠 MCP failure     | Normal REST API flow    |
| 📡 Network failure | Local demo case         |

> **Golden Rule: The main end-to-end demo must remain functional.**

---

## 🎯 Success Criteria

FroudFuse AI is demo-ready when:

* ✅ End-to-end analysis works
* ✅ Video/text analysis produces results
* ✅ Risk score is calculated correctly
* ✅ Evidence is displayed
* ✅ Explanation is generated
* ✅ Data is stored in Supabase
* ✅ Dashboard displays the investigation
* ✅ Report can be generated
* ✅ At least one fallback works

---

## 🚀 Development Principle

> **BUILD LESS. INTEGRATE EARLY. KEEP THE MAIN DEMO WORKING.**

The system prioritizes a functional end-to-end investigation pipeline over unnecessary features or complexity.

---

## 🏆 What Makes FroudFuse AI Different?

FroudFuse AI does not depend on a single detection method.

It **fuses multiple independent signals** to create a more informative risk assessment:

```text
🎥 Video
   +
🎙️ Audio
   +
💬 Message
   +
🎭 Identity
   +
🔗 Platform
       ↓
🔀 Signal Fusion
       ↓
⚖️ Risk Score
       ↓
💡 Evidence-Based Explanation
```

### ⭐ Key Differentiators

* **Multimodal Analysis** — Analyze different types of suspicious content
* **Signal Fusion** — Combine multiple detection signals
* **Explainable Results** — Show evidence and reasons behind the score
* **Impersonation Detection** — Identify suspicious identity claims
* **Platform Intelligence** — Analyze suspicious investment URLs
* **Fallback-First Design** — Keep the core demo functional

---

## 🔎 Evidence-Based Investigation

FroudFuse AI does not simply display **"Fraud Detected."**

It explains **why the content is suspicious**.

### Example

```text
🔴 Risk Score: 91 / 100
🚨 Risk Level: CRITICAL

Reasons:
• Guaranteed-return language detected
• Urgent payment request identified
• Potential advisor impersonation detected
• Suspicious trading platform detected
• Deepfake indicators detected

Evidence:
• Suspicious message phrases
• Platform risk indicators
• Suspicious video frames
• Identity mismatch signals
```

---

## 📄 Investigation Report

The system generates a structured investigation report containing:

* 🆔 Case information
* 📥 Input details
* 🔍 Detection results
* 📊 Component risk scores
* 🚦 Overall risk level
* 🔎 Supporting evidence
* 💡 Explanation
* 🛡️ Recommended action

---

## 🔐 Security & Privacy

FroudFuse AI follows a security-conscious approach:

* 🔒 Authentication through Supabase
* 📦 Controlled media storage
* 🛡️ API-based backend access
* 🔎 Evidence-based analysis
* ⚠️ Risk scores are intended for screening and decision support
* 🚫 No automatic legal fraud declaration

---

## 🔮 Future Scope

FroudFuse AI can be extended with:

* 📱 Mobile and browser integration
* 🎙️ Advanced voice-cloning detection
* 🎥 Improved deepfake detection
* 🌍 Regional-language scam detection
* 📡 Real-time threat intelligence
* 🧠 Advanced multimodal AI models
* 🔗 Integration with financial safety and reporting platforms
* 📈 Continuous scam intelligence updates

---

## 🤝 Team

Built as a hackathon project focused on:

**FinTech • Cybersecurity • Artificial Intelligence • Investor Protection**

### Team Contributions

* 👨‍💻 **Tech Lead** — Backend, database, integration, risk engine & deployment
* 🤖 **ML Engineer** — Deepfake, audio, NLP & fraud detection
* 🎨 **Frontend Engineer** — Dashboard, investigation UI & results
* 🧪 **Product / QA** — Testing, demo cases, documentation & presentation

---

## ⚠️ Disclaimer

FroudFuse AI is an **AI-assisted screening and decision-support platform**.

A high-risk score indicates that the analyzed content contains suspicious signals. It **does not legally establish that a person, organization, platform, or communication is fraudulent**.

Users should independently verify financial advice, identities, registrations, and investment opportunities before making financial decisions.

---

## 🛡️ FroudFuse AI

> ### **Detect suspicious signals. Explain the risk. Protect the investor.**
