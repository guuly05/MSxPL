export const matches = [
  {
    id: "harbor-reversal",
    competition: "Northstar Invitational · Match 08",
    dateLabel: "Synthetic fixture",
    venue: "Harbor Ground",
    home: { name: "Harbor City", short: "HBC", color: "#d9ff67" },
    away: { name: "Ridgevale FC", short: "RGV", color: "#b59aff" },
    story: "A late surge flips the result",
    resultLabel: "Late winner",
    events: [
      { id: "h-00", minute: 0, type: "kickoff", team: "neutral", title: "Kick-off", detail: "The match begins level.", homeScore: 0, awayScore: 0, homeControl: 50, awayControl: 50 },
      { id: "h-12", minute: 12, type: "shot", team: "away", title: "Ridgevale test the keeper", detail: "A quick break ends with a low shot from the edge of the area.", homeScore: 0, awayScore: 0, homeControl: 43, awayControl: 57 },
      { id: "h-24", minute: 24, type: "pressure", team: "home", title: "Harbor settle into possession", detail: "Harbor keep the ball and move play into the attacking half.", homeScore: 0, awayScore: 0, homeControl: 54, awayControl: 46 },
      { id: "h-38", minute: 38, type: "goal", team: "home", title: "Harbor take the lead", detail: "A cutback finds the runner, who finishes from close range.", homeScore: 1, awayScore: 0, homeControl: 69, awayControl: 31 },
      { id: "h-51", minute: 51, type: "shot", team: "away", title: "Ridgevale push back", detail: "A long-range effort forces a save and lifts the away side's pressure.", homeScore: 1, awayScore: 0, homeControl: 54, awayControl: 46 },
      { id: "h-64", minute: 64, type: "goal", team: "away", title: "Ridgevale equalize", detail: "A second-ball recovery leads to a finish across goal.", homeScore: 1, awayScore: 1, homeControl: 43, awayControl: 57 },
      { id: "h-71", minute: 71, type: "substitution", team: "home", title: "Harbor add fresh legs", detail: "A forward is replaced as Harbor look to regain territory.", homeScore: 1, awayScore: 1, homeControl: 47, awayControl: 53 },
      { id: "h-76", minute: 76, type: "pressure", team: "home", title: "Harbor win the second balls", detail: "Two quick recoveries keep the attack alive.", homeScore: 1, awayScore: 1, homeControl: 54, awayControl: 46 },
      { id: "h-78", minute: 78, type: "goal", team: "home", title: "Harbor strike again", detail: "A fast move across the box ends with the winning finish.", homeScore: 2, awayScore: 1, homeControl: 84, awayControl: 16 },
      { id: "h-84", minute: 84, type: "shot", team: "home", title: "Harbor threaten once more", detail: "The home side keep the pressure on with another shot.", homeScore: 2, awayScore: 1, homeControl: 80, awayControl: 20 },
      { id: "h-90", minute: 90, type: "fulltime", team: "neutral", title: "Full time", detail: "Harbor City close out the 2–1 result.", homeScore: 2, awayScore: 1, homeControl: 77, awayControl: 23 }
    ]
  },
  {
    id: "red-card-swing",
    competition: "Northstar Invitational · Match 12",
    dateLabel: "Synthetic fixture",
    venue: "Cedar Park",
    home: { name: "Eastgate United", short: "EGU", color: "#d9ff67" },
    away: { name: "Brookfield Rovers", short: "BKR", color: "#b59aff" },
    story: "A dismissal changes the balance",
    resultLabel: "Red-card swing",
    events: [
      { id: "e-00", minute: 0, type: "kickoff", team: "neutral", title: "Kick-off", detail: "The match begins level.", homeScore: 0, awayScore: 0, homeControl: 50, awayControl: 50 },
      { id: "e-13", minute: 13, type: "shot", team: "home", title: "Eastgate find an opening", detail: "A short passing move ends with a shot from the right channel.", homeScore: 0, awayScore: 0, homeControl: 58, awayControl: 42 },
      { id: "e-28", minute: 28, type: "pressure", team: "away", title: "Brookfield counter", detail: "Brookfield win the ball and carry play into the final third.", homeScore: 0, awayScore: 0, homeControl: 51, awayControl: 49 },
      { id: "e-42", minute: 42, type: "shot", team: "home", title: "Eastgate hit the post", detail: "A close-range attempt comes back off the frame.", homeScore: 0, awayScore: 0, homeControl: 57, awayControl: 43 },
      { id: "e-55", minute: 55, type: "pressure", team: "home", title: "Eastgate press higher", detail: "The home side recover the ball quickly on three successive attacks.", homeScore: 0, awayScore: 0, homeControl: 59, awayControl: 41 },
      { id: "e-62", minute: 62, type: "red_card", team: "home", title: "Eastgate reduced to ten", detail: "A second booking sends an Eastgate defender off.", homeScore: 0, awayScore: 0, homeControl: 47, awayControl: 53 },
      { id: "e-68", minute: 68, type: "shot", team: "away", title: "Brookfield test the keeper", detail: "Brookfield work a shot through a crowded area.", homeScore: 0, awayScore: 0, homeControl: 40, awayControl: 60 },
      { id: "e-74", minute: 74, type: "pressure", team: "away", title: "Brookfield sustain the attack", detail: "Brookfield keep possession around the penalty area.", homeScore: 0, awayScore: 0, homeControl: 34, awayControl: 66 },
      { id: "e-78", minute: 78, type: "goal", team: "away", title: "Brookfield take the lead", detail: "A low cross is turned in at the near post.", homeScore: 0, awayScore: 1, homeControl: 27, awayControl: 73 },
      { id: "e-86", minute: 86, type: "shot", team: "away", title: "Brookfield nearly add another", detail: "The away side create one more chance on the break.", homeScore: 0, awayScore: 1, homeControl: 30, awayControl: 70 },
      { id: "e-90", minute: 90, type: "fulltime", team: "neutral", title: "Full time", detail: "Brookfield Rovers win 1–0.", homeScore: 0, awayScore: 1, homeControl: 31, awayControl: 69 }
    ]
  },
  {
    id: "balanced-draw",
    competition: "Northstar Invitational · Match 17",
    dateLabel: "Synthetic fixture",
    venue: "Meadow Lane",
    home: { name: "Meadow Park", short: "MDP", color: "#d9ff67" },
    away: { name: "Stonebridge Athletic", short: "SBA", color: "#b59aff" },
    story: "A match without a clear swing",
    resultLabel: "Even contest",
    events: [
      { id: "m-00", minute: 0, type: "kickoff", team: "neutral", title: "Kick-off", detail: "The match begins level.", homeScore: 0, awayScore: 0, homeControl: 50, awayControl: 50 },
      { id: "m-11", minute: 11, type: "shot", team: "home", title: "Meadow send one wide", detail: "The first attempt misses the far post.", homeScore: 0, awayScore: 0, homeControl: 54, awayControl: 46 },
      { id: "m-23", minute: 23, type: "pressure", team: "away", title: "Stonebridge build patiently", detail: "The away side circulate possession without creating a clear chance.", homeScore: 0, awayScore: 0, homeControl: 48, awayControl: 52 },
      { id: "m-36", minute: 36, type: "goal", team: "home", title: "Meadow take the lead", detail: "A corner is met at the near post.", homeScore: 1, awayScore: 0, homeControl: 56, awayControl: 44 },
      { id: "m-49", minute: 49, type: "shot", team: "away", title: "Stonebridge reply", detail: "A shot from distance is held comfortably.", homeScore: 1, awayScore: 0, homeControl: 48, awayControl: 52 },
      { id: "m-61", minute: 61, type: "substitution", team: "away", title: "Stonebridge make a change", detail: "A fresh midfielder joins the match.", homeScore: 1, awayScore: 0, homeControl: 52, awayControl: 48 },
      { id: "m-69", minute: 69, type: "goal", team: "away", title: "Stonebridge equalize", detail: "A loose ball in the area is turned in.", homeScore: 1, awayScore: 1, homeControl: 46, awayControl: 54 },
      { id: "m-78", minute: 78, type: "shot", team: "home", title: "Meadow go close", detail: "A low shot is pushed around the post.", homeScore: 1, awayScore: 1, homeControl: 53, awayControl: 47 },
      { id: "m-87", minute: 87, type: "pressure", team: "away", title: "Stonebridge finish with the ball", detail: "The teams trade possession in midfield as the clock runs down.", homeScore: 1, awayScore: 1, homeControl: 49, awayControl: 51 },
      { id: "m-90", minute: 90, type: "fulltime", team: "neutral", title: "Full time", detail: "The match ends 1–1.", homeScore: 1, awayScore: 1, homeControl: 50, awayControl: 50 }
    ]
  }
];

export function getMatch(matchId) {
  return matches.find((match) => match.id === matchId);
}

export function getFinalScore(match) {
  const last = match.events[match.events.length - 1];
  return { home: last.homeScore, away: last.awayScore };
}

export function formatScore(home, away) {
  return String(home) + "–" + String(away);
}
