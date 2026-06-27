import { Match, Team } from "../types";

export interface TeamStanding extends Team {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  gc: number;
  gd: number;
  points: number;
}

export function calculateStandings(teams: Team[], matches: Match[]): TeamStanding[] {
  const map: { [key: string]: TeamStanding } = {};

  teams.forEach(team => {
    map[team.id] = {
      ...team,
      played: 0, won: 0, drawn: 0, lost: 0,
      gf: 0, gc: 0, gd: 0, points: 0,
    };
  });

  matches.forEach(m => {
    if (!m.result) return;
    const local = map[m.localId];
    const visitor = map[m.visitorId];
    if (!local || !visitor) return;

    const lg = m.result.localGoals;
    const vg = m.result.visitorGoals;

    local.played++;    visitor.played++;
    local.gf += lg;   local.gc += vg;
    visitor.gf += vg; visitor.gc += lg;

    if (lg > vg) {
      local.won++;   local.points += 3; visitor.lost++;
    } else if (lg < vg) {
      visitor.won++; visitor.points += 3; local.lost++;
    } else {
      local.drawn++;  visitor.drawn++;
      local.points++; visitor.points++;
    }

    local.gd   = local.gf - local.gc;
    visitor.gd = visitor.gf - visitor.gc;
  });

  const all = Object.values(map);
  return rankWithFIFATiebreaker(all, matches);
}

// --- FIFA tiebreaker: H2H → overall GD/GF → fair play → alphabetical ---

function fairPlay(teamId: string, matches: Match[]): number {
  let fp = 0;
  for (const m of matches) {
    if (!m.result) continue;
    for (const c of m.result.cards) {
      if (c.teamId === teamId) fp += c.type === "yellow" ? 1 : 3;
    }
  }
  return fp;
}

function calcH2H(
  tiedIds: string[],
  matches: Match[]
): Map<string, { pts: number; gd: number; gf: number }> {
  const tiedSet = new Set(tiedIds);
  const h2h = new Map<string, { pts: number; gd: number; gf: number }>();
  tiedIds.forEach(id => h2h.set(id, { pts: 0, gd: 0, gf: 0 }));

  for (const m of matches) {
    if (!m.result) continue;
    if (!tiedSet.has(m.localId) || !tiedSet.has(m.visitorId)) continue;
    const lg = m.result.localGoals;
    const vg = m.result.visitorGoals;
    const l = h2h.get(m.localId)!;
    const v = h2h.get(m.visitorId)!;
    l.gf += lg; l.gd += lg - vg;
    v.gf += vg; v.gd += vg - lg;
    if (lg > vg)      { l.pts += 3; }
    else if (lg < vg) { v.pts += 3; }
    else              { l.pts++; v.pts++; }
  }
  return h2h;
}

function breakTie(tied: TeamStanding[], matches: Match[]): TeamStanding[] {
  if (tied.length <= 1) return tied;

  const h2h = calcH2H(tied.map(t => t.id), matches);

  const sorted = [...tied].sort((a, b) => {
    const ha = h2h.get(a.id)!;
    const hb = h2h.get(b.id)!;
    if (hb.pts !== ha.pts) return hb.pts - ha.pts;
    if (hb.gd  !== ha.gd)  return hb.gd  - ha.gd;
    return hb.gf - ha.gf;
  });

  const result: TeamStanding[] = [];
  let i = 0;
  while (i < sorted.length) {
    let j = i + 1;
    const ref = h2h.get(sorted[i].id)!;
    while (j < sorted.length) {
      const cmp = h2h.get(sorted[j].id)!;
      if (cmp.pts !== ref.pts || cmp.gd !== ref.gd || cmp.gf !== ref.gf) break;
      j++;
    }
    const sub = sorted.slice(i, j);
    if (sub.length === 1) {
      result.push(...sub);
    } else if (sub.length < tied.length) {
      // Some separated → re-apply H2H among the sub-group
      result.push(...breakTie(sub, matches));
    } else {
      // Nobody separated by H2H → overall GD, GF, fair play, alphabetical
      result.push(
        ...sub.sort((a, b) => {
          if (b.gd !== a.gd) return b.gd - a.gd;
          if (b.gf !== a.gf) return b.gf - a.gf;
          const fpA = fairPlay(a.id, matches);
          const fpB = fairPlay(b.id, matches);
          if (fpA !== fpB) return fpA - fpB;
          return a.id.localeCompare(b.id);
        })
      );
    }
    i = j;
  }
  return result;
}

function rankWithFIFATiebreaker(teams: TeamStanding[], matches: Match[]): TeamStanding[] {
  const byPoints = [...teams].sort((a, b) => b.points - a.points);
  const result: TeamStanding[] = [];
  let i = 0;
  while (i < byPoints.length) {
    let j = i + 1;
    while (j < byPoints.length && byPoints[j].points === byPoints[i].points) j++;
    const tied = byPoints.slice(i, j);
    result.push(...(tied.length === 1 ? tied : breakTie(tied, matches)));
    i = j;
  }
  return result;
}
