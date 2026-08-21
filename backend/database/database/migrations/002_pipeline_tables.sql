-- =============================================================================
-- migrations/002_pipeline_tables.sql
-- AI Investor Fraud & Impersonation Detection Platform
-- SIH Hackathon | PS13 Fintech / Smart Education
--
-- Migration 002 — Adds the four new pipeline tables and extends two existing
-- ones. Safe to run on a DB that already has 001_initial_schema applied.
--
-- What this migration does:
--   NEW TABLES  : detections, platform_checks, risk_scores, reports
--   MODIFIED    : impersonation_checks (new columns added, no columns removed)
--   MODIFIED    : evidence (new columns: mime_type, file_size_bytes, metadata)
--   MODIFIED    : detection_cases (risk_level CHECK extended with 'CRITICAL')
--   NEW INDEXES : for all new tables + impersonation_checks.registration_number
--
-- How to apply:
--   Supabase SQL Editor: paste and run
--   psql: psql $DATABASE_URL -f migrations/002_pipeline_tables.sql
-- =============================================================================

CREATE TABLE IF NOT EXISTS schema_migrations (
    version    TEXT        PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM schema_migrations WHERE version = '002_pipeline_tables'
    ) THEN
        RAISE NOTICE 'Migration 002_pipeline_tables already applied — skipping.';
        RETURN;
    END IF;

    -- ── 1. Extend detection_cases: add CRITICAL to risk_level CHECK ───────────
    -- DROP + recreate the constraint (PostgreSQL does not support ALTER CHECK).
    -- Only do this if the constraint exists under its auto-generated name.
    -- The safest approach for Supabase: drop and re-add using ALTER TABLE.
    BEGIN
        ALTER TABLE detection_cases DROP CONSTRAINT IF EXISTS detection_cases_risk_level_check;
        ALTER TABLE detection_cases
            ADD CONSTRAINT detection_cases_risk_level_check
            CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'UNKNOWN'));
    EXCEPTION WHEN others THEN
        RAISE NOTICE 'Could not update risk_level CHECK — may already be correct.';
    END;

    -- ── 2. Extend evidence: new optional columns ──────────────────────────────
    ALTER TABLE evidence
        ADD COLUMN IF NOT EXISTS mime_type        TEXT,
        ADD COLUMN IF NOT EXISTS file_size_bytes  BIGINT,
        ADD COLUMN IF NOT EXISTS metadata         JSONB DEFAULT '{}';

    -- ── 3. Extend impersonation_checks: new columns ───────────────────────────
    ALTER TABLE impersonation_checks
        ADD COLUMN IF NOT EXISTS claimed_role               TEXT,
        ADD COLUMN IF NOT EXISTS claimed_organization       TEXT,
        ADD COLUMN IF NOT EXISTS registration_number        TEXT,
        ADD COLUMN IF NOT EXISTS registration_status        TEXT,
        ADD COLUMN IF NOT EXISTS signals                    JSONB DEFAULT '{}';

    -- Add registration_status CHECK if column was just created
    BEGIN
        ALTER TABLE impersonation_checks
            ADD CONSTRAINT ic_registration_status_check
            CHECK (registration_status IN (
                'verified', 'not_found', 'expired', 'pending'
            ));
    EXCEPTION WHEN duplicate_object THEN
        NULL;  -- constraint already exists
    END;

    -- ── 4. NEW TABLE: detections ──────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS detections (
        id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        case_id        UUID         NOT NULL REFERENCES detection_cases(id) ON DELETE CASCADE,
        detection_type TEXT         NOT NULL
                           CHECK (detection_type IN (
                               'deepfake', 'audio', 'fraud_language',
                               'impersonation', 'platform', 'url', 'other'
                           )),
        score          NUMERIC(6,4),
        confidence     NUMERIC(6,4),
        label          TEXT,
        signals        JSONB DEFAULT '{}',
        evidence       JSONB DEFAULT '{}',
        created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- ── 5. NEW TABLE: platform_checks ────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS platform_checks (
        id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        case_id           UUID         NOT NULL REFERENCES detection_cases(id) ON DELETE CASCADE,
        url               TEXT,
        domain            TEXT,
        api_score         NUMERIC(6,4),
        local_check_score NUMERIC(6,4),
        final_score       NUMERIC(6,4),
        signals           JSONB DEFAULT '{}',
        created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- ── 6. NEW TABLE: risk_scores ─────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS risk_scores (
        id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        case_id               UUID         NOT NULL UNIQUE
                                  REFERENCES detection_cases(id) ON DELETE CASCADE,
        deepfake_score        NUMERIC(5,2),
        audio_score           NUMERIC(5,2),
        fraud_language_score  NUMERIC(5,2),
        impersonation_score   NUMERIC(5,2),
        platform_score        NUMERIC(5,2),
        overall_score         NUMERIC(5,2) NOT NULL DEFAULT 0
                                  CHECK (overall_score >= 0 AND overall_score <= 100),
        risk_level            TEXT         NOT NULL DEFAULT 'UNKNOWN'
                                  CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'UNKNOWN')),
        explanation           JSONB DEFAULT '{}',
        created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- ── 7. NEW TABLE: reports ─────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS reports (
        id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        case_id         UUID        NOT NULL UNIQUE
                            REFERENCES detection_cases(id) ON DELETE CASCADE,
        summary         TEXT,
        risk_level      TEXT
                            CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'UNKNOWN')),
        recommendations JSONB DEFAULT '{}',
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- ── 8. Indexes for new tables ─────────────────────────────────────────────
    CREATE INDEX IF NOT EXISTS idx_det_case_id    ON detections(case_id);
    CREATE INDEX IF NOT EXISTS idx_det_type       ON detections(detection_type);
    CREATE INDEX IF NOT EXISTS idx_det_created_at ON detections(created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_pc_case_id     ON platform_checks(case_id);
    CREATE INDEX IF NOT EXISTS idx_pc_domain      ON platform_checks(domain);
    CREATE INDEX IF NOT EXISTS idx_pc_created_at  ON platform_checks(created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_rs_case_id     ON risk_scores(case_id);
    CREATE INDEX IF NOT EXISTS idx_rs_risk_level  ON risk_scores(risk_level);
    CREATE INDEX IF NOT EXISTS idx_rs_created_at  ON risk_scores(created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_rep_case_id    ON reports(case_id);
    CREATE INDEX IF NOT EXISTS idx_rep_created_at ON reports(created_at DESC);

    -- Extended index for impersonation_checks
    CREATE INDEX IF NOT EXISTS idx_imp_reg_number ON impersonation_checks(registration_number);
    CREATE INDEX IF NOT EXISTS idx_imp_created_at ON impersonation_checks(created_at DESC);

    -- ── 9. Record migration ───────────────────────────────────────────────────
    INSERT INTO schema_migrations (version) VALUES ('002_pipeline_tables');
    RAISE NOTICE 'Migration 002_pipeline_tables applied successfully.';
END;
$$;

-- =============================================================================
-- End of 002_pipeline_tables.sql
-- =============================================================================
