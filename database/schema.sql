-- =============================================================================
-- AI Investor Fraud & Impersonation Detection Platform
-- SIH Hackathon | PS13 Fintech / Smart Education
--
-- schema.sql — Complete schema snapshot.
-- Run ONCE on a fresh Supabase/PostgreSQL database.
-- For incremental updates to an existing DB, use migrations/ instead.
--
-- Pipeline this schema supports:
--   Video/Audio/Text → Detection → Signal Fusion → Risk Engine
--   → Explanation → Report → Alert
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================================================
-- TABLE: users
-- Platform users (investors, analysts, admins).
-- Unchanged from previous version.
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT        NOT NULL,
    email      TEXT        NOT NULL UNIQUE,
    role       TEXT        NOT NULL DEFAULT 'investor'
                   CHECK (role IN ('investor', 'analyst', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  users      IS 'Platform users: investors who submit cases, analysts who review them.';
COMMENT ON COLUMN users.role IS 'investor | analyst | admin';

-- =============================================================================
-- TABLE: detection_cases
-- One row per fraud-analysis request. Acts as the anchor for the entire
-- pipeline. Summary fields (prediction, risk_score, risk_level) are
-- denormalised cache values kept in sync by the backend after risk_scores
-- is written — saves an extra join on every dashboard load.
-- =============================================================================
CREATE TABLE IF NOT EXISTS detection_cases (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID         REFERENCES users(id) ON DELETE SET NULL,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    -- Submitted content type
    source_type      TEXT         NOT NULL
                         CHECK (source_type IN ('video', 'audio', 'text', 'chat', 'app', 'url')),

    -- Denormalised summary (written last, after risk_scores is computed)
    prediction       TEXT         NOT NULL DEFAULT 'PENDING'
                         CHECK (prediction IN (
                             'PENDING', 'DEEPFAKE', 'AUTHENTIC',
                             'IMPERSONATION', 'SUSPICIOUS', 'SAFE'
                         )),
    confidence_score NUMERIC(5,4) NOT NULL DEFAULT 0
                         CHECK (confidence_score >= 0 AND confidence_score <= 1),
    risk_score       NUMERIC(5,2) NOT NULL DEFAULT 0
                         CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level       TEXT         NOT NULL DEFAULT 'UNKNOWN'
                         CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'UNKNOWN')),

    -- Lifecycle state
    status           TEXT         NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'processing', 'processed', 'flagged', 'cleared')),

    -- Human-readable one-liner from the Explanation Engine
    summary          TEXT
);

COMMENT ON TABLE  detection_cases                  IS 'Central fraud-analysis case — anchor for the full detection pipeline.';
COMMENT ON COLUMN detection_cases.confidence_score IS 'Top-level ML confidence 0.0-1.0 (denormalised from risk_scores).';
COMMENT ON COLUMN detection_cases.risk_score       IS 'Overall risk 0-100 (denormalised from risk_scores.overall_score).';
COMMENT ON COLUMN detection_cases.risk_level       IS 'Derived tier: LOW | MEDIUM | HIGH | CRITICAL.';
COMMENT ON COLUMN detection_cases.prediction       IS 'Top prediction label (denormalised cache for fast dashboard queries).';

-- =============================================================================
-- TABLE: evidence
-- Metadata for every piece of submitted evidence.
-- Stores Supabase Storage paths for binary files, raw text for chat/URL.
-- Extended: added mime_type, file_size_bytes, metadata JSONB.
-- =============================================================================
CREATE TABLE IF NOT EXISTS evidence (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    detection_case_id    UUID        REFERENCES detection_cases(id) ON DELETE CASCADE,
    case_id              UUID        REFERENCES cases(id)           ON DELETE CASCADE, -- legacy

    evidence_type        TEXT        NOT NULL
                             CHECK (evidence_type IN (
                                 'video_file', 'audio_file', 'image_file',
                                 'chat_message', 'text_document', 'url', 'app_url'
                             )),

    -- Supabase Storage path for files; raw content for text/URL
    file_path_or_content TEXT        NOT NULL,

    -- Display name
    filename             TEXT,

    -- Media metadata (new)
    mime_type            TEXT,                  -- e.g. 'video/mp4', 'audio/wav'
    file_size_bytes      BIGINT,                -- bytes; NULL for raw-text evidence
    metadata             JSONB DEFAULT '{}',    -- optional extra: duration_s, resolution, etc.

    uploaded_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  evidence                       IS 'Evidence items attached to a detection case.';
COMMENT ON COLUMN evidence.file_path_or_content  IS 'Supabase Storage path for binary files; raw text for chat/URL evidence.';
COMMENT ON COLUMN evidence.metadata              IS 'Optional media metadata: duration_s, resolution, frame_count, etc.';

-- =============================================================================
-- TABLE: detections
-- Individual signals produced by each detection engine.
-- Replaces the legacy "signals" table for new-pipeline code.
-- Multiple detections can exist per case (one per engine / chunk).
-- =============================================================================
CREATE TABLE IF NOT EXISTS detections (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id        UUID         NOT NULL REFERENCES detection_cases(id) ON DELETE CASCADE,

    -- Which engine produced this signal
    detection_type TEXT         NOT NULL
                       CHECK (detection_type IN (
                           'deepfake', 'audio', 'fraud_language',
                           'impersonation', 'platform', 'url', 'other'
                       )),

    -- Scores (all nullable — not every engine produces all three)
    score          NUMERIC(6,4),  -- normalised 0.0-1.0
    confidence     NUMERIC(6,4),  -- model confidence 0.0-1.0
    label          TEXT,          -- e.g. 'DEEPFAKE', 'REAL', 'SUSPICIOUS'

    -- Full structured engine output
    signals        JSONB DEFAULT '{}',   -- per-frame scores, token highlights, etc.
    evidence       JSONB DEFAULT '{}',   -- which evidence items this detection references

    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  detections                IS 'Per-engine detection signals feeding the Signal Fusion / Risk Engine.';
COMMENT ON COLUMN detections.detection_type IS 'deepfake | audio | fraud_language | impersonation | platform | url | other';
COMMENT ON COLUMN detections.score          IS 'Normalised signal score 0.0-1.0.';
COMMENT ON COLUMN detections.signals        IS 'Full engine output (per-frame scores, flagged phrases, etc.).';
COMMENT ON COLUMN detections.evidence       IS 'References to evidence items that contributed to this detection.';

-- =============================================================================
-- TABLE: impersonation_checks
-- NLP/text engine impersonation analysis.
-- Extended: added claimed_role, claimed_organization, registration_number,
--           registration_status, signals JSONB.
--           Old columns (urgency_score, impersonation_score, prediction, flags)
--           are kept for backwards compatibility.
-- =============================================================================
CREATE TABLE IF NOT EXISTS impersonation_checks (
    id                          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    detection_case_id           UUID         NOT NULL REFERENCES detection_cases(id) ON DELETE CASCADE,

    -- Identity claimed by the suspect
    claimed_name                TEXT,
    claimed_role                TEXT,               -- e.g. 'SEBI-Registered Investment Advisor'
    claimed_organization        TEXT,               -- e.g. 'Motilal Oswal Securities'

    -- Registration verification
    registration_number         TEXT,               -- preferred column name
    claimed_registration_number TEXT,               -- kept for backwards compat (alias)
    registration_status         TEXT                -- 'verified' | 'not_found' | 'expired' | 'pending'
                                    CHECK (registration_status IN (
                                        'verified', 'not_found', 'expired', 'pending', NULL
                                    )),

    -- Scores (0.0-1.0)
    urgency_score               NUMERIC(4,3) NOT NULL DEFAULT 0
                                    CHECK (urgency_score >= 0 AND urgency_score <= 1),
    impersonation_score         NUMERIC(4,3) NOT NULL DEFAULT 0
                                    CHECK (impersonation_score >= 0 AND impersonation_score <= 1),

    -- Final verdict
    prediction                  TEXT         NOT NULL DEFAULT 'PENDING'
                                    CHECK (prediction IN (
                                        'PENDING', 'IMPERSONATION', 'SUSPICIOUS', 'LEGITIMATE'
                                    )),

    -- Structured signals from the NLP engine
    signals                     JSONB DEFAULT '{}',
    -- Example:
    -- { "guaranteed_returns": true, "urgency_language": true,
    --   "sebi_claim_unverified": true, "direct_payment_request": true }

    -- Legacy boolean flags (kept for backward compat)
    flags                       JSONB DEFAULT '{}',

    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  impersonation_checks                    IS 'NLP-engine output for text/chat analysed for impersonation patterns.';
COMMENT ON COLUMN impersonation_checks.registration_number IS 'SEBI/AMFI registration number claimed by the suspect.';
COMMENT ON COLUMN impersonation_checks.signals             IS 'Structured NLP signal output.';

-- =============================================================================
-- TABLE: platform_checks
-- URL / trading-platform analysis combining external API + local fallback.
-- =============================================================================
CREATE TABLE IF NOT EXISTS platform_checks (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id           UUID         NOT NULL REFERENCES detection_cases(id) ON DELETE CASCADE,

    -- What was checked
    url               TEXT,
    domain            TEXT,

    -- Scores (NULL if the source was unavailable)
    api_score         NUMERIC(6,4),  -- score from external threat-intel API (0.0-1.0)
    local_check_score NUMERIC(6,4),  -- score from local heuristics (0.0-1.0)
    final_score       NUMERIC(6,4),  -- combined/weighted final score (0.0-1.0)

    -- Full structured output from both sources
    signals           JSONB DEFAULT '{}',
    -- Example:
    -- { "domain_age_days": 14, "ssl_valid": true, "whois_privacy": true,
    --   "typosquat_target": "sebi.gov.in", "typosquat_similarity": 0.71,
    --   "blacklist_hit": false, "api_source": "virustotal" }

    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  platform_checks               IS 'URL/domain platform analysis from external API + local heuristics.';
COMMENT ON COLUMN platform_checks.api_score     IS 'Score returned by external threat-intel API (e.g. VirusTotal, SEBI TRIP).';
COMMENT ON COLUMN platform_checks.local_check_score IS 'Score from local heuristics (WHOIS age, typosquatting, SSL, etc.).';
COMMENT ON COLUMN platform_checks.final_score   IS 'Weighted combination sent to the Risk Engine.';

-- =============================================================================
-- TABLE: risk_scores
-- Final output of the Risk Engine / Signal Fusion layer.
-- One row per pipeline run for a case (backend can upsert on case_id).
-- =============================================================================
CREATE TABLE IF NOT EXISTS risk_scores (
    id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id               UUID         NOT NULL UNIQUE
                              REFERENCES detection_cases(id) ON DELETE CASCADE,

    -- Per-engine component scores (0-100, NULL if that engine did not run)
    deepfake_score        NUMERIC(5,2),
    audio_score           NUMERIC(5,2),
    fraud_language_score  NUMERIC(5,2),
    impersonation_score   NUMERIC(5,2),
    platform_score        NUMERIC(5,2),

    -- Aggregated output
    overall_score         NUMERIC(5,2) NOT NULL DEFAULT 0
                              CHECK (overall_score >= 0 AND overall_score <= 100),
    risk_level            TEXT         NOT NULL DEFAULT 'UNKNOWN'
                              CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'UNKNOWN')),

    -- Explanation Engine output
    explanation           JSONB DEFAULT '{}',
    -- Suggested structure:
    -- {
    --   "why_flagged":   "...",
    --   "top_signals":   [...],
    --   "what_action":   "...",
    --   "weights_used":  { "deepfake": 0.40, "audio": 0.20, ... }
    -- }

    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  risk_scores                 IS 'Risk Engine / Signal Fusion output. One row per detection case.';
COMMENT ON COLUMN risk_scores.overall_score   IS 'Weighted aggregate risk score 0-100.';
COMMENT ON COLUMN risk_scores.explanation     IS 'Explanation Engine JSON: why_flagged, top_signals, what_action, weights_used.';

-- =============================================================================
-- TABLE: reports
-- Final human-readable investigation report generated from the Risk Engine.
-- =============================================================================
CREATE TABLE IF NOT EXISTS reports (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id         UUID        NOT NULL UNIQUE
                        REFERENCES detection_cases(id) ON DELETE CASCADE,

    summary         TEXT,               -- brief paragraph summary
    risk_level      TEXT
                        CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'UNKNOWN')),
    recommendations JSONB DEFAULT '{}', -- list of recommended investor actions
    -- Example:
    -- { "actions": [
    --     "Do not act on the investment advice in this video.",
    --     "Report to SEBI Investor Helpline: 1800-266-7575",
    --     "File complaint at cybercrime.gov.in"
    --   ],
    --   "regulatory_refs": ["SEBI Circular CIR/MIRSD/...", ...]
    -- }

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  reports                 IS 'Final investigation report produced by the Explanation Engine for each case.';
COMMENT ON COLUMN reports.recommendations IS 'JSON list of recommended actions + regulatory references.';

-- =============================================================================
-- TABLE: alerts
-- Auto-generated notification when risk_level is HIGH or CRITICAL.
-- Unchanged from previous version.
-- =============================================================================
CREATE TABLE IF NOT EXISTS alerts (
    id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    detection_case_id  UUID        NOT NULL REFERENCES detection_cases(id) ON DELETE CASCADE,
    alert_type         TEXT        NOT NULL
                           CHECK (alert_type IN (
                               'DEEPFAKE_DETECTED',
                               'IMPERSONATION_DETECTED',
                               'HIGH_RISK_CONTENT',
                               'SUSPICIOUS_ACTIVITY',
                               'PLATFORM_URL_FLAGGED',
                               'SCAM_NLP_DETECTED'
                           )),
    severity           TEXT        NOT NULL
                           CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    message            TEXT        NOT NULL,
    is_read            BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  alerts           IS 'Alerts auto-generated for HIGH/CRITICAL risk cases.';
COMMENT ON COLUMN alerts.is_read   IS 'TRUE once a user/analyst has viewed the alert.';

-- =============================================================================
-- LEGACY TABLES — kept for backwards compatibility with existing db.py helpers
-- =============================================================================

CREATE TABLE IF NOT EXISTS cases (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at   TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
    submitted_by TEXT        NOT NULL,
    source_type  TEXT        NOT NULL
                     CHECK (source_type IN ('video', 'audio', 'chat_text', 'url')),
    status       TEXT        NOT NULL    DEFAULT 'pending'
                     CHECK (status IN ('pending', 'processed', 'flagged', 'cleared'))
);

CREATE TABLE IF NOT EXISTS signals (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id      UUID         NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    signal_type  TEXT         NOT NULL
                     CHECK (signal_type IN ('deepfake', 'impersonation', 'scam_nlp', 'platform_url')),
    signal_score NUMERIC(5,2) NOT NULL CHECK (signal_score >= 0 AND signal_score <= 100),
    raw_output   JSONB        NOT NULL DEFAULT '{}',
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS results (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id          UUID         NOT NULL UNIQUE REFERENCES cases(id) ON DELETE CASCADE,
    fraud_risk_score NUMERIC(5,2) NOT NULL CHECK (fraud_risk_score >= 0 AND fraud_risk_score <= 100),
    verdict          TEXT         NOT NULL CHECK (verdict IN ('low_risk', 'suspicious', 'high_risk')),
    explanation      JSONB        NOT NULL DEFAULT '{}',
    computed_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS logs (
    id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id            UUID        REFERENCES cases(id)           ON DELETE SET NULL,
    detection_case_id  UUID        REFERENCES detection_cases(id) ON DELETE SET NULL,
    event_type         TEXT        NOT NULL,
    message            TEXT        NOT NULL,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- users
CREATE INDEX IF NOT EXISTS idx_users_email             ON users(email);

-- detection_cases
CREATE INDEX IF NOT EXISTS idx_dc_user_id              ON detection_cases(user_id);
CREATE INDEX IF NOT EXISTS idx_dc_created_at           ON detection_cases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dc_status               ON detection_cases(status);
CREATE INDEX IF NOT EXISTS idx_dc_risk_level           ON detection_cases(risk_level);
CREATE INDEX IF NOT EXISTS idx_dc_prediction           ON detection_cases(prediction);

-- evidence
CREATE INDEX IF NOT EXISTS idx_evidence_dc_id          ON evidence(detection_case_id);
CREATE INDEX IF NOT EXISTS idx_evidence_case_id        ON evidence(case_id);

-- detections  (new)
CREATE INDEX IF NOT EXISTS idx_det_case_id             ON detections(case_id);
CREATE INDEX IF NOT EXISTS idx_det_type                ON detections(detection_type);
CREATE INDEX IF NOT EXISTS idx_det_created_at          ON detections(created_at DESC);

-- impersonation_checks
CREATE INDEX IF NOT EXISTS idx_imp_dc_id               ON impersonation_checks(detection_case_id);
CREATE INDEX IF NOT EXISTS idx_imp_reg_number          ON impersonation_checks(registration_number);
CREATE INDEX IF NOT EXISTS idx_imp_created_at          ON impersonation_checks(created_at DESC);

-- platform_checks  (new)
CREATE INDEX IF NOT EXISTS idx_pc_case_id              ON platform_checks(case_id);
CREATE INDEX IF NOT EXISTS idx_pc_domain               ON platform_checks(domain);
CREATE INDEX IF NOT EXISTS idx_pc_created_at           ON platform_checks(created_at DESC);

-- risk_scores  (new)
CREATE INDEX IF NOT EXISTS idx_rs_case_id              ON risk_scores(case_id);
CREATE INDEX IF NOT EXISTS idx_rs_risk_level           ON risk_scores(risk_level);
CREATE INDEX IF NOT EXISTS idx_rs_created_at           ON risk_scores(created_at DESC);

-- reports  (new)
CREATE INDEX IF NOT EXISTS idx_rep_case_id             ON reports(case_id);
CREATE INDEX IF NOT EXISTS idx_rep_created_at          ON reports(created_at DESC);

-- alerts
CREATE INDEX IF NOT EXISTS idx_alerts_case_id          ON alerts(detection_case_id);
CREATE INDEX IF NOT EXISTS idx_alerts_is_read          ON alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_alerts_severity         ON alerts(severity);

-- legacy
CREATE INDEX IF NOT EXISTS idx_cases_status            ON cases(status);
CREATE INDEX IF NOT EXISTS idx_signals_case_id         ON signals(case_id);
CREATE INDEX IF NOT EXISTS idx_results_case_id         ON results(case_id);
CREATE INDEX IF NOT EXISTS idx_logs_case_id            ON logs(case_id);
CREATE INDEX IF NOT EXISTS idx_logs_dc_id              ON logs(detection_case_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at         ON logs(created_at DESC);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Enable and uncomment the policy block below before any production deployment.
-- Security model: a user can only access their own detection_cases and all
-- child rows that belong to those cases.
-- =============================================================================

/*
-- ── Enable RLS ───────────────────────────────────────────────────────────────
ALTER TABLE users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE detection_cases      ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence             ENABLE ROW LEVEL SECURITY;
ALTER TABLE detections           ENABLE ROW LEVEL SECURITY;
ALTER TABLE impersonation_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_checks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_scores          ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports              ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts               ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases                ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals              ENABLE ROW LEVEL SECURITY;
ALTER TABLE results              ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs                 ENABLE ROW LEVEL SECURITY;

-- ── users: own row only ───────────────────────────────────────────────────────
CREATE POLICY "users_own_row"
    ON users FOR ALL
    USING (id = auth.uid());

-- ── detection_cases: own cases only ──────────────────────────────────────────
CREATE POLICY "dc_own_cases_select"
    ON detection_cases FOR SELECT
    USING (user_id = auth.uid());
CREATE POLICY "dc_own_cases_insert"
    ON detection_cases FOR INSERT
    WITH CHECK (user_id = auth.uid());
CREATE POLICY "dc_own_cases_update"
    ON detection_cases FOR UPDATE
    USING (user_id = auth.uid());

-- ── evidence: accessible if the parent case belongs to the user ───────────────
CREATE POLICY "evidence_via_case"
    ON evidence FOR ALL
    USING (
        detection_case_id IN (
            SELECT id FROM detection_cases WHERE user_id = auth.uid()
        )
    );

-- ── detections ────────────────────────────────────────────────────────────────
CREATE POLICY "detections_via_case"
    ON detections FOR ALL
    USING (
        case_id IN (SELECT id FROM detection_cases WHERE user_id = auth.uid())
    );

-- ── impersonation_checks ──────────────────────────────────────────────────────
CREATE POLICY "imp_checks_via_case"
    ON impersonation_checks FOR ALL
    USING (
        detection_case_id IN (
            SELECT id FROM detection_cases WHERE user_id = auth.uid()
        )
    );

-- ── platform_checks ───────────────────────────────────────────────────────────
CREATE POLICY "platform_checks_via_case"
    ON platform_checks FOR ALL
    USING (
        case_id IN (SELECT id FROM detection_cases WHERE user_id = auth.uid())
    );

-- ── risk_scores ───────────────────────────────────────────────────────────────
CREATE POLICY "risk_scores_via_case"
    ON risk_scores FOR ALL
    USING (
        case_id IN (SELECT id FROM detection_cases WHERE user_id = auth.uid())
    );

-- ── reports ───────────────────────────────────────────────────────────────────
CREATE POLICY "reports_via_case"
    ON reports FOR ALL
    USING (
        case_id IN (SELECT id FROM detection_cases WHERE user_id = auth.uid())
    );

-- ── alerts ────────────────────────────────────────────────────────────────────
CREATE POLICY "alerts_via_case"
    ON alerts FOR ALL
    USING (
        detection_case_id IN (
            SELECT id FROM detection_cases WHERE user_id = auth.uid()
        )
    );

-- ── Analyst/Admin override (read-all) ────────────────────────────────────────
-- Analysts and admins can read every case regardless of ownership.
-- Create a separate service-role policy or use a custom claim in JWT.
-- Example (adjust to your auth setup):
-- CREATE POLICY "analysts_read_all_cases"
--     ON detection_cases FOR SELECT
--     USING (
--         auth.jwt() ->> 'role' IN ('analyst', 'admin')
--     );
*/

-- =============================================================================
-- End of schema.sql
-- =============================================================================
