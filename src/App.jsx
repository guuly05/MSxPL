import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Check,
  ChevronLeft,
  ChevronRight,
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
import { formatScore, getFinalScore, matches } from "../shared/matches.js";
import { AboutPage, MethodologyPage, PrivacyPolicyPage, SiteFooter, SiteHeader } from "./SitePages.jsx";

function eventGlyph(type) {
  if (type === "goal") return "G";
  if (type === "red_card") return "R";
  if (type === "substitution") return "S";
  if (type === "penalty") return "P";
  if (type === "shot") return "Sh";
  if (type === "fulltime") return "FT";
  return "Ev";
}

function eventTone(type) {
  if (type === "goal") return "goal";
  if (type === "red_card") return "red";
  if (type === "penalty") return "penalty";
  if (type === "substitution") return "sub";
  return "neutral";
}

function TeamMark({ team, small = false }) {
  return (
    <span className={"team-mark" + (small ? " team-mark-small" : "")} style={{ "--team-color": team.color }} aria-hidden="true">
      {team.short.slice(0, 1)}
    </span>
  );
}

function ConfidenceBadge({ value }) {
  const label = value === "high" ? "High confidence" : value === "medium" ? "Medium confidence" : "Low confidence";
  return <span className={"confidence-badge confidence-" + value}>{label}</span>;
}

function MatchCard({ match, active, onSelect }) {
  const finalScore = getFinalScore(match);
  return (
    <div className="match-option-unit">
      <button className={"match-option" + (active ? " match-option-active" : "")} onClick={onSelect} aria-pressed={active}>
        <span className="match-option-meta">{match.competition.split(" · ")[1]}</span>
        <span className="match-option-score">
          <span>{match.home.name}</span><b>{finalScore.home}</b><i>:</i><b>{finalScore.away}</b><span>{match.away.name}</span>
        </span>
      </button>
      <span className="match-option-story">{match.story}</span>
    </div>
  );
}

function MomentumChart({ match, eventIndex }) {
  const visible = eventIndex >= 0 ? match.events.slice(0, eventIndex + 1) : [];
  const points = visible.length ? visible : [{ minute: 0, homeControl: 50, awayControl: 50 }];
  const width = 520;
  const height = 110;
  const xStep = points.length > 1 ? width / (points.length - 1) : 0;
  const yFor = (value) => height - (value / 100) * height;
  const homePoints = points.map((item, index) => (index * xStep) + "," + yFor(item.homeControl)).join(" ");
  const awayPoints = points.map((item, index) => (index * xStep) + "," + yFor(item.awayControl)).join(" ");
  const current = points[points.length - 1];

  return (
    <section className="control-section" aria-labelledby="control-heading">
      <div className="section-heading">
        <div><h3 id="control-heading">Synthetic control</h3></div>
        <span className="signal-disclaimer">Not win probability</span>
      </div>
      <div className="chart-legend">
        <span><i className="legend-home" />{match.home.short} {current.homeControl}%</span>
        <span><i className="legend-away" />{match.away.short} {current.awayControl}%</span>
      </div>
      <div className="chart-canvas" role="img" aria-label={"Synthetic control signal at " + formatMinute(current.minute) + ": " + match.home.name + " " + current.homeControl + " percent, " + match.away.name + " " + current.awayControl + " percent"}>
        <div className="chart-gridline chart-grid-top" /><div className="chart-gridline chart-grid-mid" /><div className="chart-gridline chart-grid-bottom" />
        <svg viewBox={"0 0 " + width + " " + height} preserveAspectRatio="none" aria-hidden="true">
          {points.length > 1 && <polygon id="homeArea" points={"0," + height + " " + homePoints + " " + width + "," + height} fill="var(--color-accent)" fillOpacity=".09" />}
          <polyline points={homePoints} fill="none" stroke="var(--color-accent)" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          <polyline points={awayPoints} fill="none" stroke="var(--color-signal)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 5" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <div className="chart-axis"><span>00′</span><span>{formatMinute(current.minute)}</span></div>
    </section>
  );
}

function Timeline({ match, eventIndex, selectedCandidate, onSeek }) {
  return (
    <section className="timeline-section" aria-labelledby="timeline-heading">
      <div className="section-heading">
        <div><h3 id="timeline-heading">Replay timeline</h3></div>
        <span className="timeline-count">{Math.max(0, eventIndex + 1)} / {match.events.length}</span>
      </div>
      <p className="section-note">Select an event to inspect the match at that point.</p>
      <div className="timeline-scroll">
        <div className="timeline-track">
          <div className="timeline-base" />
          <div className="timeline-progress" style={{ width: match.events.length > 1 ? ((Math.max(0, eventIndex) / (match.events.length - 1)) * 100) + "%" : "0%" }} />
          {match.events.map((event, index) => {
            const isCandidate = selectedCandidate?.event.id === event.id;
            return (
              <button
                key={event.id}
                className={"timeline-event tone-" + eventTone(event.type) + (index <= eventIndex ? " timeline-past" : "") + (index === eventIndex ? " timeline-current" : "") + (isCandidate ? " timeline-candidate" : "")}
                style={{ left: (index / Math.max(1, match.events.length - 1) * 100) + "%" }}
                onClick={() => onSeek(index)}
                aria-label={formatMinute(event.minute) + " " + event.title + (isCandidate ? ", selected turning-point candidate" : "")}
                title={formatMinute(event.minute) + ": " + event.title + (isCandidate ? " (candidate)" : "")}
              >
                <span>{eventGlyph(event.type)}</span><small>{formatMinute(event.minute)}</small>
              </button>
            );
          })}
        </div>
      </div>
      <div className="timeline-legend"><span><i className="legend-event" /> Match event</span><span><i className="legend-candidate" /> Selected candidate</span></div>
    </section>
  );
}

function EventFeed({ match, eventIndex, onSeek }) {
  const visible = match.events.slice(0, eventIndex + 1).slice(-4).reverse();
  return (
    <section className="event-sequence" aria-labelledby="sequence-heading">
      <div className="section-heading">
        <div><h3 id="sequence-heading">Recent sequence</h3></div>
        <Activity size={17} aria-hidden="true" />
      </div>
      {visible.length ? <div className="event-list">
        {visible.map((event) => {
          const index = match.events.findIndex((item) => item.id === event.id);
          return <button className="event-row" key={event.id} onClick={() => onSeek(index)}>
            <span className={"event-marker tone-" + eventTone(event.type)}>{eventGlyph(event.type)}</span>
            <span className="event-copy"><strong>{event.title}</strong><small>{event.detail}</small></span>
            <span className="event-time">{formatMinute(event.minute)}</span>
          </button>;
        })}
      </div> : <p className="empty-events">Replay from the beginning to follow the event sequence.</p>}
    </section>
  );
}

function ScoreBreakdown({ candidate }) {
  return (
    <section className="method-section" aria-labelledby="method-heading">
      <div className="section-heading">
        <div><h3 id="method-heading">Impact index breakdown</h3></div>
        <span className="method-cap">Capped at 99</span>
      </div>
      <div className="breakdown-grid">
        {candidate.scoreBreakdown.map((item) => (
          <div className="breakdown-item" key={item.id} title={item.detail}>
            <span>{item.label}</span><strong>{item.value > 0 ? "+" : ""}{item.value}</strong><small>{item.detail}</small>
          </div>
        ))}
      </div>
      <p className="formula-note">12 baseline + event weight + score change + control shift + persistence. This ranks candidates; it is not a probability or proof of cause.</p>
    </section>
  );
}

function EvidenceRow({ item }) {
  const Icon = item.kind === "score" ? Target : item.kind === "persistence" ? Activity : item.kind === "control" ? Gauge : Zap;
  return (
    <div className="evidence-row">
      <span className={"evidence-icon evidence-" + item.kind}><Icon size={16} /></span>
      <span className="evidence-copy"><strong>{item.title}</strong><small>{item.detail}</small></span>
      <span className="evidence-source">{item.id}</span>
    </div>
  );
}

function InsightPanel({ match, analysis, viewMode, setViewMode, selectedCandidateId, onSelectCandidate, foundryStatus, explanation, loading, onGenerate }) {
  const candidate = analysis?.candidates.find((item) => item.id === selectedCandidateId) || analysis?.top;
  const isConfigured = foundryStatus?.foundryConfigured === true;
  const activeExplanation = Boolean(explanation && candidate && explanation.candidateId === candidate.id);
  const narrative = activeExplanation ? explanation.text : buildFallbackExplanation(match, candidate, viewMode);
  const candidateRank = candidate ? analysis.candidates.findIndex((item) => item.id === candidate.id) + 1 : 0;

  return (
    <section className="analysis-panel" aria-labelledby="analysis-title">
      <header className="analysis-header">
        <div><h2 id="analysis-title">Turning-point analysis</h2></div>
        <span className="report-ready"><Check size={14} /> Review ready</span>
      </header>

      {candidate ? <>
        {analysis.noClearTurningPoint && <div className="uncertainty-banner"><Info size={16} /><span><strong>No clear turning point</strong><small>The leading event is tentative; the available match signals do not show a strong enough sustained shift.</small></span></div>}
        <article className="candidate-summary">
          <div className="candidate-summary-top">
            <span className="candidate-rank"><Trophy size={15} /> {candidateRank === 1 ? "Top-ranked candidate" : "Alternative candidate"}</span>
            <span className="candidate-time">{formatMinute(candidate.event.minute)}</span>
          </div>
          <div className="candidate-main">
            <div className={"candidate-type tone-" + eventTone(candidate.event.type)}>{eventGlyph(candidate.event.type)}</div>
            <div className="candidate-copy"><h3>{candidate.event.title}</h3><p>{candidate.event.detail}</p></div>
            <div className="impact-score"><strong>{candidate.impactScore}</strong><span>/ 99<br />impact index</span></div>
          </div>
          <div className="candidate-meta">
            <ConfidenceBadge value={candidate.confidence} />
            <span className="meta-divider" />
            <span className="score-context">{match.home.short} {formatScore(candidate.scoreAfter.home, candidate.scoreAfter.away)} {match.away.short}</span>
            <span className="candidate-signals">{candidate.signalCount} supporting signals</span>
          </div>
        </article>

        <ScoreBreakdown candidate={candidate} />

        <section className="evidence-section" aria-labelledby="evidence-title">
          <div className="section-heading">
            <div><h3 id="evidence-title">Evidence supporting this candidate</h3></div>
            <span className="evidence-count"><ShieldCheck size={14} /> {candidate.evidence.length} sources</span>
          </div>
          <div className="evidence-list">
            {candidate.evidence.map((item) => <EvidenceRow item={item} key={item.id} />)}
          </div>
          <p className="evidence-footnote">Each row is derived from the synthetic event feed. Rule weights are shown separately above.</p>
        </section>

        <section className="explanation-section" aria-labelledby="explanation-title">
          <div className="section-heading explanation-section-heading">
            <div><h3 id="explanation-title">Explain the evidence</h3></div>
            <Sparkles size={17} />
          </div>
          <div className="explanation-controls" role="group" aria-label="Explanation audience">
            <button className={viewMode === "analyst" ? "view-active" : ""} onClick={() => setViewMode("analyst")}>Analyst</button>
            <button className={viewMode === "fan" ? "view-active" : ""} onClick={() => setViewMode("fan")}>Fan summary</button>
          </div>
          <p className="explanation-text">{narrative}</p>
          {activeExplanation && explanation.claims?.length > 0 && <div className="grounding-note"><ShieldCheck size={14} /> {explanation.claims.length} model claim{explanation.claims.length === 1 ? "" : "s"} linked to evidence</div>}
          <div className="foundry-action-row">
            <button className="foundry-button" onClick={() => onGenerate(candidate)} disabled={!isConfigured || loading} aria-busy={loading}>
              {loading ? <LoaderCircle size={16} className="spin" /> : <Sparkles size={16} />}
              {loading ? "Generating explanation…" : activeExplanation ? "Regenerate explanation" : "Generate with Microsoft Foundry"}
            </button>
            <span className="foundry-state">{isConfigured ? "Connected" : "Local mode"}</span>
          </div>
          {!isConfigured && <p className="setup-hint">Foundry is optional. Add the server-side endpoint, key, and deployment in <code>.env</code> to enable generated explanations.</p>}
        </section>

        {analysis.alternatives.length > 0 && <section className="alternatives-section" aria-labelledby="alternatives-title">
          <div className="section-heading"><div><h3 id="alternatives-title">Other ranked events</h3></div><span className="evidence-count">{analysis.alternatives.length} alternatives</span></div>
          <div className="candidate-table" role="list">
            {analysis.alternatives.map((item, index) => <button
              className={"alternative-row" + (item.id === candidate.id ? " alternative-selected" : "")}
              key={item.id}
              onClick={() => onSelectCandidate(item)}
              role="listitem"
              aria-pressed={item.id === candidate.id}
            >
              <span className="alternative-rank">0{index + 2}</span>
              <span className="alternative-name"><strong>{item.event.title}</strong><small>{formatMinute(item.event.minute)} {item.event.type.replaceAll("_", " ")}</small></span>
              <span className="alternative-impact">{item.impactScore}<small>/99</small></span>
              <ChevronRight size={16} />
            </button>)}
          </div>
        </section>}
      </> : <div className="empty-analysis"><Target size={22} /><h3>No candidate event found</h3><p>This fixture does not contain an event the ranking rules can evaluate.</p></div>}
    </section>
  );
}

function ReplayPanel({ match, eventIndex, playing, currentEvent, onPlay, onPause, onStep, onReset, onSeek, selectedCandidate }) {
  const score = eventIndex < 0 ? { home: 0, away: 0 } : {
    home: match.events[Math.min(eventIndex, match.events.length - 1)].homeScore,
    away: match.events[Math.min(eventIndex, match.events.length - 1)].awayScore
  };
  const isComplete = eventIndex >= match.events.length - 1;
  return (
    <aside className="replay-column" aria-label="Match replay and context">
      <section className="scoreboard-section">
        <div className="scoreboard-top"><span className="scoreboard-label">Match context</span><span className={"replay-state" + (playing ? " replay-state-live" : "")}>{playing ? "Replaying" : isComplete ? "Full time" : "Replay paused"}</span></div>
        <div className="scoreboard">
          <div className="score-team score-home"><TeamMark team={match.home} /><span><strong>{match.home.name}</strong><small>Home</small></span></div>
          <div className="score-center"><strong>{score.home}<i>:</i>{score.away}</strong><span>{currentEvent ? formatMinute(currentEvent.minute) : "00′"} {isComplete ? "Full time" : "Simulation"}</span></div>
          <div className="score-team score-away"><TeamMark team={match.away} /><span><strong>{match.away.name}</strong><small>Away</small></span></div>
        </div>
        <div className="scoreboard-bottom"><span>{match.venue}</span><span>{match.competition.split(" · ").join(", ")}</span></div>
      </section>

      <MomentumChart match={match} eventIndex={eventIndex} />

      <section className="playback-section" aria-label="Replay controls">
        <div className="playback-control-row">
          <div className="control-buttons">
            <button className="control-button" onClick={() => onStep(-1)} disabled={eventIndex < 0} aria-label="Previous event" title="Previous event"><ChevronLeft size={17} /></button>
            <button className="play-button" onClick={playing ? onPause : onPlay} aria-label={playing ? "Pause replay" : isComplete ? "Replay from start" : "Play replay"}>
              {playing ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
              <span>{playing ? "Pause" : isComplete ? "Replay" : eventIndex < 0 ? "Start" : "Resume"}</span>
            </button>
            <button className="control-button" onClick={() => onStep(1)} disabled={isComplete} aria-label="Next event" title="Next event"><ChevronRight size={17} /></button>
            <button className="reset-button" onClick={onReset} aria-label="Reset replay" title="Reset replay"><RotateCcw size={15} /></button>
          </div>
          <div className="progress-meta"><span>{eventIndex < 0 ? "Before kick-off" : formatMinute(currentEvent.minute)}</span><span>{match.events.length} events</span></div>
        </div>
        <input
          className="replay-slider"
          aria-label="Replay progress"
          type="range"
          min="0"
          max={match.events.length}
          value={eventIndex + 1}
          onChange={(event) => onSeek(Number(event.target.value) - 1)}
        />
        <Timeline match={match} eventIndex={eventIndex} selectedCandidate={selectedCandidate} onSeek={onSeek} />
      </section>

      <section className="sequence-section"><EventFeed match={match} eventIndex={eventIndex} onSeek={onSeek} /></section>
    </aside>
  );
}

function Workspace() {
  const [selectedMatchId, setSelectedMatchId] = useState(matches[0].id);
  const [eventIndex, setEventIndex] = useState(matches[0].events.length - 1);
  const [playing, setPlaying] = useState(false);
  const [viewMode, setViewMode] = useState("analyst");
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [foundryStatus, setFoundryStatus] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  const match = matches.find((item) => item.id === selectedMatchId) || matches[0];
  const analysis = useMemo(() => analyzeMatch(match), [match]);
  const candidate = analysis.candidates.find((item) => item.id === selectedCandidateId) || analysis.top;
  const currentEvent = eventIndex >= 0 ? match.events[Math.min(eventIndex, match.events.length - 1)] : null;

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
    const timer = window.setTimeout(() => setNotice(""), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function selectMatch(matchId) {
    const nextMatch = matches.find((item) => item.id === matchId);
    setPlaying(false);
    setEventIndex(nextMatch ? nextMatch.events.length - 1 : -1);
    setSelectedMatchId(matchId);
  }

  function playReplay() {
    if (eventIndex >= match.events.length - 1) setEventIndex(-1);
    setPlaying(true);
  }

  function seekTo(index) {
    setPlaying(false);
    setEventIndex(index);
  }

  function stepBy(offset) {
    setPlaying(false);
    setEventIndex((current) => Math.max(-1, Math.min(match.events.length - 1, current + offset)));
  }

  function selectCandidate(item) {
    setSelectedCandidateId(item.id);
    setExplanation(null);
    seekTo(item.index);
  }

  async function generateExplanation(item) {
    setLoading(true);
    setNotice("");
    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: match.id, candidateId: item.id, viewMode })
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
      setExplanation({ candidateId: item.id, text: result.narrative, claims: result.claims || [], provider: result.provider, usage: result.usage });
    } catch {
      setNotice("Could not reach the explanation service. The local explanation remains available.");
    } finally {
      setLoading(false);
    }
  }

  const finalScore = getFinalScore(match);
  return (
    <div className="site-shell">
      <SiteHeader foundryStatus={foundryStatus} activePage="workspace" />
      <main id="top" className="workspace-main">
        <section className="page-heading">
          <div><h1>Match review</h1><p>Validate the leading turning point against the event evidence.</p></div>
          <div className="report-context"><span><small>Report type</small><strong>Post-match analysis</strong></span><span><small>Data source</small><strong>Synthetic event feed</strong></span></div>
        </section>

        <section className="match-picker-section" aria-labelledby="match-picker-title">
          <div className="picker-heading"><div><h2 id="match-picker-title">Select a match</h2></div><span className="fixture-total">{String(matches.length).padStart(2, "0")} fixtures</span></div>
          <div className="match-picker">
            {matches.map((item) => <MatchCard key={item.id} match={item} active={item.id === match.id} onSelect={() => selectMatch(item.id)} />)}
          </div>
        </section>

        <section className="workspace-grid" aria-label="Analyst match review workspace">
          <InsightPanel
            match={match}
            analysis={analysis}
            viewMode={viewMode}
            setViewMode={setViewMode}
            selectedCandidateId={selectedCandidateId}
            onSelectCandidate={selectCandidate}
            foundryStatus={foundryStatus}
            explanation={explanation}
            loading={loading}
            onGenerate={generateExplanation}
          />
          <ReplayPanel
            match={match}
            eventIndex={eventIndex}
            playing={playing}
            currentEvent={currentEvent}
            onPlay={playReplay}
            onPause={() => setPlaying(false)}
            onStep={stepBy}
            onReset={() => { setPlaying(false); setEventIndex(-1); }}
            onSeek={seekTo}
            selectedCandidate={candidate}
          />
        </section>

      </main>
      <SiteFooter />
      {notice && <div role="status" className="toast"><Info size={16} />{notice}<button aria-label="Dismiss message" onClick={() => setNotice("")}>×</button></div>}
      <span className="sr-only">Final score {match.home.name} {finalScore.home}, {match.away.name} {finalScore.away}.</span>
    </div>
  );
}

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path === "/about") return <AboutPage />;
  if (path === "/privacy") return <PrivacyPolicyPage />;
  if (path === "/methodology") return <MethodologyPage />;
  return <Workspace />;
}
