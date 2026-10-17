import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  FlaskConical,
  Gauge,
  Info,
  LoaderCircle,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Zap
} from "lucide-react";
import { analyzeMatch, buildFallbackExplanation, formatMinute } from "../shared/analysis.js";
import { formatScore, matches } from "../shared/matches.js";

function getScoreAt(match, eventIndex) {
  if (eventIndex < 0) return { home: 0, away: 0 };
  const event = match.events[Math.min(eventIndex, match.events.length - 1)];
  return { home: event.homeScore, away: event.awayScore };
}

function eventGlyph(type) {
  if (type === "goal") return "G";
  if (type === "red_card") return "R";
  if (type === "substitution") return "S";
  if (type === "penalty") return "P";
  if (type === "shot") return "•";
  if (type === "fulltime") return "FT";
  return "·";
}

function eventTone(type) {
  if (type === "goal") return "goal";
  if (type === "red_card") return "red";
  if (type === "penalty") return "penalty";
  if (type === "substitution") return "sub";
  return "neutral";
}

function ConfidenceBadge({ value }) {
  const label = value === "high" ? "High confidence" : value === "medium" ? "Medium confidence" : "Low confidence";
  return <span className={"confidence-badge confidence-" + value}><span className="confidence-dot" />{label}</span>;
}

function TeamMark({ team, size = "normal" }) {
  return (
    <span className={"team-mark " + size} style={{ "--team-color": team.color }} aria-hidden="true">
      <span>{team.short.slice(0, 1)}</span>
    </span>
  );
}

function MatchCard({ match, active, onSelect }) {
  const finalScore = getScoreAt(match, match.events.length - 1);
  return (
    <button className={"fixture-card" + (active ? " fixture-active" : "")} onClick={onSelect} aria-pressed={active}>
      <span className="fixture-card-top">
        <span>{match.competition.split(" · ")[1]}</span>
        <span className="fixture-status"><span />Demo</span>
      </span>
      <span className="fixture-teams">
        <span className="fixture-team">
          <TeamMark team={match.home} size="small" />
          <span>{match.home.name}</span>
          <b>{finalScore.home}</b>
        </span>
        <span className="fixture-team">
          <TeamMark team={match.away} size="small" />
          <span>{match.away.name}</span>
          <b>{finalScore.away}</b>
        </span>
      </span>
      <span className="fixture-story">{match.story}</span>
    </button>
  );
}

function MomentumChart({ match, eventIndex }) {
  const visible = eventIndex >= 0 ? match.events.slice(0, eventIndex + 1) : [];
  const points = visible.length ? visible : [{ minute: 0, homeControl: 50, awayControl: 50 }];
  const width = 560;
  const height = 92;
  const xStep = points.length > 1 ? width / (points.length - 1) : 0;
  const yFor = (value) => height - (value / 100) * height;
  const homePoints = points.map((item, index) => (index * xStep) + "," + yFor(item.homeControl)).join(" ");
  const awayPoints = points.map((item, index) => (index * xStep) + "," + yFor(item.awayControl)).join(" ");
  const current = points[points.length - 1];

  return (
    <div className="momentum-wrap">
      <div className="chart-heading">
        <div>
          <span className="eyebrow">MATCH CONTROL</span>
          <span className="chart-caption">Synthetic event signal · not win probability</span>
        </div>
        <div className="chart-legend">
          <span><i className="legend-home" />{match.home.short}</span>
          <span><i className="legend-away" />{match.away.short}</span>
        </div>
      </div>
      <div className="chart-canvas" role="img" aria-label={"Current synthetic control signal: " + match.home.name + " " + current.homeControl + ", " + match.away.name + " " + current.awayControl}>
        <div className="chart-gridline grid-top" />
        <div className="chart-gridline grid-mid" />
        <div className="chart-gridline grid-bottom" />
        <svg viewBox={"0 0 " + width + " " + height} preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="homeArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#d9ff67" stopOpacity=".20" />
              <stop offset="100%" stopColor="#d9ff67" stopOpacity="0" />
            </linearGradient>
          </defs>
          {points.length > 1 && <polygon points={"0," + height + " " + homePoints + " " + width + "," + height} fill="url(#homeArea)" />}
          <polyline points={homePoints} fill="none" stroke="#d9ff67" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          <polyline points={awayPoints} fill="none" stroke="#b59aff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 5" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <div className="chart-footer">
        <span>0′</span>
        <span className="chart-current"><i style={{ background: match.home.color }} />{match.home.short} {current.homeControl}% <b>·</b> {match.away.short} {current.awayControl}%<i style={{ background: match.away.color }} /></span>
        <span>{formatMinute(current.minute)}</span>
      </div>
    </div>
  );
}

function Timeline({ match, eventIndex, onSeek }) {
  return (
    <div className="timeline-block">
      <div className="timeline-title-row">
        <div>
          <span className="eyebrow">MATCH TIMELINE</span>
          <span className="timeline-subtitle">Select an event to replay from that moment</span>
        </div>
        <span className="timeline-count">{Math.max(0, eventIndex + 1)} / {match.events.length}</span>
      </div>
      <div className="timeline-scroll">
        <div className="timeline-track">
          <div className="timeline-base" />
          <div className="timeline-progress" style={{ width: match.events.length > 1 ? ((Math.max(0, eventIndex) / (match.events.length - 1)) * 100) + "%" : "0%" }} />
          {match.events.map((event, index) => (
            <button
              key={event.id}
              className={"timeline-event tone-" + eventTone(event.type) + (index <= eventIndex ? " timeline-past" : "") + (index === eventIndex ? " timeline-current" : "")}
              style={{ left: (index / Math.max(1, match.events.length - 1) * 100) + "%" }}
              onClick={() => onSeek(index)}
              aria-label={formatMinute(event.minute) + " " + event.title}
              title={formatMinute(event.minute) + " · " + event.title}
            >
              <span>{eventGlyph(event.type)}</span>
              <small>{formatMinute(event.minute)}</small>
            </button>
          ))}
        </div>
      </div>
      <div className="timeline-legend">
        <span><i className="legend-pill goal-pill" /> Goal</span>
        <span><i className="legend-pill red-pill" /> Red card</span>
        <span><i className="legend-pill neutral-pill" /> Match event</span>
      </div>
    </div>
  );
}

function EventFeed({ match, eventIndex, onSeek }) {
  const visible = match.events.slice(0, eventIndex + 1).slice(-4).reverse();
  return (
    <div className="event-feed">
      <div className="feed-title">
        <div>
          <span className="eyebrow">RECENT EVENTS</span>
          <span className="timeline-subtitle">What the match has shown so far</span>
        </div>
        <Activity size={16} aria-hidden="true" />
      </div>
      {visible.length ? (
        <div className="feed-list">
          {visible.map((event) => {
            const eventPosition = match.events.findIndex((item) => item.id === event.id);
            return (
              <button className="feed-event" key={event.id} onClick={() => onSeek(eventPosition)}>
                <span className={"feed-glyph tone-" + eventTone(event.type)}>{eventGlyph(event.type)}</span>
                <span className="feed-event-copy">
                  <strong>{event.title}</strong>
                  <small>{event.detail}</small>
                </span>
                <time>{formatMinute(event.minute)}</time>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="feed-empty"><Clock3 size={18} /><span>Start the replay to follow the event feed.</span></div>
      )}
    </div>
  );
}

function EvidenceRow({ item }) {
  const icon = item.kind === "score" ? <Target size={15} /> : item.kind === "persistence" ? <Activity size={15} /> : item.kind === "control" ? <Gauge size={15} /> : <Zap size={15} />;
  return (
    <div className="evidence-row">
      <span className={"evidence-icon evidence-" + item.kind}>{icon}</span>
      <span><strong>{item.title}</strong><small>{item.detail}</small></span>
      <Check size={14} className="evidence-check" aria-label="Evidence from match data" />
    </div>
  );
}

function InsightPanel({ match, analysis, isComplete, viewMode, setViewMode, selectedCandidateId, setSelectedCandidateId, foundryStatus, explanation, setExplanation, loading, onGenerate }) {
  const candidate = analysis?.candidates.find((item) => item.id === selectedCandidateId) || analysis?.top;
  const confidence = candidate?.confidence || "low";
  const isConfigured = foundryStatus?.foundryConfigured === true;
  const narrative = explanation && candidate && explanation.candidateId === candidate.id
    ? explanation.text
    : buildFallbackExplanation(match, candidate, viewMode);

  return (
    <aside className="insight-panel panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">TURNING POINT REPORT</span>
          <h2>Match insight</h2>
        </div>
        <span className={"insight-state" + (isComplete ? " state-complete" : "")}>
          {isComplete ? <Check size={13} /> : <span className="state-pulse" />}
          {isComplete ? "Complete" : "Building"}
        </span>
      </div>

      {!isComplete ? (
        <div className="analysis-pending">
          <div className="pending-art"><Target size={28} strokeWidth={1.4} /></div>
          <span className="eyebrow">FOLLOWING THE MATCH</span>
          <h3>Let the evidence arrive.</h3>
          <p>The ranking appears after the replay finishes. Candidate moments are weighed against what happens before and after them.</p>
          <div className="pending-steps"><span className="step-active" /><span /><span /><span /><span /></div>
          <small>Signals tracked: score changes, shots, pressure, and control.</small>
        </div>
      ) : analysis?.noClearTurningPoint ? (
        <div className="no-clear-card">
          <div className="no-clear-icon"><Info size={20} /></div>
          <span className="eyebrow">NO CLEAR TURNING POINT</span>
          <h3>The match stayed close.</h3>
          <p>No single event produced a strong, sustained shift in the synthetic match signals. The top candidate is shown as tentative for review.</p>
          {candidate && <div className="tentative-candidate"><span>{formatMinute(candidate.event.minute)}</span><strong>{candidate.event.title}</strong><ConfidenceBadge value="low" /></div>}
        </div>
      ) : candidate ? (
        <>
          <div className="result-card">
            <div className="result-card-top">
              <span className="result-rank"><Trophy size={14} /> LEADING CANDIDATE</span>
              <span className="result-minute">{formatMinute(candidate.event.minute)}</span>
            </div>
            <div className="result-event">
              <span className={"result-event-mark tone-" + eventTone(candidate.event.type)}>{eventGlyph(candidate.event.type)}</span>
              <div><h3>{candidate.event.title}</h3><p>{candidate.event.detail}</p></div>
            </div>
            <div className="result-scoreline">
              <span>{match.home.short} {candidate.scoreAfter.home}</span>
              <span className="result-score-divider">:</span>
              <span>{candidate.scoreAfter.away} {match.away.short}</span>
              {candidate.scoreBefore.home !== candidate.scoreAfter.home || candidate.scoreBefore.away !== candidate.scoreAfter.away
                ? <span className="score-change">SCORE SHIFT</span>
                : <span className="score-change neutral-change">CONTROL SHIFT</span>}
            </div>
          </div>

          <div className="confidence-line">
            <ConfidenceBadge value={confidence} />
            <span className="impact-score"><b>{candidate.impactScore}</b><small>impact index</small></span>
          </div>

          <div className="mode-switch" role="group" aria-label="Explanation detail">
            <button className={viewMode === "fan" ? "mode-active" : ""} onClick={() => setViewMode("fan")}>Fan view</button>
            <button className={viewMode === "analyst" ? "mode-active" : ""} onClick={() => setViewMode("analyst")}>Analyst detail</button>
          </div>

          <div className="explanation-card">
            <div className="explanation-heading">
              <span><Sparkles size={15} /> WHY IT MATTERS</span>
              {explanation?.candidateId === candidate.id && <span className="ai-tag"><span /> FOUNDRY</span>}
            </div>
            <p>{narrative}</p>
            {explanation?.candidateId === candidate.id && explanation.claims?.length > 0 && (
              <div className="grounding-note"><ShieldCheck size={14} /> {explanation.claims.length} claim{explanation.claims.length === 1 ? "" : "s"} linked to match evidence</div>
            )}
            <button className="generate-button" onClick={() => onGenerate(candidate)} disabled={!isConfigured || loading}>
              {loading ? <LoaderCircle size={15} className="spin" /> : <Sparkles size={15} />}
              {loading ? "Writing explanation…" : isConfigured ? "Generate with Microsoft Foundry" : "Foundry not connected"}
              {!loading && <ArrowUpRight size={14} className="button-arrow" />}
            </button>
            {!isConfigured && <small className="setup-hint">The local explanation works now. Add the three server-side values in .env to enable Foundry.</small>}
          </div>

          <div className="evidence-section">
            <div className="section-heading-row">
              <div><span className="eyebrow">MATCH EVIDENCE</span><span className="evidence-count">{candidate.evidence.length} signals</span></div>
              <span className="verified-label"><ShieldCheck size={13} /> VERIFIED</span>
            </div>
            <div className="evidence-list">
              {candidate.evidence.map((item) => <EvidenceRow item={item} key={item.id} />)}
            </div>
            <div className="evidence-footnote">Impact index is a transparent demo score, not win probability or proof of cause.</div>
          </div>

          {analysis.alternatives.length > 0 && (
            <div className="alternatives-section">
              <div className="section-heading-row">
                <div><span className="eyebrow">OTHER CANDIDATES</span><span className="evidence-count">Ranked by match impact</span></div>
                <ChevronDown size={15} />
              </div>
              {analysis.alternatives.map((item, index) => (
                <button className={"alternative-row" + (item.id === candidate.id ? " alternative-selected" : "")} key={item.id} onClick={() => setSelectedCandidateId(item.id)}>
                  <span className="alternative-number">0{index + 2}</span>
                  <span className="alternative-copy"><strong>{item.event.title}</strong><small>{formatMinute(item.event.minute)} · {item.impactScore} impact</small></span>
                  <ChevronRight size={15} />
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="no-clear-card">
          <Info size={20} />
          <h3>Not enough evidence yet.</h3>
          <p>Continue the replay to build a match-level view.</p>
        </div>
      )}
    </aside>
  );
}

export default function App() {
  const [selectedMatchId, setSelectedMatchId] = useState(matches[0].id);
  const [eventIndex, setEventIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [viewMode, setViewMode] = useState("fan");
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [foundryStatus, setFoundryStatus] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  const match = matches.find((item) => item.id === selectedMatchId) || matches[0];
  const isComplete = eventIndex >= match.events.length - 1;
  const liveAnalysis = useMemo(
    () => analyzeMatch(match, Math.max(0, eventIndex + 1)),
    [match, eventIndex]
  );
  const finalAnalysis = useMemo(() => analyzeMatch(match), [match]);
  const analysis = isComplete ? finalAnalysis : liveAnalysis;
  const score = getScoreAt(match, eventIndex);
  const currentEvent = eventIndex >= 0 ? match.events[eventIndex] : null;

  useEffect(() => {
    let active = true;
    fetch("/api/health")
      .then((response) => response.json())
      .then((status) => { if (active) setFoundryStatus(status); })
      .catch(() => { if (active) setFoundryStatus({ status: "unavailable", foundryConfigured: false }); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(() => {
      setEventIndex((current) => {
        const next = Math.min(current + 1, match.events.length - 1);
        if (next >= match.events.length - 1) setPlaying(false);
        return next;
      });
    }, 1150);
    return () => window.clearInterval(timer);
  }, [playing, match]);

  useEffect(() => {
    setSelectedCandidateId(null);
    setExplanation(null);
    setNotice("");
  }, [selectedMatchId]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(""), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function selectMatch(matchId) {
    setPlaying(false);
    setEventIndex(-1);
    setSelectedMatchId(matchId);
  }

  function playReplay() {
    if (isComplete) setEventIndex(-1);
    setPlaying(true);
  }

  function seekTo(index) {
    setPlaying(false);
    setEventIndex(index);
  }

  async function generateExplanation(candidate) {
    setLoading(true);
    setNotice("");
    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: match.id, candidateId: candidate.id, viewMode })
      });
      const result = await response.json();
      if (!response.ok) {
        const errorMessages = {
          FOUNDRY_NOT_CONFIGURED: "Foundry is not connected yet. The local evidence-based explanation remains available.",
          FOUNDRY_TIMEOUT: "Foundry took too long to respond. The local explanation remains available.",
          FOUNDRY_UNAVAILABLE: "Foundry is unavailable right now. The local explanation remains available.",
          FOUNDRY_RESPONSE_UNGROUNDED: "The response could not be tied to the match evidence, so the local explanation is shown.",
          RATE_LIMITED: "Please wait a minute before requesting another explanation."
        };
        setNotice(errorMessages[result.error] || "Foundry could not generate an explanation. The local explanation remains available.");
        return;
      }
      setExplanation({
        candidateId: candidate.id,
        text: result.narrative,
        claims: result.claims || [],
        provider: result.provider,
        usage: result.usage
      });
    } catch {
      setNotice("Could not reach the explanation service. The local explanation remains available.");
    } finally {
      setLoading(false);
    }
  }

  const currentEventName = currentEvent ? currentEvent.title : "Ready when you are";
  const currentEventDetail = currentEvent ? currentEvent.detail : "Start the replay to follow the match as events arrive.";

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Turning Point Finder home">
          <span className="brand-mark"><span /></span>
          <span className="brand-copy"><strong>turning point</strong><small>FINDER / MATCH INTELLIGENCE</small></span>
        </a>
        <div className="topbar-right">
          <span className="synthetic-pill"><FlaskConical size={13} /> SYNTHETIC DATA</span>
          <span className={"connection-pill" + (foundryStatus?.foundryConfigured ? " connection-ready" : "")}>
            <span />
            {foundryStatus?.foundryConfigured ? "FOUNDRY READY" : "LOCAL MODE"}
          </span>
          <button className="icon-button" aria-label="About this demo" title="About this demo" onClick={() => setNotice("Demo matches and match-control signals are synthetic. The impact index is an evidence-ranking aid, not a prediction.")}><CircleHelp size={17} /></button>
        </div>
      </header>

      <main id="top" className="page-main">
        <section className="hero-row">
          <div>
            <div className="hero-kicker"><span className="kicker-line" /> THE MATCH, RE-READ</div>
            <h1>Find the moment<br /><em>it all turned.</em></h1>
            <p>Replay a match. Follow the evidence. See which moment shifted the story.</p>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-icon"><Activity size={17} /></span>
            <span><b>Evidence first</b><small>Every insight is tied to a match event.</small></span>
          </div>
        </section>

        <section className="workspace-grid" aria-label="Match replay workspace">
          <aside className="fixture-panel panel">
            <div className="panel-heading fixture-heading">
              <div><span className="eyebrow">DEMO FIXTURES</span><h2>Choose a match</h2></div>
              <span className="fixture-total">03</span>
            </div>
            <p className="panel-intro">Fictional football, built to show different match stories.</p>
            <div className="fixture-list">
              {matches.map((item) => (
                <MatchCard key={item.id} match={item} active={item.id === match.id} onSelect={() => selectMatch(item.id)} />
              ))}
            </div>
            <div className="personalization-card">
              <div className="personalization-icon"><Sparkles size={15} /></div>
              <div><strong>Two ways to read it</strong><small>Switch between the fan explanation and analyst evidence.</small></div>
            </div>
            <div className="privacy-note"><ShieldCheck size={14} /><span>Runs on synthetic matches. No account or personal data.</span></div>
          </aside>

          <section className="match-column">
            <div className="match-banner panel">
              <div className="match-banner-meta">
                <span className="live-replay"><span className={playing ? "live-dot live-dot-active" : "live-dot"} />{playing ? "REPLAYING" : isComplete ? "REPLAY COMPLETE" : "MATCH REPLAY"}</span>
                <span className="competition-label">{match.competition}</span>
              </div>
              <div className="scoreboard">
                <div className="score-team score-home">
                  <TeamMark team={match.home} />
                  <span><strong>{match.home.name}</strong><small>HOME</small></span>
                </div>
                <div className="score-center">
                  <span className="score-value">{score.home}<i>:</i>{score.away}</span>
                  <span className="score-clock">{currentEvent ? formatMinute(currentEvent.minute) : "00′"} <span>·</span> {isComplete ? "FT" : "SIM"}</span>
                </div>
                <div className="score-team score-away">
                  <TeamMark team={match.away} />
                  <span><strong>{match.away.name}</strong><small>AWAY</small></span>
                </div>
              </div>
              <div className="match-banner-bottom">
                <span><span className="venue-pin" />{match.venue}</span>
                <span className="synthetic-indicator"><span /> FICTIONAL FIXTURE</span>
              </div>
            </div>

            <div className="match-live-panel panel">
              <div className="live-panel-title">
                <div><span className="eyebrow">LIVE MATCH READ</span><h2>{currentEventName}</h2><p>{currentEventDetail}</p></div>
                <div className="moment-chip"><Clock3 size={14} />{currentEvent ? formatMinute(currentEvent.minute) : "PRE-MATCH"}</div>
              </div>
              <MomentumChart match={match} eventIndex={eventIndex} />
              <EventFeed match={match} eventIndex={eventIndex} onSeek={seekTo} />
              <div className="replay-controls">
                <div className="control-buttons">
                  <button className="control-secondary" onClick={() => seekTo(Math.max(-1, eventIndex - 1))} disabled={eventIndex < 0} aria-label="Previous event"><ChevronLeft size={17} /></button>
                  <button className="control-play" onClick={playing ? () => setPlaying(false) : playReplay} aria-label={playing ? "Pause replay" : isComplete ? "Replay match" : "Play replay"}>
                    {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                    <span>{playing ? "Pause" : isComplete ? "Replay" : eventIndex < 0 ? "Start replay" : "Resume"}</span>
                  </button>
                  <button className="control-secondary" onClick={() => seekTo(Math.min(match.events.length - 1, eventIndex + 1))} disabled={isComplete} aria-label="Next event"><ChevronRight size={17} /></button>
                  <button className="control-reset" onClick={() => { setPlaying(false); setEventIndex(-1); }} aria-label="Reset replay" title="Reset replay"><RotateCcw size={15} /></button>
                </div>
                <div className="playback-progress">
                  <div className="progress-meta"><span>{eventIndex < 0 ? "Ready" : formatMinute(currentEvent.minute)}</span><span>{match.events.length} match events</span></div>
                  <input
                    aria-label="Replay progress"
                    type="range"
                    min="0"
                    max={match.events.length}
                    value={eventIndex + 1}
                    onChange={(event) => seekTo(Number(event.target.value) - 1)}
                    style={{ "--progress": (((eventIndex + 1) / match.events.length) * 100) + "%" }}
                  />
                </div>
              </div>
              <Timeline match={match} eventIndex={eventIndex} onSeek={seekTo} />
            </div>

            <div className="enterprise-strip">
              <span><ShieldCheck size={15} /> AUDITABLE SIGNALS</span>
              <span><span className="strip-separator" /> Rules rank the moment; AI only writes the explanation.</span>
              <span className="enterprise-ready"><Check size={13} /> FALLBACK READY</span>
            </div>
          </section>

          <InsightPanel
            match={match}
            analysis={analysis}
            isComplete={isComplete}
            viewMode={viewMode}
            setViewMode={setViewMode}
            selectedCandidateId={selectedCandidateId}
            setSelectedCandidateId={setSelectedCandidateId}
            foundryStatus={foundryStatus}
            explanation={explanation}
            setExplanation={setExplanation}
            loading={loading}
            onGenerate={generateExplanation}
          />
        </section>

        <footer className="page-footer">
          <span>TURNING POINT FINDER <i>·</i> PRODUCT DEMO</span>
          <span>Every match shown is synthetic. Analysis can be uncertain.</span>
          <a href="https://learn.microsoft.com/azure/foundry/" target="_blank" rel="noreferrer">Microsoft Foundry integration <ArrowUpRight size={12} /></a>
        </footer>
      </main>
      {notice && <div role="status" className="toast"><Info size={15} />{notice}<button aria-label="Dismiss message" onClick={() => setNotice("")}>×</button></div>}
    </div>
  );
}
