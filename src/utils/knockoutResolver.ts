/**
 * Resolves knockout match team IDs from group stage results.
 * Applies FIFA 2026 tiebreaker rules (head-to-head → overall GD → GF → fair play).
 */

import { Team, Match, Group } from "../types";

// --- BRACKET STRUCTURE ---

// Fixed R32 matchups: group positions are determined, no 3rd-place involved
const FIXED_MATCHUPS: Array<{
  matchId: number;
  localPos: 1 | 2;
  localGroup: string;
  visitorPos: 1 | 2;
  visitorGroup: string;
}> = [
  { matchId: 73, localPos: 2, localGroup: "A", visitorPos: 2, visitorGroup: "B" },
  { matchId: 75, localPos: 1, localGroup: "F", visitorPos: 2, visitorGroup: "C" },
  { matchId: 76, localPos: 1, localGroup: "C", visitorPos: 2, visitorGroup: "F" },
  { matchId: 78, localPos: 2, localGroup: "E", visitorPos: 2, visitorGroup: "I" },
  { matchId: 83, localPos: 2, localGroup: "K", visitorPos: 2, visitorGroup: "L" },
  { matchId: 84, localPos: 1, localGroup: "H", visitorPos: 2, visitorGroup: "J" },
  { matchId: 86, localPos: 1, localGroup: "J", visitorPos: 2, visitorGroup: "H" },
  { matchId: 88, localPos: 2, localGroup: "D", visitorPos: 2, visitorGroup: "G" },
];

// Variable R32 matchups: group winner faces one of the best 8 3rd-place teams
// eligibleThirdGroups = all possible source groups across the 495 FIFA Annex-C combinations
const WINNER_VS_THIRD: Array<{
  matchId: number;
  winnerGroup: string;
  eligibleThirdGroups: string[];
}> = [
  { matchId: 74, winnerGroup: "E", eligibleThirdGroups: ["A", "B", "C", "D", "F"] },
  { matchId: 77, winnerGroup: "I", eligibleThirdGroups: ["C", "D", "F", "G", "H"] },
  { matchId: 79, winnerGroup: "A", eligibleThirdGroups: ["C", "E", "F", "H", "I"] },
  { matchId: 80, winnerGroup: "L", eligibleThirdGroups: ["E", "H", "I", "J", "K"] },
  { matchId: 81, winnerGroup: "D", eligibleThirdGroups: ["B", "E", "F", "I", "J"] },
  { matchId: 82, winnerGroup: "G", eligibleThirdGroups: ["A", "E", "H", "I", "J"] },
  { matchId: 85, winnerGroup: "B", eligibleThirdGroups: ["E", "F", "G", "I", "J"] },
  { matchId: 87, winnerGroup: "K", eligibleThirdGroups: ["D", "E", "I", "J", "L"] },
];

// --- INTERNAL TYPES ---

interface GroupStats {
  teamId: string;
  points: number;
  gd: number;
  gf: number;
  fairPlay: number; // lower = better (Y=1, R=3)
}

// --- STATISTICS ---

function calcStats(teamIds: string[], matchSubset: Match[]): Map<string, GroupStats> {
  const map = new Map<string, GroupStats>();
  for (const id of teamIds) {
    map.set(id, { teamId: id, points: 0, gd: 0, gf: 0, fairPlay: 0 });
  }

  for (const m of matchSubset) {
    if (!m.result) continue;
    const local = map.get(m.localId);
    const visitor = map.get(m.visitorId);
    if (!local || !visitor) continue;

    const lg = m.result.localGoals;
    const vg = m.result.visitorGoals;
    local.gf += lg; local.gd += lg - vg;
    visitor.gf += vg; visitor.gd += vg - lg;

    if (lg > vg) { local.points += 3; }
    else if (lg < vg) { visitor.points += 3; }
    else { local.points += 1; visitor.points += 1; }

    for (const card of m.result.cards) {
      const s = map.get(card.teamId);
      if (s) s.fairPlay += card.type === "yellow" ? 1 : 3;
    }
  }

  return map;
}

// --- FIFA TIEBREAKER SORT ---

// Sorts a set of teams tied on points, applying H2H then overall criteria.
// allGroupMatches = all completed matches of that group.
function breakTie(tied: string[], allGroupMatches: Match[]): string[] {
  if (tied.length <= 1) return tied;

  const tiedSet = new Set(tied);
  const h2hMatches = allGroupMatches.filter(
    m => m.result && tiedSet.has(m.localId) && tiedSet.has(m.visitorId)
  );
  const h2h = calcStats(tied, h2hMatches);

  // Sort by H2H pts, H2H GD, H2H GF
  const sorted = [...tied].sort((a, b) => {
    const ha = h2h.get(a)!;
    const hb = h2h.get(b)!;
    if (hb.points !== ha.points) return hb.points - ha.points;
    if (hb.gd !== ha.gd) return hb.gd - ha.gd;
    return hb.gf - ha.gf;
  });

  // Group into sub-groups still tied after H2H
  const result: string[] = [];
  let i = 0;
  while (i < sorted.length) {
    let j = i + 1;
    const ref = h2h.get(sorted[i])!;
    while (j < sorted.length) {
      const cmp = h2h.get(sorted[j])!;
      if (cmp.points !== ref.points || cmp.gd !== ref.gd || cmp.gf !== ref.gf) break;
      j++;
    }
    const subGroup = sorted.slice(i, j);
    if (subGroup.length === 1) {
      result.push(...subGroup);
    } else if (subGroup.length < tied.length) {
      // Some teams separated → re-apply H2H among the remaining tied sub-group
      result.push(...breakTie(subGroup, allGroupMatches));
    } else {
      // Nobody separated by H2H → apply overall criteria
      result.push(...sortByOverall(subGroup, allGroupMatches));
    }
    i = j;
  }
  return result;
}

function sortByOverall(teamIds: string[], allGroupMatches: Match[]): string[] {
  // Compute each team's stats across ALL their group matches (not just mutual matches).
  // calcStats() filters to matches where both teams are in teamIds, which would only
  // count head-to-head results — incorrect for the "overall" tiebreaker criteria.
  const tiedSet = new Set(teamIds);
  const overall = new Map<string, GroupStats>();
  for (const id of teamIds) {
    overall.set(id, { teamId: id, points: 0, gd: 0, gf: 0, fairPlay: 0 });
  }
  for (const m of allGroupMatches) {
    if (!m.result) continue;
    const lg = m.result.localGoals;
    const vg = m.result.visitorGoals;
    if (tiedSet.has(m.localId)) {
      const s = overall.get(m.localId)!;
      s.gf += lg; s.gd += lg - vg;
      if (lg > vg) s.points += 3; else if (lg === vg) s.points += 1;
    }
    if (tiedSet.has(m.visitorId)) {
      const s = overall.get(m.visitorId)!;
      s.gf += vg; s.gd += vg - lg;
      if (vg > lg) s.points += 3; else if (vg === lg) s.points += 1;
    }
    for (const card of m.result.cards) {
      const s = overall.get(card.teamId);
      if (s) s.fairPlay += card.type === "yellow" ? 1 : 3;
    }
  }
  return [...teamIds].sort((a, b) => {
    const sa = overall.get(a)!;
    const sb = overall.get(b)!;
    if (sb.gd !== sa.gd) return sb.gd - sa.gd;
    if (sb.gf !== sa.gf) return sb.gf - sa.gf;
    if (sa.fairPlay !== sb.fairPlay) return sa.fairPlay - sb.fairPlay;
    return a.localeCompare(b);
  });
}

// Returns team IDs sorted 1st → last in the group, applying full FIFA tiebreakers.
function rankGroup(teamIds: string[], groupMatches: Match[]): string[] {
  const overall = calcStats(teamIds, groupMatches);
  // Sort by points first
  const byPoints = [...teamIds].sort((a, b) => overall.get(b)!.points - overall.get(a)!.points);

  const result: string[] = [];
  let i = 0;
  while (i < byPoints.length) {
    let j = i + 1;
    const pts = overall.get(byPoints[i])!.points;
    while (j < byPoints.length && overall.get(byPoints[j])!.points === pts) j++;
    const tied = byPoints.slice(i, j);
    result.push(...(tied.length === 1 ? tied : breakTie(tied, groupMatches)));
    i = j;
  }
  return result;
}

// --- THIRD-PLACE ASSIGNMENT (BIPARTITE MATCHING) ---

// Given the 8 qualifying groups (sorted best→worst), find which group fills each slot.
// Uses backtracking with most-constrained-first heuristic.
// For ambiguous cases, tries groups in rank order (best qualifying 3rd first).
function assignThirdPlaceSlots(qualifyingGroups: string[]): Map<number, string> {
  const result = new Map<number, string>();
  const remaining = new Set(qualifyingGroups);

  // Pre-compute eligible qualifying groups per slot, sorted by rank
  const slots = WINNER_VS_THIRD
    .map(slot => ({
      matchId: slot.matchId,
      eligible: slot.eligibleThirdGroups
        .filter(g => remaining.has(g))
        .sort((a, b) => qualifyingGroups.indexOf(a) - qualifyingGroups.indexOf(b)),
    }))
    .sort((a, b) => a.eligible.length - b.eligible.length); // most-constrained first

  function backtrack(idx: number): boolean {
    if (idx === slots.length) return true;
    const slot = slots[idx];
    for (const g of slot.eligible) {
      if (!remaining.has(g)) continue;
      result.set(slot.matchId, g);
      remaining.delete(g);
      if (backtrack(idx + 1)) return true;
      remaining.add(g);
      result.delete(slot.matchId);
    }
    return false;
  }

  backtrack(0);
  return result;
}

// --- MAIN EXPORT ---

export function resolveKnockoutMatches(
  _teams: Team[],
  groupData: Group[],
  matches: Match[]
): void {
  // Collect group-phase matches per group
  const matchesByGroup: { [g: string]: Match[] } = {};
  for (const m of matches) {
    if (m.phase === "grupo") {
      if (!matchesByGroup[m.group]) matchesByGroup[m.group] = [];
      matchesByGroup[m.group].push(m);
    }
  }

  // Check group completeness and compute rankings
  const groupRankings: { [g: string]: string[] } = {};
  const groupComplete: { [g: string]: boolean } = {};

  for (const gd of groupData) {
    const gMatches = matchesByGroup[gd.id] ?? [];
    const expected = (gd.teams.length * (gd.teams.length - 1)) / 2;
    const done = gMatches.filter(m => !!m.result).length;
    groupComplete[gd.id] = done === expected && expected > 0;
    if (groupComplete[gd.id]) {
      groupRankings[gd.id] = rankGroup(gd.teams, gMatches);
    }
  }

  // Resolve fixed matchups (1st/2nd place teams)
  for (const { matchId, localPos, localGroup, visitorPos, visitorGroup } of FIXED_MATCHUPS) {
    const m = matches.find(x => x.id === matchId);
    if (!m) continue;
    if (groupComplete[localGroup]) m.localId = groupRankings[localGroup][localPos - 1];
    if (groupComplete[visitorGroup]) m.visitorId = groupRankings[visitorGroup][visitorPos - 1];
  }

  // Resolve group winners for variable matchups
  for (const { matchId, winnerGroup } of WINNER_VS_THIRD) {
    const m = matches.find(x => x.id === matchId);
    if (!m) continue;
    if (groupComplete[winnerGroup]) m.localId = groupRankings[winnerGroup][0];
  }

  // Resolve 3rd-place slots only when all 12 groups are complete
  if (!groupData.every(gd => groupComplete[gd.id])) return;

  // Gather all 12 3rd-place teams with their stats
  const thirdPlace: Array<{ groupId: string; teamId: string; stats: GroupStats }> = [];
  for (const gd of groupData) {
    const thirdId = groupRankings[gd.id]?.[2];
    if (!thirdId) continue;
    const stats = calcStats(
      gd.teams,
      matchesByGroup[gd.id] ?? []
    ).get(thirdId);
    if (stats) thirdPlace.push({ groupId: gd.id, teamId: thirdId, stats });
  }

  // Sort 3rd-place teams: pts → GD → GF → fair play → alphabetical
  thirdPlace.sort((a, b) => {
    if (b.stats.points !== a.stats.points) return b.stats.points - a.stats.points;
    if (b.stats.gd !== a.stats.gd) return b.stats.gd - a.stats.gd;
    if (b.stats.gf !== a.stats.gf) return b.stats.gf - a.stats.gf;
    if (a.stats.fairPlay !== b.stats.fairPlay) return a.stats.fairPlay - b.stats.fairPlay;
    return a.teamId.localeCompare(b.teamId);
  });

  const top8 = thirdPlace.slice(0, 8);
  const qualifyingGroupIds = top8.map(t => t.groupId);
  const slotMap = assignThirdPlaceSlots(qualifyingGroupIds);

  for (const { matchId } of WINNER_VS_THIRD) {
    const m = matches.find(x => x.id === matchId);
    if (!m) continue;
    const assignedGroup = slotMap.get(matchId);
    if (!assignedGroup) continue;
    const entry = top8.find(t => t.groupId === assignedGroup);
    if (entry) m.visitorId = entry.teamId;
  }
}
