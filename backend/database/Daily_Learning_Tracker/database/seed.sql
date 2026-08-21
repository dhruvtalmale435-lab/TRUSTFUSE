-- =============================================================================
-- AI Investor Fraud & Impersonation Detection Platform — SEED DATA
-- SIH Hackathon | PS13 Fintech / Smart Education
--
-- Run AFTER schema.sql.
-- Uses fixed UUIDs so the frontend team can hard-code them in test fixtures.
-- =============================================================================

-- =============================================================================
-- USERS  (3 realistic users: 2 investors + 1 analyst)
-- =============================================================================
INSERT INTO users (id, name, email, role) VALUES
(
    'aaaaaaaa-0000-0000-0000-000000000001',
    'Rajesh Mehra',
    'rajesh.mehra@example.com',
    'investor'
),
(
    'aaaaaaaa-0000-0000-0000-000000000002',
    'Priya Singh',
    'priya.singh@example.com',
    'investor'
),
(
    'aaaaaaaa-0000-0000-0000-000000000003',
    'Amit Verma',
    'amit.verma.analyst@example.com',
    'analyst'
)
ON CONFLICT (email) DO NOTHING;

-- =============================================================================
-- DETECTION CASES
-- Case 1: HIGH RISK — deepfake video of a fake SEBI official
-- Case 2: HIGH RISK — WhatsApp scam chat with impersonation
-- Case 3: MEDIUM RISK — suspicious trading app URL
-- Case 4: LOW RISK — legitimate advisor video (control case)
-- Case 5: HIGH RISK — audio deepfake phone call
-- =============================================================================

INSERT INTO detection_cases (
    id, user_id, source_type, prediction,
    confidence_score, risk_score, risk_level, status, summary
) VALUES

-- Case 1: Deepfake video
(
    'bbbbbbbb-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000001',
    'video',
    'DEEPFAKE',
    0.9440,
    92.50,
    'HIGH',
    'flagged',
    'Submitted video shows strong deepfake artifacts including face-swap (94.4% confidence) and spoofed SEBI branding. High probability of AI-generated impersonation content targeting retail investors.'
),

-- Case 2: Chat text scam
(
    'bbbbbbbb-0000-0000-0000-000000000002',
    'aaaaaaaa-0000-0000-0000-000000000002',
    'chat',
    'SUSPICIOUS',
    0.8920,
    85.30,
    'HIGH',
    'flagged',
    'WhatsApp message exhibits multiple scam NLP patterns: guaranteed return claims (97%), urgency manipulation (89%), unverified SEBI registration claim, and direct UPI payment request outside regulated channels.'
),

-- Case 3: Suspicious app URL
(
    'bbbbbbbb-0000-0000-0000-000000000003',
    'aaaaaaaa-0000-0000-0000-000000000001',
    'url',
    'SUSPICIOUS',
    0.6250,
    58.00,
    'MEDIUM',
    'processed',
    'Domain sebi-invest-portal.xyz is 14 days old, uses WHOIS privacy, and has 71% typographic similarity to sebi.gov.in. Suspicious but not yet confirmed as malicious.'
),

-- Case 4: Authentic video (control / green case)
(
    'bbbbbbbb-0000-0000-0000-000000000004',
    'aaaaaaaa-0000-0000-0000-000000000003',
    'video',
    'AUTHENTIC',
    0.9710,
    8.20,
    'LOW',
    'cleared',
    'Submitted video is an official SEBI investor awareness clip. No deepfake artifacts detected. Identity verified against known reference. Content is safe.'
),

-- Case 5: Audio deepfake
(
    'bbbbbbbb-0000-0000-0000-000000000005',
    'aaaaaaaa-0000-0000-0000-000000000002',
    'audio',
    'DEEPFAKE',
    0.8770,
    80.10,
    'HIGH',
    'flagged',
    'Audio recording of a phone call shows voice-synthesis artifacts consistent with AI-generated speech (87.7% confidence). Caller impersonated a Zerodha support executive and requested OTP and UPI PIN.'
);

-- =============================================================================
-- EVIDENCE
-- =============================================================================

INSERT INTO evidence (detection_case_id, evidence_type, file_path_or_content, filename) VALUES

-- Case 1: video file in Supabase Storage
(
    'bbbbbbbb-0000-0000-0000-000000000001',
    'video_file',
    'evidence/bbbbbbbb-0000-0000-0000-000000000001/sebi_impersonation.mp4',
    'sebi_impersonation.mp4'
),

-- Case 2: chat messages (raw text stored directly)
(
    'bbbbbbbb-0000-0000-0000-000000000002',
    'chat_message',
    'Namaste! I am Rakesh Sharma from Motilal Oswal Securities. Our exclusive AI fund guarantees 40% returns in 3 months. Limited slots — invest Rs 50,000 today via UPI. No risk, fully SEBI-registered. WhatsApp me now!',
    'whatsapp_message_1.txt'
),
(
    'bbbbbbbb-0000-0000-0000-000000000002',
    'chat_message',
    'Sir, your slot is reserved. Send amount to UPI: invest.profits2024@ybl — your guaranteed profit certificate emailed in 24h.',
    'whatsapp_message_2.txt'
),

-- Case 3: URL
(
    'bbbbbbbb-0000-0000-0000-000000000003',
    'url',
    'https://sebi-invest-portal.xyz/register?ref=VIP2024',
    'suspicious_url.txt'
),

-- Case 4: authentic video
(
    'bbbbbbbb-0000-0000-0000-000000000004',
    'video_file',
    'evidence/bbbbbbbb-0000-0000-0000-000000000004/sebi_awareness_official.mp4',
    'sebi_awareness_official.mp4'
),

-- Case 5: audio file
(
    'bbbbbbbb-0000-0000-0000-000000000005',
    'audio_file',
    'evidence/bbbbbbbb-0000-0000-0000-000000000005/fake_zerodha_call.wav',
    'fake_zerodha_call.wav'
);

-- =============================================================================
-- ALERTS  (generated only for HIGH risk cases)
-- =============================================================================

INSERT INTO alerts (detection_case_id, alert_type, severity, message, is_read) VALUES

-- Case 1 alert
(
    'bbbbbbbb-0000-0000-0000-000000000001',
    'DEEPFAKE_DETECTED',
    'HIGH',
    'A submitted video has been flagged as a deepfake with 94.4% confidence. The video impersonates a SEBI official and promotes fraudulent investment schemes. Investor: Rajesh Mehra.',
    FALSE
),

-- Case 2 alert
(
    'bbbbbbbb-0000-0000-0000-000000000002',
    'SCAM_NLP_DETECTED',
    'HIGH',
    'WhatsApp messages submitted by Priya Singh contain high-confidence scam NLP patterns: guaranteed returns, urgency manipulation, and direct UPI payment request. Risk score: 85.3.',
    FALSE
),

-- Case 2 secondary alert (impersonation)
(
    'bbbbbbbb-0000-0000-0000-000000000002',
    'IMPERSONATION_DETECTED',
    'HIGH',
    'Sender claims to be a SEBI-registered advisor (Motilal Oswal). Registration number not found in SEBI database. Potential impersonation of a financial intermediary.',
    TRUE    -- already read by analyst
),

-- Case 5 alert
(
    'bbbbbbbb-0000-0000-0000-000000000005',
    'DEEPFAKE_DETECTED',
    'CRITICAL',
    'Audio deepfake detected in phone call recording submitted by Priya Singh. Caller impersonated Zerodha support and solicited OTP and UPI PIN. Confidence: 87.7%. Immediate action required.',
    FALSE
);

-- =============================================================================
-- IMPERSONATION CHECKS  (for Cases 2 and 3 which involve text/URL)
-- =============================================================================

INSERT INTO impersonation_checks (
    detection_case_id,
    claimed_name,
    claimed_registration_number,
    urgency_score,
    impersonation_score,
    prediction,
    flags
) VALUES

-- Case 2: scam chat
(
    'bbbbbbbb-0000-0000-0000-000000000002',
    'Rakesh Sharma, Motilal Oswal Securities',
    'INH000012345',
    0.890,
    0.921,
    'IMPERSONATION',
    '{
        "guaranteed_returns": true,
        "urgency_language": true,
        "unverified_sebi_claim": true,
        "direct_payment_request": true,
        "registered_advisor_verified": false,
        "official_channel_used": false
    }'
),

-- Case 3: suspicious URL — basic impersonation check on domain
(
    'bbbbbbbb-0000-0000-0000-000000000003',
    NULL,
    NULL,
    0.420,
    0.580,
    'SUSPICIOUS',
    '{
        "guaranteed_returns": false,
        "urgency_language": false,
        "unverified_sebi_claim": true,
        "direct_payment_request": false,
        "typosquat_detected": true,
        "domain_age_suspicious": true
    }'
);

-- =============================================================================
-- LEGACY TABLES  (seed for backwards-compatible db.py helpers)
-- =============================================================================

-- Legacy cases
INSERT INTO cases (id, submitted_by, source_type, status) VALUES
(
    '11111111-0000-0000-0000-000000000001',
    'rajesh.mehra@example.com',
    'video',
    'flagged'
),
(
    '22222222-0000-0000-0000-000000000002',
    'priya.singh@example.com',
    'chat_text',
    'flagged'
),
(
    '33333333-0000-0000-0000-000000000003',
    'rajesh.mehra@example.com',
    'url',
    'processed'
)
ON CONFLICT (id) DO NOTHING;

-- Legacy signals
INSERT INTO signals (case_id, signal_type, signal_score, raw_output) VALUES
(
    '11111111-0000-0000-0000-000000000001',
    'deepfake',
    87.40,
    '{"model":"EfficientNet-B4-FaceForensics","frames_analysed":240,"flagged_frames":198,"face_swap_detected":true,"lip_sync_anomaly":true}'
),
(
    '22222222-0000-0000-0000-000000000002',
    'scam_nlp',
    91.20,
    '{"model":"FinancialScamBERT-v2","overall_toxicity":0.912,"urgency_score":0.85,"flagged_phrases":["guarantees 40% returns","Limited slots","No risk"]}'
),
(
    '33333333-0000-0000-0000-000000000003',
    'platform_url',
    62.50,
    '{"domain_age_days":14,"ssl_valid":true,"whois_privacy":true,"typosquat_match":{"official_domain":"sebi.gov.in","similarity":0.71}}'
);

-- Legacy results
INSERT INTO results (case_id, fraud_risk_score, verdict, explanation) VALUES
(
    '11111111-0000-0000-0000-000000000001',
    87.40,
    'high_risk',
    '{"why_flagged":"Strong deepfake artifacts — face-swap + lip-sync anomaly","what_evidence":["Deepfake signal: 87.40/100"],"what_action":"Report to SEBI Investor Helpline 1800-266-7575"}'
),
(
    '22222222-0000-0000-0000-000000000002',
    91.20,
    'high_risk',
    '{"why_flagged":"Multiple high-confidence scam NLP patterns","what_evidence":["Scam NLP: 91.20/100"],"what_action":"Block contact. Verify advisor at sebi.gov.in"}'
),
(
    '33333333-0000-0000-0000-000000000003',
    62.50,
    'suspicious',
    '{"why_flagged":"14-day-old domain with 71% typosquat similarity to sebi.gov.in","what_evidence":["Platform URL: 62.50/100"],"what_action":"Do not submit personal info. Report at cybercrime.gov.in"}'
)
ON CONFLICT (case_id) DO NOTHING;

-- =============================================================================
-- PIPELINE TABLES SEED DATA
-- Covers the full Detection→Signal Fusion→Risk→Explanation→Report pipeline
-- for Cases 1-5 above.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Update impersonation_checks with new columns (002 migration additions)
-- We use UPDATE because the rows were already inserted above.
-- -----------------------------------------------------------------------------
UPDATE impersonation_checks SET
    claimed_role         = 'SEBI-Registered Investment Advisor',
    claimed_organization = 'Motilal Oswal Securities',
    registration_number  = 'INH000012345',
    registration_status  = 'not_found',
    signals              = '{
        "guaranteed_returns": true,
        "urgency_language": true,
        "sebi_claim_unverified": true,
        "direct_payment_request": true,
        "registered_advisor_verified": false,
        "official_channel_used": false,
        "nlp_model": "FinancialScamBERT-v2",
        "flagged_phrases": ["guarantees 40% returns", "Limited slots", "No risk"]
    }'
WHERE detection_case_id = 'bbbbbbbb-0000-0000-0000-000000000002';

UPDATE impersonation_checks SET
    claimed_role         = NULL,
    claimed_organization = NULL,
    registration_number  = NULL,
    registration_status  = 'pending',
    signals              = '{
        "typosquat_detected": true,
        "domain_age_suspicious": true,
        "sebi_claim_unverified": true,
        "whois_privacy_enabled": true
    }'
WHERE detection_case_id = 'bbbbbbbb-0000-0000-0000-000000000003';

-- -----------------------------------------------------------------------------
-- Update evidence with new metadata columns (002 migration additions)
-- -----------------------------------------------------------------------------
UPDATE evidence SET
    mime_type       = 'video/mp4',
    file_size_bytes = 52428800,   -- 50 MB
    metadata        = '{"duration_s": 45, "resolution": "1280x720", "frame_count": 1350, "fps": 30}'
WHERE detection_case_id = 'bbbbbbbb-0000-0000-0000-000000000001'
  AND evidence_type = 'video_file';

UPDATE evidence SET
    mime_type       = 'audio/wav',
    file_size_bytes = 8388608,    -- 8 MB
    metadata        = '{"duration_s": 130, "sample_rate": 16000, "channels": 1}'
WHERE detection_case_id = 'bbbbbbbb-0000-0000-0000-000000000005'
  AND evidence_type = 'audio_file';

UPDATE evidence SET
    mime_type       = 'video/mp4',
    file_size_bytes = 35651584,   -- 34 MB
    metadata        = '{"duration_s": 90, "resolution": "1920x1080", "frame_count": 2700, "fps": 30}'
WHERE detection_case_id = 'bbbbbbbb-0000-0000-0000-000000000004'
  AND evidence_type = 'video_file';

-- -----------------------------------------------------------------------------
-- DETECTIONS
-- Individual signals from each engine — feeds Signal Fusion / Risk Engine
-- -----------------------------------------------------------------------------
INSERT INTO detections (case_id, detection_type, score, confidence, label, signals, evidence) VALUES

-- Case 1: video deepfake
(
    'bbbbbbbb-0000-0000-0000-000000000001',
    'deepfake',
    0.8740, 0.9440, 'DEEPFAKE',
    '{
        "model": "EfficientNet-B4-FaceForensics",
        "frames_analysed": 1350,
        "flagged_frames": 1179,
        "face_swap_detected": true,
        "lip_sync_anomaly": true,
        "eye_blink_irregular": true,
        "per_frame_score_avg": 0.874
    }',
    '{"evidence_type": "video_file", "path": "evidence/bbbbbbbb-0000-0000-0000-000000000001/sebi_impersonation.mp4"}'
),
(
    'bbbbbbbb-0000-0000-0000-000000000001',
    'impersonation',
    0.7950, 0.8200, 'IMPERSONATION',
    '{
        "reference_entity": "SEBI Chairman",
        "face_match_score": 0.72,
        "logo_detected": "SEBI",
        "logo_authenticity": "spoofed",
        "background_match": false,
        "voice_match_score": null
    }',
    '{"evidence_type": "video_file"}'
),

-- Case 2: scam chat — fraud_language + impersonation detections
(
    'bbbbbbbb-0000-0000-0000-000000000002',
    'fraud_language',
    0.9120, 0.9120, 'SCAM',
    '{
        "model": "FinancialScamBERT-v2",
        "overall_toxicity": 0.912,
        "urgency_score": 0.85,
        "flagged_phrases": [
            {"phrase": "guarantees 40% returns", "risk": "guaranteed_returns", "score": 0.97},
            {"phrase": "Limited slots", "risk": "urgency_tactic", "score": 0.89},
            {"phrase": "No risk", "risk": "false_promise", "score": 0.94}
        ]
    }',
    '{"evidence_type": "chat_message", "message_count": 2}'
),
(
    'bbbbbbbb-0000-0000-0000-000000000002',
    'impersonation',
    0.9210, 0.8920, 'IMPERSONATION',
    '{
        "claimed_name": "Rakesh Sharma",
        "claimed_org": "Motilal Oswal Securities",
        "sebi_reg_check": "not_found",
        "reg_number": "INH000012345",
        "direct_payment_upi": "invest.profits2024@ybl"
    }',
    '{"evidence_type": "chat_message"}'
),

-- Case 3: URL — platform detection
(
    'bbbbbbbb-0000-0000-0000-000000000003',
    'platform',
    0.6250, 0.6250, 'SUSPICIOUS',
    '{
        "domain_age_days": 14,
        "ssl_valid": true,
        "whois_privacy": true,
        "typosquat_target": "sebi.gov.in",
        "typosquat_similarity": 0.71,
        "blacklist_hit": false,
        "phishing_db_hit": false
    }',
    '{"evidence_type": "url", "url": "https://sebi-invest-portal.xyz/register?ref=VIP2024"}'
),
(
    'bbbbbbbb-0000-0000-0000-000000000003',
    'url',
    0.5800, 0.6100, 'SUSPICIOUS',
    '{
        "suspicious_path_keywords": ["VIP2024"],
        "tracking_params": true,
        "redirect_chain_length": 2,
        "final_destination": "https://sebi-invest-portal.xyz/payment"
    }',
    '{"evidence_type": "url"}'
),

-- Case 4: authentic video — clean signals
(
    'bbbbbbbb-0000-0000-0000-000000000004',
    'deepfake',
    0.0290, 0.9710, 'AUTHENTIC',
    '{
        "model": "EfficientNet-B4-FaceForensics",
        "frames_analysed": 2700,
        "flagged_frames": 12,
        "face_swap_detected": false,
        "lip_sync_anomaly": false,
        "per_frame_score_avg": 0.029
    }',
    '{"evidence_type": "video_file", "path": "evidence/bbbbbbbb-0000-0000-0000-000000000004/sebi_awareness_official.mp4"}'
),

-- Case 5: audio deepfake
(
    'bbbbbbbb-0000-0000-0000-000000000005',
    'audio',
    0.8770, 0.8770, 'DEEPFAKE',
    '{
        "model": "Wav2Vec2-DeepfakeAudio",
        "duration_s": 130,
        "segments_analysed": 26,
        "flagged_segments": 22,
        "voice_synthesis_artifacts": true,
        "mel_spectrogram_anomaly": true,
        "clone_target": "Zerodha Support",
        "per_segment_avg": 0.877
    }',
    '{"evidence_type": "audio_file", "path": "evidence/bbbbbbbb-0000-0000-0000-000000000005/fake_zerodha_call.wav"}'
),
(
    'bbbbbbbb-0000-0000-0000-000000000005',
    'impersonation',
    0.8400, 0.8400, 'IMPERSONATION',
    '{
        "claimed_entity": "Zerodha Customer Support",
        "requested_sensitive_data": ["OTP", "UPI PIN"],
        "official_number_spoofed": true,
        "urgency_score": 0.91
    }',
    '{"evidence_type": "audio_file"}'
);

-- -----------------------------------------------------------------------------
-- PLATFORM CHECKS  (Cases 3 — URL, and Case 2 — chat with a UPI ID)
-- -----------------------------------------------------------------------------
INSERT INTO platform_checks (case_id, url, domain, api_score, local_check_score, final_score, signals) VALUES

-- Case 3: suspicious URL
(
    'bbbbbbbb-0000-0000-0000-000000000003',
    'https://sebi-invest-portal.xyz/register?ref=VIP2024',
    'sebi-invest-portal.xyz',
    NULL,          -- external API not available (demo fallback)
    0.6250,
    0.6250,
    '{
        "api_source": null,
        "api_error": "rate_limit",
        "local_checks": {
            "domain_age_days": 14,
            "ssl_valid": true,
            "whois_privacy": true,
            "typosquat_similarity": 0.71,
            "blacklist_hit": false,
            "suspicious_keywords": ["VIP2024"],
            "redirect_depth": 2
        }
    }'
),

-- Case 2: UPI ID platform check
(
    'bbbbbbbb-0000-0000-0000-000000000002',
    NULL,
    'ybl',
    NULL,
    0.7800,
    0.7800,
    '{
        "check_type": "upi_id",
        "upi_id": "invest.profits2024@ybl",
        "registered_merchant": false,
        "sebi_registered_entity": false,
        "pattern_suspicious": true,
        "local_checks": {
            "upi_id_pattern_match": "investment_scam_template"
        }
    }'
);

-- -----------------------------------------------------------------------------
-- RISK SCORES  (one per case — Signal Fusion + Risk Engine output)
-- -----------------------------------------------------------------------------
INSERT INTO risk_scores (
    case_id,
    deepfake_score, audio_score, fraud_language_score,
    impersonation_score, platform_score,
    overall_score, risk_level, explanation
) VALUES

-- Case 1: video deepfake, HIGH
(
    'bbbbbbbb-0000-0000-0000-000000000001',
    87.40, NULL, NULL, 79.50, NULL,
    92.50, 'HIGH',
    '{
        "why_flagged": "Video exhibits strong deepfake artifacts (87.4%) and spoofed SEBI branding (79.5% impersonation score). Face-swap and lip-sync anomalies are consistent with AI-generated impersonation content.",
        "top_signals": [
            {"engine": "deepfake", "score": 87.40, "label": "DEEPFAKE", "weight": 0.55},
            {"engine": "impersonation", "score": 79.50, "label": "IMPERSONATION", "weight": 0.45}
        ],
        "what_action": "Do NOT act on investment advice from this video. Report to SEBI Investor Helpline 1800-266-7575 and cybercrime.gov.in",
        "weights_used": {"deepfake": 0.55, "audio": 0.0, "fraud_language": 0.0, "impersonation": 0.45, "platform": 0.0}
    }'
),

-- Case 2: scam chat, HIGH
(
    'bbbbbbbb-0000-0000-0000-000000000002',
    NULL, NULL, 91.20, 92.10, 78.00,
    85.30, 'HIGH',
    '{
        "why_flagged": "Chat messages contain guaranteed return promises (91.2% NLP scam score) and the sender impersonates a SEBI-registered advisor (reg. number not found). Direct UPI payment request detected.",
        "top_signals": [
            {"engine": "impersonation", "score": 92.10, "label": "IMPERSONATION", "weight": 0.40},
            {"engine": "fraud_language", "score": 91.20, "label": "SCAM", "weight": 0.40},
            {"engine": "platform", "score": 78.00, "label": "SUSPICIOUS", "weight": 0.20}
        ],
        "what_action": "Block this contact. Do not send money via UPI for investments. Verify advisor registration at sebi.gov.in",
        "weights_used": {"deepfake": 0.0, "audio": 0.0, "fraud_language": 0.40, "impersonation": 0.40, "platform": 0.20}
    }'
),

-- Case 3: suspicious URL, MEDIUM
(
    'bbbbbbbb-0000-0000-0000-000000000003',
    NULL, NULL, NULL, 58.00, 62.50,
    58.00, 'MEDIUM',
    '{
        "why_flagged": "Domain sebi-invest-portal.xyz is only 14 days old with 71% typosquat similarity to sebi.gov.in. WHOIS privacy active. Suspicious but not yet on known blacklists.",
        "top_signals": [
            {"engine": "platform", "score": 62.50, "label": "SUSPICIOUS", "weight": 0.60},
            {"engine": "impersonation", "score": 58.00, "label": "SUSPICIOUS", "weight": 0.40}
        ],
        "what_action": "Do not register or submit personal data on this site. Report URL to cybercrime.gov.in if you were solicited.",
        "weights_used": {"deepfake": 0.0, "audio": 0.0, "fraud_language": 0.0, "impersonation": 0.40, "platform": 0.60}
    }'
),

-- Case 4: authentic, LOW
(
    'bbbbbbbb-0000-0000-0000-000000000004',
    2.90, NULL, NULL, NULL, NULL,
    8.20, 'LOW',
    '{
        "why_flagged": null,
        "top_signals": [
            {"engine": "deepfake", "score": 2.90, "label": "AUTHENTIC", "weight": 1.0}
        ],
        "what_action": "No action required. Content verified as authentic SEBI investor awareness material.",
        "weights_used": {"deepfake": 1.0, "audio": 0.0, "fraud_language": 0.0, "impersonation": 0.0, "platform": 0.0}
    }'
),

-- Case 5: audio deepfake, HIGH
(
    'bbbbbbbb-0000-0000-0000-000000000005',
    NULL, 87.70, NULL, 84.00, NULL,
    80.10, 'HIGH',
    '{
        "why_flagged": "Voice-synthesis artifacts detected across 22/26 audio segments (87.7%). Caller impersonated Zerodha support and solicited OTP and UPI PIN.",
        "top_signals": [
            {"engine": "audio", "score": 87.70, "label": "DEEPFAKE", "weight": 0.60},
            {"engine": "impersonation", "score": 84.00, "label": "IMPERSONATION", "weight": 0.40}
        ],
        "what_action": "Never share OTP or UPI PIN over phone. Verify caller by calling Zerodha official number. File complaint at cybercrime.gov.in",
        "weights_used": {"deepfake": 0.0, "audio": 0.60, "fraud_language": 0.0, "impersonation": 0.40, "platform": 0.0}
    }'
);

-- -----------------------------------------------------------------------------
-- REPORTS  (final investigation reports for all 5 cases)
-- -----------------------------------------------------------------------------
INSERT INTO reports (case_id, summary, risk_level, recommendations) VALUES

-- Case 1
(
    'bbbbbbbb-0000-0000-0000-000000000001',
    'The submitted video has been determined to be a deepfake with 94.4% confidence. The content impersonates a SEBI official using AI face-swap technology and lip-sync manipulation. The video promotes fraudulent investment schemes to retail investors. Risk score: 92.5/100 (HIGH).',
    'HIGH',
    '{
        "actions": [
            "Do NOT act on any investment advice shown in this video.",
            "Report to SEBI Investor Helpline: 1800-266-7575 (toll-free).",
            "File a cybercrime complaint at cybercrime.gov.in or call 1930.",
            "Warn other investors in your network about this content.",
            "Preserve the video and any related messages as evidence."
        ],
        "regulatory_refs": [
            "SEBI Circular SEBI/HO/OIAE/IGRD/CIR/P/2023 — Investor Grievance",
            "IT Act 2000 Section 66D — Impersonation using computer resource"
        ]
    }'
),

-- Case 2
(
    'bbbbbbbb-0000-0000-0000-000000000002',
    'The submitted WhatsApp messages contain high-confidence financial scam language (91.2% NLP score) and impersonation of a SEBI-registered advisor. The claimed registration number INH000012345 was not found in the SEBI database. A direct UPI payment request was detected. Risk score: 85.3/100 (HIGH).',
    'HIGH',
    '{
        "actions": [
            "Block and report the contact on WhatsApp immediately.",
            "Do NOT send money via UPI, bank transfer, or any other method.",
            "Verify any advisor claiming SEBI registration at sebi.gov.in/sebiweb/other/OtherAction.do",
            "Report to SEBI Investor Helpline: 1800-266-7575.",
            "File a cybercrime complaint at cybercrime.gov.in."
        ],
        "regulatory_refs": [
            "SEBI (Investment Advisers) Regulations, 2013",
            "IT Act 2000 Section 66D — Cheating by personation"
        ]
    }'
),

-- Case 3
(
    'bbbbbbbb-0000-0000-0000-000000000003',
    'The submitted URL (sebi-invest-portal.xyz) shows suspicious characteristics: the domain is 14 days old, uses WHOIS privacy, and has 71% typographic similarity to the official sebi.gov.in domain. The platform is not yet on known blacklists. Risk score: 58/100 (MEDIUM).',
    'MEDIUM',
    '{
        "actions": [
            "Do NOT register or enter personal/financial information on this site.",
            "Verify the official SEBI portal at sebi.gov.in.",
            "Report the suspicious URL at cybercrime.gov.in if you were solicited.",
            "Monitor for further communications from this source."
        ],
        "regulatory_refs": [
            "SEBI Investor Education — Identifying genuine SEBI websites"
        ]
    }'
),

-- Case 4
(
    'bbbbbbbb-0000-0000-0000-000000000004',
    'The submitted video has been verified as authentic official SEBI investor awareness content. Deepfake analysis returned 2.9% score (well below the 40% LOW threshold). No impersonation, fraud language, or platform concerns detected. Risk score: 8.2/100 (LOW).',
    'LOW',
    '{
        "actions": [
            "No action required.",
            "Content is safe to share and reference."
        ],
        "regulatory_refs": []
    }'
),

-- Case 5
(
    'bbbbbbbb-0000-0000-0000-000000000005',
    'The submitted audio recording contains AI-synthesised voice content impersonating Zerodha customer support (87.7% confidence). The caller solicited OTP and UPI PIN, consistent with a voice-phishing (vishing) attack. Risk score: 80.1/100 (HIGH).',
    'HIGH',
    '{
        "actions": [
            "NEVER share OTP, UPI PIN, or account passwords over a phone call.",
            "Zerodha support will never ask for these credentials.",
            "Verify the caller by hanging up and calling Zerodha directly at their official number.",
            "File a cybercrime complaint at cybercrime.gov.in or call 1930.",
            "Contact your bank immediately if you shared any credentials."
        ],
        "regulatory_refs": [
            "RBI Circular on Safe Digital Payments — Never share OTP",
            "IT Act 2000 Section 66C — Identity theft"
        ]
    }'
);

-- =============================================================================
-- End of seed.sql
-- =============================================================================
