# Turning Point Finder — Product Requirements Document

- **Version:** 0.2
- **Status:** Approved for implementation
- **Date:** October 17, 2026
- **Primary product language:** English
- **Hackathon goals:** Best Use of Microsoft Foundry and Best Enterprise Solution

## 1. Product summary

Turning Point Finder helps football fans understand which moment most changed a match and what evidence supports that conclusion. Users replay a fictional match event by event, then inspect the leading turning-point candidate, its supporting match signals, its confidence, and a plain-language explanation.

The app uses transparent rules to identify and rank candidates. Microsoft Foundry may generate an optional explanation based on the structured match evidence. The replay, scoring, and local explanation remain functional without Foundry.

## 2. Goals

1. Give casual fans a clear answer to “what changed the match, and why?”
2. Show evidence for the result and make uncertainty visible.
3. Replay synthetic football events in order to demonstrate live-like match intelligence.
4. Provide a fan explanation and a more detailed analyst view.
5. Demonstrate a credible Foundry integration with a server-side secret, bounded requests, response checks, and a local fallback.
6. Demonstrate enterprise-oriented qualities: transparent analysis, operational health status, request limits, bounded input/output, and failure handling.
7. Keep access free for users in Somalia. The operator may still incur hosting or model costs.

## 3. Target users

### Primary: casual football fan

Wants a quick, understandable explanation of the moment that changed a match.

### Secondary: analyst-minded fan

Wants to inspect the event timeline, the score and control signals before and after a candidate, and the confidence behind the ranking.

## 4. MVP scope

### In scope

- Three original fictional football matches with synthetic event sequences.
- Play, pause, step, reset, and seek controls.
- Event timeline, score display, recent-events feed, and synthetic match-control visualization.
- Deterministic candidate ranking based on event impact, score changes, synthetic control shifts, and whether a shift persists.
- One leading candidate and up to two alternatives.
- High, medium, or low confidence; an explicit “no clear turning point” result for weak evidence.
- Fan and analyst explanation modes.
- Optional, user-triggered Microsoft Foundry explanation.
- Local template explanation when Foundry is unavailable or its response fails grounding checks.
- Local-first operation with no account, database, or saved user information.

### Out of scope

- Live Premier League or other real match feeds.
- Real footage, real player information, club marks, or licensed match statistics.
- User-uploaded data, accounts, saved profiles, or a database.
- Winner prediction or win-probability claims.
- Multi-agent orchestration.
- Public deployment, public repository creation, or hackathon submission without explicit authorization.

## 5. Turning-point definition and analysis

A turning point is an event followed by a meaningful and sustained change in the match signals available in the synthetic data. A goal or red card is a candidate, not automatically the turning point.

The ranking compares up to three preceding and three following events inside a ten-minute window. Signals include:

- Score changes.
- Shot and event impact.
- Relative home/away control values in the synthetic feed.
- Persistence of a change across later events.

The app displays a 0–99 impact index as a ranking aid. It is not a probability or a causal proof. The explanation identifies the evidence and states uncertainty when a result is weak.

## 6. User journey

1. Select one of three fictional demo fixtures.
2. Start or seek within the event replay.
3. Follow the changing score, timeline, and synthetic control signal.
4. At full time, inspect the leading candidate and alternatives.
5. Review evidence and confidence.
6. Switch between Fan view and Analyst detail.
7. Optionally request a Foundry-written explanation. This action is explicit because it may incur token usage.

## 7. Functional requirements

### FR-1: Match selection

The app presents three fictional matches and labels them as synthetic data.

### FR-2: Replay controls

Users can play, pause, reset, step through, and seek to events. Match score and event details follow the selected replay position.

### FR-3: Candidate ranking

Analysis uses only bundled synthetic match events. The app returns the leading candidate and up to two alternatives.

### FR-4: Confidence and uncertainty

Results include a confidence label. Weak or conflicting evidence results in an explicit no-clear-turning-point state.

### FR-5: Evidence trace

Each result displays supporting event, score, control-shift, or persistence evidence tied to the underlying match data.

### FR-6: Explanation modes

Fan view uses concise, plain language. Analyst detail includes more of the score and signal evidence. Both views use the same computed facts.

### FR-7: Foundry explanation

The server accepts a match and candidate identifier, recomputes the candidate from bundled data, and sends only structured evidence to the model. The request is optional and initiated by the user.

### FR-8: Grounding and fallback

The server accepts a model response only if it is valid JSON and its claim evidence identifiers match the supplied evidence. Failed, ungrounded, timed-out, or unavailable responses leave the local explanation available.

### FR-9: Health state

The app exposes a health endpoint that reports whether Foundry configuration is present. It does not return endpoints, keys, or other secrets.

### FR-10: Request controls

The server limits request size, bounds model output, times out slow calls, and applies a small in-memory per-IP rate limit for the local demo.

## 8. Data and privacy

- Match and event data is synthetic and bundled in the project.
- No user account or personal information is requested.
- The server does not persist match choices or explanations.
- Model requests contain only synthetic match facts and the selected explanation mode.
- API keys stay in the server environment and are excluded from source control.

## 9. Technical architecture

- React and Vite responsive web app.
- Shared JavaScript modules for match fixtures and deterministic analysis.
- Small Node.js/Express server for health and optional Foundry calls.
- Bundled JSON-like JavaScript data; no database.
- Server-side Foundry configuration using environment variables.
- Local fallback for every core analysis path.

## 10. UX and accessibility

- Dark broadcast-inspired visual design with original colors and no licensed league branding.
- Responsive desktop and mobile layout.
- Keyboard-visible focus, keyboard-operable controls, and reduced-motion support.
- Color is not the only way to communicate confidence or event type.
- Data labels distinguish synthetic control from real-world probability.

## 11. Non-functional requirements

- Local replay works without network connectivity after dependencies are installed.
- No AI key is included in frontend assets.
- Foundry request payload and output are bounded.
- UI failure states retain access to local explanations.
- Public hosting remains a separate decision because it may have ongoing charges.

## 12. Hackathon alignment and award focus

The official challenge asks for AI-driven transformation of synthetic football events into explainable match intelligence and personalized experiences. This MVP addresses the challenge with synthetic replay, transparent analysis, evidence-based narrative, and Fan/Analyst views. The official rules also require a public GitHub repository and a demo video under two minutes for a complete submission. See the [official rules](https://github.com/microsoft/insidethegamehackathon/blob/main/OFFICIAL%20RULES.md).

The project will aim to demonstrate fit for:

- **Best Use of Microsoft Foundry:** Foundry generates a concise explanation from selected, structured evidence. Deterministic logic still finds and ranks moments.
- **Best Enterprise Solution:** The project emphasizes traceable evidence, bounded model calls, secret handling, health status, rate limiting, safe fallback, and clear limitations.

The rules state that a project may win at most one category prize, along with at most one grand prize. This design aims to fit both category descriptions, but the entry cannot receive both category prizes.

## 13. Success criteria

- A judge can start and finish a replay without setup credentials.
- The match-control display updates from the replayed synthetic data.
- The final result is supported by visible event evidence.
- Weak evidence produces a clear uncertainty state.
- The app remains usable when Foundry is unconfigured or unavailable.
- When configured, an explicitly requested Foundry explanation is linked to supplied evidence.
- A two-minute-or-shorter demo can show the complete product story.

## 14. Risks and remaining decisions

- Foundry resource access, subscription credit, quota, and actual rates must be checked in the user’s Azure account before deployment.
- Public hosting and its operator cost are not selected.
- The official eligibility rule refers to prohibited jurisdictions and OFAC; Somalia is not explicitly named in the examples reviewed. If the entrant is resident in Somalia, obtain written clarification from the organizer.
- The official hackathon rules may change; recheck before submitting.
