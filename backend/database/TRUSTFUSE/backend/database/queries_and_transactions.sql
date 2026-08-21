-- =============================================================================
-- queries_and_transactions.sql
-- AI Investor Fraud & Impersonation Detection Platform
-- SIH Hackathon | PS13 Fintech / Smart Education
--
-- Useful named queries for the backend API and dashboard.
-- Copy individual blocks into your FastAPI/SQLAlchemy code or run directly
-- in the Supabase SQL Editor for ad-hoc analysis.
-- =============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- Q1. Get all recent detection cases (most recent first)
--     Used by: GET /cases
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
    dc.id,
    dc.created_at,
    dc.source_type,
    dc.prediction,
    dc.confidence_score,
    dc.risk_score,
    dc.risk_level,
    dc.status,
    dc.summary,
    u.name  AS user_name,
    u.email AS user_email
FROM  detection_cases dc
LEFT JOIN users u ON u.id = dc.user_id
ORDER BY dc.created_at DESC
LIMIT 50;


-- ─────────────────────────────────────────────────────────────────────────────
-- Q2. Get all HIGH risk / flagged fraud cases
--     Used by: Dashboard "Fraud Alerts" panel, GET /cases?risk=HIGH
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
    dc.id,
    dc.created_at,
    dc.source_type,
    dc.prediction,
    dc.confidence_score,
    dc.risk_score,
    dc.risk_level,
    dc.status,
    dc.summary,
    u.name  AS user_name,
    u.email AS user_email
FROM  detection_cases dc
LEFT JOIN users u ON u.id = dc.user_id
WHERE dc.risk_level = 'HIGH'
  AND dc.status     = 'flagged'
ORDER BY dc.risk_score DESC, dc.created_at DESC;


-- ─────────────────────────────────────────────────────────────────────────────
-- Q3. Dashboard statistics — summary counts
--     Used by: GET /dashboard/stats
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
    COUNT(*)                                                          AS total_cases,
    COUNT(*) FILTER (WHERE risk_level = 'HIGH')                      AS high_risk_count,
    COUNT(*) FILTER (WHERE risk_level = 'MEDIUM')                    AS medium_risk_count,
    COUNT(*) FILTER (WHERE risk_level = 'LOW')                       AS low_risk_count,
    COUNT(*) FILTER (WHERE status = 'flagged')                       AS flagged_count,
    COUNT(*) FILTER (WHERE status = 'cleared')                       AS cleared_count,
    COUNT(*) FILTER (WHERE status = 'pending')                       AS pending_count,
    ROUND(AVG(risk_score), 2)                                        AS avg_risk_score,
    COUNT(*) FILTER (WHERE prediction = 'DEEPFAKE')                  AS deepfake_count,
    COUNT(*) FILTER (WHERE prediction IN ('SUSPICIOUS','IMPERSONATION')) AS suspicious_count,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') AS cases_last_24h
FROM detection_cases;


-- ─────────────────────────────────────────────────────────────────────────────
-- Q4. Count cases grouped by risk level
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
    risk_level,
    COUNT(*) AS case_count
FROM  detection_cases
GROUP BY risk_level
ORDER BY
    CASE risk_level
        WHEN 'HIGH'    THEN 1
        WHEN 'MEDIUM'  THEN 2
        WHEN 'LOW'     THEN 3
        ELSE 4
    END;


-- ─────────────────────────────────────────────────────────────────────────────
-- Q5. Count cases grouped by prediction type
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
    prediction,
    COUNT(*) AS case_count,
    ROUND(AVG(confidence_score) * 100, 1) AS avg_confidence_pct
FROM  detection_cases
GROUP BY prediction
ORDER BY case_count DESC;


-- ─────────────────────────────────────────────────────────────────────────────
-- Q6. Get a single detection case with all its evidence
--     Used by: GET /cases/:id
--     Replace :case_id with the actual UUID.
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
    dc.*,
    u.name          AS user_name,
    u.email         AS user_email,
    json_agg(
        json_build_object(
            'id',                   e.id,
            'evidence_type',        e.evidence_type,
            'file_path_or_content', e.file_path_or_content,
            'filename',             e.filename,
            'uploaded_at',          e.uploaded_at
        ) ORDER BY e.uploaded_at
    ) FILTER (WHERE e.id IS NOT NULL) AS evidence_list
FROM  detection_cases dc
LEFT JOIN users    u ON u.id = dc.user_id
LEFT JOIN evidence e ON e.detection_case_id = dc.id
WHERE dc.id = 'bbbbbbbb-0000-0000-0000-000000000001'  -- replace with :case_id
GROUP BY dc.id, u.name, u.email;


-- ─────────────────────────────────────────────────────────────────────────────
-- Q7. Get a detection case with its alerts
--     Used by: GET /cases/:id/alerts
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
    dc.id            AS case_id,
    dc.prediction,
    dc.risk_level,
    a.id             AS alert_id,
    a.alert_type,
    a.severity,
    a.message,
    a.is_read,
    a.created_at     AS alert_created_at
FROM  detection_cases dc
JOIN  alerts a ON a.detection_case_id = dc.id
WHERE dc.id = 'bbbbbbbb-0000-0000-0000-000000000001'  -- replace with :case_id
ORDER BY a.created_at DESC;


-- ─────────────────────────────────────────────────────────────────────────────
-- Q8. Get all UNREAD alerts (newest first)
--     Used by: GET /alerts?unread=true  (notification badge count)
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
    a.id,
    a.alert_type,
    a.severity,
    a.message,
    a.created_at,
    dc.source_type,
    dc.prediction,
    dc.risk_score,
    u.name  AS user_name,
    u.email AS user_email
FROM  alerts a
JOIN  detection_cases dc ON dc.id = a.detection_case_id
LEFT JOIN users u ON u.id = dc.user_id
WHERE a.is_read = FALSE
ORDER BY
    CASE a.severity
        WHEN 'CRITICAL' THEN 1
        WHEN 'HIGH'     THEN 2
        WHEN 'MEDIUM'   THEN 3
        ELSE 4
    END,
    a.created_at DESC;


-- ─────────────────────────────────────────────────────────────────────────────
-- Q9. Get a specific user's detection history
--     Used by: GET /users/:user_id/cases
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
    dc.id,
    dc.created_at,
    dc.source_type,
    dc.prediction,
    dc.risk_level,
    dc.risk_score,
    dc.status,
    dc.summary,
    (SELECT COUNT(*) FROM alerts a WHERE a.detection_case_id = dc.id)          AS alert_count,
    (SELECT COUNT(*) FROM evidence e WHERE e.detection_case_id = dc.id)        AS evidence_count
FROM  detection_cases dc
WHERE dc.user_id = 'aaaaaaaa-0000-0000-0000-000000000001'  -- replace with :user_id
ORDER BY dc.created_at DESC;


-- =============================================================================
-- TRANSACTION: Safe end-to-end case creation with alert generation
-- Used by: POST /detect  (backend calls this after ML engines return scores)
-- Parameters to substitute:
--   :user_id, :source_type, :prediction, :confidence_score,
--   :risk_score, :risk_level, :summary,
--   :evidence_type, :file_path_or_content, :filename
-- =============================================================================

BEGIN;

    -- Step 1: Insert the detection case
    WITH new_case AS (
        INSERT INTO detection_cases (
            user_id,
            source_type,
            prediction,
            confidence_score,
            risk_score,
            risk_level,
            status,
            summary
        ) VALUES (
            'aaaaaaaa-0000-0000-0000-000000000001',  -- :user_id
            'video',                                  -- :source_type
            'DEEPFAKE',                               -- :prediction
            0.8800,                                   -- :confidence_score  (0.0–1.0)
            82.50,                                    -- :risk_score        (0–100)
            'HIGH',                                   -- :risk_level
            'processing',
            'Deepfake face-swap detected with 88% confidence in submitted video.'  -- :summary
        )
        RETURNING id, risk_level
    ),

    -- Step 2: Attach evidence metadata
    new_evidence AS (
        INSERT INTO evidence (detection_case_id, evidence_type, file_path_or_content, filename)
        SELECT
            id,
            'video_file',                                        -- :evidence_type
            'evidence/' || id || '/sample.mp4',                  -- :file_path_or_content
            'sample.mp4'                                         -- :filename
        FROM new_case
        RETURNING detection_case_id
    ),

    -- Step 3: Update status to 'processed' after evidence is stored
    updated_case AS (
        UPDATE detection_cases
        SET status = 'flagged'
        WHERE id = (SELECT detection_case_id FROM new_evidence)
          AND risk_level = 'HIGH'
        RETURNING id, risk_level
    )

    -- Step 4: Generate alert if HIGH risk
    INSERT INTO alerts (detection_case_id, alert_type, severity, message)
    SELECT
        id,
        'DEEPFAKE_DETECTED',
        'HIGH',
        'A submitted video was flagged as a deepfake (88% confidence). Risk score: 82.5. Immediate review required.'
    FROM updated_case
    WHERE risk_level = 'HIGH';

COMMIT;

-- If any step fails, the entire transaction rolls back automatically.
-- In Python (supabase-py), use an RPC function or psycopg2 for raw transactions.


-- =============================================================================
-- UTILITY: Mark an alert as read
-- Used by: PATCH /alerts/:alert_id/read
-- =============================================================================
UPDATE alerts
SET    is_read = TRUE
WHERE  id = 'replace-with-alert-uuid';


-- =============================================================================
-- UTILITY: Dashboard 7-day trend (cases per day)
-- =============================================================================
SELECT
    DATE(created_at AT TIME ZONE 'Asia/Kolkata') AS day,
    COUNT(*)                                      AS total,
    COUNT(*) FILTER (WHERE risk_level = 'HIGH')  AS high_risk,
    COUNT(*) FILTER (WHERE prediction = 'DEEPFAKE') AS deepfakes
FROM  detection_cases
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY day
ORDER BY day;


-- =============================================================================
-- UTILITY: Impersonation stats for text/chat cases
-- =============================================================================
SELECT
    ic.prediction,
    COUNT(*)                           AS count,
    ROUND(AVG(ic.impersonation_score), 3) AS avg_impersonation_score,
    ROUND(AVG(ic.urgency_score), 3)       AS avg_urgency_score
FROM  impersonation_checks ic
GROUP BY ic.prediction
ORDER BY count DESC;


-- =============================================================================
-- End of existing queries
-- =============================================================================


-- =============================================================================
-- DASHBOARD: Aggregate stats for chart widgets
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- Q10. Fraud reports grouped by prediction type (for pie/bar chart)
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
    prediction,
    COUNT(*)                                    AS total,
    ROUND(AVG(risk_score), 2)                   AS avg_risk_score,
    ROUND(AVG(confidence_score) * 100, 1)       AS avg_confidence_pct
FROM  detection_cases
GROUP BY prediction
ORDER BY total DESC;


-- ─────────────────────────────────────────────────────────────────────────────
-- Q11. Fraud reports grouped by status
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
    status,
    COUNT(*) AS total
FROM  detection_cases
GROUP BY status
ORDER BY total DESC;


-- ─────────────────────────────────────────────────────────────────────────────
-- Q12. Fraud reports grouped by risk level (severity)
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
    risk_level,
    COUNT(*) AS total
FROM  detection_cases
GROUP BY risk_level
ORDER BY
    CASE risk_level
        WHEN 'HIGH'    THEN 1
        WHEN 'MEDIUM'  THEN 2
        WHEN 'LOW'     THEN 3
        ELSE 4
    END;


-- ─────────────────────────────────────────────────────────────────────────────
-- Q13. Fraud reports over time (30-day trend, daily buckets)
--      Used by: timeline/area chart
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
    DATE(created_at AT TIME ZONE 'Asia/Kolkata') AS report_date,
    COUNT(*)                                      AS total_reports,
    COUNT(*) FILTER (WHERE risk_level = 'HIGH')  AS high_risk,
    COUNT(*) FILTER (WHERE prediction = 'DEEPFAKE') AS deepfakes,
    ROUND(AVG(risk_score), 2)                     AS avg_risk_score
FROM  detection_cases
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY report_date
ORDER BY report_date ASC;


-- ─────────────────────────────────────────────────────────────────────────────
-- Q14. Top suspicious source types (for horizontal bar chart)
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
    source_type,
    COUNT(*)                               AS total_cases,
    COUNT(*) FILTER (WHERE risk_level = 'HIGH') AS high_risk_cases,
    ROUND(AVG(risk_score), 2)             AS avg_risk_score
FROM  detection_cases
GROUP BY source_type
ORDER BY total_cases DESC;


-- ─────────────────────────────────────────────────────────────────────────────
-- Q15. Average risk score overall and per prediction type
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
    'overall'               AS scope,
    ROUND(AVG(risk_score), 2) AS avg_risk_score,
    COUNT(*)                AS total
FROM  detection_cases
UNION ALL
SELECT
    prediction              AS scope,
    ROUND(AVG(risk_score), 2),
    COUNT(*)
FROM  detection_cases
GROUP BY prediction
ORDER BY scope;


-- =============================================================================
-- FRAUD CASES QUERIES
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- Q16. Get all fraud cases with detection summary and investigator details
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
    fc.id,
    fc.case_number,
    fc.priority,
    fc.status,
    fc.investigation_notes,
    fc.opened_at,
    fc.updated_at,
    fc.closed_at,

    dc.source_type,
    dc.prediction,
    dc.risk_score,
    dc.risk_level,
    dc.summary         AS detection_summary,

    u.name             AS investigator_name,
    u.email            AS investigator_email
FROM  fraud_cases fc
JOIN  detection_cases dc ON dc.id = fc.detection_case_id
LEFT JOIN users u         ON u.id  = fc.assigned_to
ORDER BY fc.opened_at DESC;


-- ─────────────────────────────────────────────────────────────────────────────
-- Q17. Get all HIGH and CRITICAL priority open/investigating cases
--      Used by: dashboard "Priority Cases" widget
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
    fc.case_number,
    fc.priority,
    fc.status,
    dc.prediction,
    dc.risk_score,
    dc.risk_level,
    u.name AS investigator_name
FROM  fraud_cases fc
JOIN  detection_cases dc ON dc.id = fc.detection_case_id
LEFT JOIN users u         ON u.id  = fc.assigned_to
WHERE fc.priority IN ('high', 'critical')
  AND fc.status   IN ('open', 'investigating', 'escalated')
ORDER BY
    CASE fc.priority
        WHEN 'critical' THEN 1
        WHEN 'high'     THEN 2
        ELSE 3
    END,
    fc.opened_at DESC;


-- ─────────────────────────────────────────────────────────────────────────────
-- Q18. Assign an investigator to a fraud case
--      Used by: PATCH /api/cases/:id  (assigned_to update)
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE fraud_cases
SET    assigned_to = 'aaaaaaaa-0000-0000-0000-000000000003',  -- replace with :user_id
       status      = 'investigating',
       updated_at  = NOW()
WHERE  id = 'cccccccc-0000-0000-0000-000000000003';           -- replace with :case_id


-- ─────────────────────────────────────────────────────────────────────────────
-- Q19. Close a fraud case
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE fraud_cases
SET    status    = 'closed',
       closed_at = NOW(),
       updated_at = NOW()
WHERE  id = 'cccccccc-0000-0000-0000-000000000001';  -- replace with :case_id


-- ─────────────────────────────────────────────────────────────────────────────
-- Q20. Count open cases by priority
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
    priority,
    COUNT(*) AS open_case_count
FROM  fraud_cases
WHERE status IN ('open', 'investigating', 'escalated')
GROUP BY priority
ORDER BY
    CASE priority
        WHEN 'critical' THEN 1
        WHEN 'high'     THEN 2
        WHEN 'medium'   THEN 3
        ELSE 4
    END;


-- =============================================================================
-- LEGITIMATE ENTITIES
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- Q21. List all verified entities (for impersonation detection reference)
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
    id,
    entity_name,
    entity_type,
    registration_number,
    official_website,
    official_phone,
    verified
FROM  legitimate_entities
WHERE verified = TRUE
ORDER BY entity_name;


-- ─────────────────────────────────────────────────────────────────────────────
-- Q22. Full-text search for entity name (useful for impersonation check)
-- ─────────────────────────────────────────────────────────────────────────────
SELECT *
FROM  legitimate_entities
WHERE entity_name ILIKE '%zerodha%'   -- replace with :search_term
  AND verified = TRUE;


-- =============================================================================
-- AUDIT LOGS
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- Q23. Get audit log for a specific resource
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
    al.id,
    al.action,
    al.resource_type,
    al.resource_id,
    al.old_data,
    al.new_data,
    al.created_at,
    u.name  AS performed_by
FROM  audit_logs al
LEFT JOIN users u ON u.id = al.user_id
WHERE al.resource_type = 'fraud_cases'
  AND al.resource_id   = 'cccccccc-0000-0000-0000-000000000001'  -- replace with :resource_id
ORDER BY al.created_at DESC;


-- ─────────────────────────────────────────────────────────────────────────────
-- Q24. Recent system activity (admin dashboard activity feed)
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
    al.action,
    al.resource_type,
    al.resource_id,
    al.created_at,
    u.name AS performed_by
FROM  audit_logs al
LEFT JOIN users u ON u.id = al.user_id
ORDER BY al.created_at DESC
LIMIT 20;


-- =============================================================================
-- TRANSACTION 1: Create detection case + alert in one atomic operation
-- =============================================================================
BEGIN;

    WITH new_case AS (
        INSERT INTO detection_cases (
            user_id, source_type, prediction,
            confidence_score, risk_score, risk_level, status, summary
        ) VALUES (
            'aaaaaaaa-0000-0000-0000-000000000001',
            'url',
            'SUSPICIOUS',
            0.7500,
            72.00,
            'HIGH',
            'flagged',
            'Suspicious trading URL flagged by heuristic engine. Risk: 72/100.'
        )
        RETURNING id, risk_level
    ),

    new_evidence AS (
        INSERT INTO evidence (detection_case_id, evidence_type, file_path_or_content, filename)
        SELECT id, 'url', 'https://fake-trading-example.xyz', 'suspicious_url.txt'
        FROM   new_case
        RETURNING detection_case_id
    )

    INSERT INTO alerts (detection_case_id, alert_type, severity, message)
    SELECT
        nc.id,
        'SUSPICIOUS_ACTIVITY',
        'HIGH',
        'Suspicious trading URL submitted. Risk score: 72/100.'
    FROM new_case nc
    WHERE nc.risk_level = 'HIGH';

COMMIT;


-- =============================================================================
-- TRANSACTION 2: Update detection case status + write audit log
-- =============================================================================
BEGIN;

    -- Update the case status
    UPDATE detection_cases
    SET    status     = 'cleared',
           risk_level = 'LOW',
           summary    = 'Re-assessed as legitimate after manual review.'
    WHERE  id = 'bbbbbbbb-0000-0000-0000-000000000003';

    -- Write audit log entry
    INSERT INTO audit_logs (action, resource_type, resource_id, old_data, new_data)
    VALUES (
        'status_changed',
        'detection_cases',
        'bbbbbbbb-0000-0000-0000-000000000003',
        '{"status": "flagged", "risk_level": "MEDIUM"}',
        '{"status": "cleared", "risk_level": "LOW"}'
    );

COMMIT;


-- =============================================================================
-- TRANSACTION 3: Create fraud case + assign investigator + audit log
-- =============================================================================
BEGIN;

    -- Create the investigation case
    WITH new_fraud_case AS (
        INSERT INTO fraud_cases (
            detection_case_id, case_number, assigned_to, priority, status, investigation_notes
        ) VALUES (
            'bbbbbbbb-0000-0000-0000-000000000005',
            'CASE-2026-0004',
            'aaaaaaaa-0000-0000-0000-000000000003',
            'critical',
            'investigating',
            'Audio deepfake case. Caller impersonated Zerodha support. Escalating to cybercrime team.'
        )
        RETURNING id, case_number
    )

    -- Write audit log
    INSERT INTO audit_logs (user_id, action, resource_type, resource_id, new_data)
    SELECT
        'aaaaaaaa-0000-0000-0000-000000000003',
        'case_created',
        'fraud_cases',
        id::TEXT,
        json_build_object('case_number', case_number, 'status', 'investigating')
    FROM new_fraud_case;

COMMIT;


-- =============================================================================
-- End of queries_and_transactions.sql
-- =============================================================================
