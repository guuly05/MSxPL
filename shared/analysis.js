const candidateTypes = new Set(["goal", "red_card", "penalty", "substitution", "shot"]);
const eventImpact = { goal: 18, red_card: 20, penalty: 16, substitution: 8, shot: 5 };

const eventNames = {
  goal: "goal",
  red_card: "red card",
  penalty: "penalty",
  substitution: "substitution",
  shot: "shot",
  pressure: "pressure shift",
  kickoff: "kick-off",
  fulltime: "full time"
};

function mean(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
}

function controlDifference(event) {
  return event.homeControl - event.awayControl;
}

function scoreText(home, away) {
  return String(home) + "–" + String(away);
}

function teamName(match, side) {
  return side === "home" ? match.home.name : match.away.name;
}

function candidateEvidence(match, event, previousEvent, before, after, scoreChanged, pressureShift, persistence) {
  const evidence = [];
  const eventTeam = event.team === "home" || event.team === "away" ? teamName(match, event.team) : "Both teams";
  evidence.push({
    id: "event-" + event.id,
    kind: "event",
    title: eventNames[event.type] || "match event",
    detail: String(event.minute) + "′ · " + eventTeam + " · " + event.title
  });

  if (scoreChanged) {
    evidence.push({
      id: "score-" + event.id,
      kind: "score",
      title: "Score changed",
      detail: scoreText(previousEvent.homeScore, previousEvent.awayScore) + " → " + scoreText(event.homeScore, event.awayScore)
    });
  }

  if (before.length && after.length && Math.abs(pressureShift) >= 8) {
    const beforeControl = Math.round(mean(before.map(controlDifference)));
    const afterControl = Math.round(mean(after.map(controlDifference)));
    const side = afterControl >= 0 ? match.home.name : match.away.name;
    evidence.push({
      id: "control-" + event.id,
      kind: "control",
      title: "Match control shifted",
      detail: "Average control moved from " + Math.abs(beforeControl) + "% toward " + (beforeControl >= 0 ? match.home.name : match.away.name) + " to " + Math.abs(afterControl) + "% toward " + side + "."
    });
  }

  if (after.length && persistence >= 0.55) {
    const side = mean(after.map(controlDifference)) >= 0 ? match.home.name : match.away.name;
    evidence.push({
      id: "persist-" + event.id,
      kind: "persistence",
      title: "The shift continued",
      detail: side + " held the stronger control signal across " + after.length + " later events."
    });
  }

  return evidence;
}

export function analyzeMatch(match, eventCount = match.events.length) {
  const visibleEvents = match.events.slice(0, clamp(eventCount, 0, match.events.length));
  const candidates = [];

  visibleEvents.forEach((event, index) => {
    if (!candidateTypes.has(event.type)) return;
    const previousEvent = visibleEvents[index - 1];
    const before = visibleEvents
      .slice(0, index)
      .filter((item) => event.minute - item.minute <= 10)
      .slice(-3);
    const after = visibleEvents
      .slice(index + 1)
      .filter((item) => item.minute - event.minute <= 10)
      .slice(0, 3);

    const beforeControl = mean(before.map(controlDifference));
    const afterControl = mean(after.map(controlDifference));
    const pressureShift = afterControl - beforeControl;
    const direction = Math.sign(pressureShift);
    const alignedAfter = direction === 0 ? [] : after.filter((item) => Math.sign(controlDifference(item) - beforeControl) === direction);
    const persistence = after.length ? alignedAfter.length / after.length : 0;
    const scoreChanged = Boolean(previousEvent &&
      (previousEvent.homeScore !== event.homeScore || previousEvent.awayScore !== event.awayScore));
    const pressurePoints = Math.min(34, Math.abs(pressureShift) * 0.55);
    const persistencePoints = persistence * 18;
    const scorePoints = scoreChanged ? 12 : 0;
    const impactScore = Math.round(clamp(12 + (eventImpact[event.type] || 0) + pressurePoints + persistencePoints + scorePoints, 0, 99));
    const evidence = candidateEvidence(match, event, previousEvent, before, after, scoreChanged, pressureShift, persistence);
    const signalCount = (scoreChanged ? 1 : 0) +
      (Math.abs(pressureShift) >= 8 ? 1 : 0) +
      (persistence >= 0.55 ? 1 : 0) +
      (event.type === "red_card" || event.type === "goal" || event.type === "penalty" ? 1 : 0);
    const reliableWindow = before.length >= 2 && after.length >= 2;

    candidates.push({
      id: event.id,
      event,
      index,
      impactScore,
      pressureShift,
      persistence,
      signalCount,
      reliableWindow,
      evidence,
      scoreBefore: previousEvent ? { home: previousEvent.homeScore, away: previousEvent.awayScore } : { home: 0, away: 0 },
      scoreAfter: { home: event.homeScore, away: event.awayScore }
    });
  });

  candidates.sort((a, b) => b.impactScore - a.impactScore || a.event.minute - b.event.minute);
  const top = candidates[0] || null;
  const runnerUp = candidates[1] || null;
  const separation = top ? top.impactScore - (runnerUp ? runnerUp.impactScore : 0) : 0;

  candidates.forEach((candidate) => {
    const isTop = candidate.id === (top && top.id);
    const gap = isTop ? separation : candidate.impactScore - (candidates[0]?.impactScore || 0);
    if (candidate.impactScore >= 76 && candidate.signalCount >= 3 && candidate.reliableWindow && gap >= 8) {
      candidate.confidence = "high";
    } else if (candidate.impactScore >= 52 && candidate.signalCount >= 2 && candidate.reliableWindow) {
      candidate.confidence = "medium";
    } else {
      candidate.confidence = "low";
    }
  });

  const noClearTurningPoint = Boolean(top && (top.impactScore < 49 || top.confidence === "low"));
  return {
    candidates,
    top,
    alternatives: candidates.slice(1, 3),
    noClearTurningPoint,
    eventCount: visibleEvents.length,
    complete: visibleEvents.length === match.events.length,
    confidence: top ? top.confidence : "low"
  };
}

export function buildFallbackExplanation(match, candidate, mode = "fan") {
  if (!candidate) {
    return "There is not enough match evidence yet to identify a turning point. Continue the replay and check again.";
  }
  const event = candidate.event;
  const eventTeam = event.team === "home" || event.team === "away" ? teamName(match, event.team) : "Both teams";
  const score = scoreText(event.homeScore, event.awayScore);
  if (candidate.confidence === "low") {
    return "The " + String(event.minute) + "′ " + eventNames[event.type] + " is the leading candidate, but the match data does not show a strong enough follow-on shift to call it a clear turning point.";
  }
  const detail = eventTeam + " " + event.title.toLowerCase() + " at " + String(event.minute) + "′. The score then stood at " + score + ".";
  const shiftSide = mean(match.events
    .slice(candidate.index + 1, candidate.index + 4)
    .map(controlDifference)) >= 0 ? match.home.name : match.away.name;
  const shift = "The following events show a sustained control signal toward " + shiftSide + ".";
  return mode === "analyst"
    ? detail + " The candidate scored " + candidate.impactScore + "/99 from " + candidate.signalCount + " supporting signals. " + shift
    : detail + " " + shift + " This is an evidence-based candidate, not proof that one event alone caused the result.";
}

export function formatMinute(minute) {
  return String(minute).padStart(2, "0") + "′";
}
