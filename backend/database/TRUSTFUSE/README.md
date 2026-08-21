# CivicFix — Project Documentation

## 1. Project Overview

CivicFix is an AI-powered urban issue detection, prioritization, and resolution platform designed to connect citizens, municipal authorities, and field workers through a unified workflow.

The platform manages the complete lifecycle of a civic issue:

Citizen Report → AI Analysis → Verification → Prioritization → Assignment → Resolution → Verification → Citizen Update

---

# 2. Problem Statement

Cities continuously receive complaints regarding:

- Potholes
- Damaged roads
- Broken streetlights
- Overflowing garbage bins
- Water leakage
- Blocked drains
- Fallen trees
- Other civic infrastructure problems

However, municipal authorities face difficulties in managing these complaints efficiently.

### Major Problems

1. Complaints are received through multiple channels.
2. Multiple citizens may report the same issue.
3. Urgent issues may be hidden among low-priority complaints.
4. Complaint verification is often manual.
5. Workers may not be assigned based on proximity, availability, or skill.
6. Citizens have limited visibility into complaint progress.
7. Resolution may be difficult to verify.

---

# 3. Proposed Solution

CivicFix provides a centralized platform where citizens can report civic issues and municipal authorities can manage the complete resolution process.

The system combines:

- Citizen reporting
- Location-based issue tracking
- AI-assisted classification
- Duplicate detection
- Severity estimation
- Priority scoring
- Worker recommendation
- Real-time status tracking
- Resolution verification
- Citizen notifications

AI acts as a decision-support system while authorized municipal officials retain final control.

---

# 4. Project Objectives

### Primary Objectives

- Centralize civic issue reporting.
- Reduce duplicate complaint processing.
- Automatically analyze reported issues.
- Prioritize urgent and high-impact complaints.
- Improve field-worker assignment.
- Track complaints throughout their lifecycle.
- Improve transparency for citizens.
- Verify whether reported issues are actually resolved.

---

# 5. Target Users

## 5.1 Citizen

The citizen reports and tracks civic issues.

### Responsibilities

- Submit complaints
- Provide photos
- Provide location
- Add descriptions
- Track status
- Receive notifications
- Provide feedback

---

## 5.2 Municipal Authority

The authority manages and supervises civic complaints.

### Responsibilities

- Review complaints
- Verify reports
- Review AI analysis
- Prioritize issues
- Assign workers
- Monitor progress
- Verify resolution
- Manage departments

---

## 5.3 Field Worker

The worker performs the physical resolution.

### Responsibilities

- View assigned tasks
- View issue location
- Accept/reject tasks
- Update work status
- Upload progress information
- Upload before/after photographs
- Submit completed work for verification

---

# 6. Complete User Journey

## Citizen Journey

Open CivicFix
↓
Login/Register
↓
Report Issue
↓
Upload Photo
↓
Add Location
↓
Add Description
↓
Submit
↓
Ticket Generated
↓
AI Analysis
↓
Status Tracking
↓
Resolution
↓
Citizen Notification
↓
Feedback

---

# 7. Complete System Workflow

Citizen
↓
Issue Submission
↓
Backend Validation
↓
Image & Data Storage
↓
AI Analysis
↓
Issue Classification
↓
Severity Estimation
↓
Duplicate Detection
↓
Priority Calculation
↓
Authority Dashboard
↓
Authority Verification
↓
Worker Recommendation
↓
Worker Assignment
↓
Work Started
↓
Resolution Evidence
↓
Authority Verification
↓
Issue Resolved
↓
Citizen Notification

---

# 8. User Roles and Permissions

| Feature | Citizen | Authority | Worker |
|---|---|---|---|
| Report Issue | Yes | No | No |
| View Own Issues | Yes | Yes | Assigned only |
| View All Issues | No | Yes | No |
| AI Analysis | View result | Yes | Limited |
| Change Priority | No | Yes | No |
| Assign Worker | No | Yes | No |
| Update Work Status | No | Yes | Yes |
| Upload Resolution Evidence | No | No | Yes |
| Verify Resolution | No | Yes | No |
| Receive Notifications | Yes | Yes | Yes |

---

# 9. Required Screens

## Citizen Screens

1. Splash / Landing
2. Login
3. Registration
4. Home
5. Report Issue
6. Location Selection
7. Photo Upload
8. Complaint Confirmation
9. My Complaints
10. Complaint Details
11. Notifications
12. Profile

## Authority Screens

1. Login
2. Dashboard
3. Issue List
4. Priority Queue
5. Issue Details
6. AI Analysis
7. Map View
8. Worker Management
9. Assignment Screen
10. Resolution Verification
11. Analytics
12. Notifications

## Worker Screens

1. Login
2. Dashboard
3. Assigned Tasks
4. Task Details
5. Location
6. Work Status
7. Upload Evidence
8. Completed Tasks
9. Profile

---

# 10. AI Integration

AI is used to reduce repetitive manual work and provide decision support.

## 10.1 Issue Classification

Input:

- Uploaded image
- Description

Output:

- Issue category
- Confidence score

Example:

Pothole → 94% confidence

---

## 10.2 Severity Estimation

The system estimates the severity of the issue.

Possible levels:

- Low
- Medium
- High
- Critical

Factors may include:

- Physical damage
- Safety risk
- Public impact
- Location
- Issue type

---

## 10.3 Duplicate Detection

Multiple reports can refer to the same physical issue.

The system can compare:

- Geographic proximity
- Image similarity
- Description similarity
- Issue category
- Reporting time

Example:

10 citizen reports
↓
Duplicate Analysis
↓
1 Master Civic Issue
+
10 Linked Citizen Reports

Original reports are preserved rather than deleted.

---

## 10.4 Priority Scoring

For the MVP, a rule-based scoring system can combine AI-generated information with operational factors.

Potential factors:

- Severity
- Public impact
- Number of affected people
- Location risk
- Number of supporting reports
- Waiting time

Example:

Severity = 9/10
Public Impact = 8/10
Location Risk = 9/10
Supporting Reports = 7
Waiting Time = 5

↓

Priority Score = 90/100

↓

Critical

The authority can override the recommendation.

---

## 10.5 Department Classification

The system can recommend the responsible department.

Example:

Broken Streetlight
↓
Electrical Department

Blocked Drain
↓
Drainage Department

Overflowing Garbage
↓
Waste Management Department

---

## 10.6 Worker Recommendation

The system can recommend workers based on:

- Required skill
- Department
- Availability
- Current workload
- Distance from issue

Example:

Issue:
Broken Streetlight

Worker A:
Electrical Department
Available
2 km away
Low workload

↓

Recommended Worker

---

## 10.7 Resolution Verification

Workers upload before-and-after photographs.

The system can assist authorities by comparing the evidence.

Before Image
↓
Work Completed
↓
After Image
↓
AI-Assisted Comparison
↓
Authority Verification

---

# 11. Human-in-the-Loop Design

CivicFix does not allow AI to make critical decisions without human supervision.

AI provides:

- Classification
- Severity recommendation
- Duplicate probability
- Priority score
- Worker recommendation

Municipal authorities can:

- Accept AI recommendation
- Modify the result
- Override the priority
- Change assignment

### Principle

> AI assists. Humans remain in control.

---

# 12. System Architecture
<img width="713" height="1600" alt="WhatsApp Image 2026-08-21 at 1 20 55 PM" src="https://github.com/user-attachments/assets/5ab597bb-d535-46e1-b45a-4dda7c551cad" />

