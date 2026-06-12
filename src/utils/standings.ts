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
  const standingsMap: { [key: string]: TeamStanding } = {};

  // Initialize standings for all teams provided
  teams.forEach(team => {
    standingsMap[team.id] = {
      ...team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      gc: 0,
      gd: 0,
      points: 0,
    };
  });

  // Process completed matches (only group phase for standings)
  matches.forEach(match => {
    if (match.phase === "grupo" && match.result) {
      const local = standingsMap[match.localId];
      const visitor = standingsMap[match.visitorId];

      if (local && visitor) {
        local.played += 1;
        visitor.played += 1;
        local.gf += match.result.localGoals;
        local.gc += match.result.visitorGoals;
        visitor.gf += match.result.visitorGoals;
        visitor.gc += match.result.localGoals;

        if (match.result.localGoals > match.result.visitorGoals) {
          local.won += 1;
          local.points += 3;
          visitor.lost += 1;
        } else if (match.result.localGoals < match.result.visitorGoals) {
          visitor.won += 1;
          visitor.points += 3;
          local.lost += 1;
        } else {
          local.drawn += 1;
          visitor.drawn += 1;
          local.points += 1;
          visitor.points += 1;
        }
        
        local.gd = local.gf - local.gc;
        visitor.gd = visitor.gf - visitor.gc;
      }
    }
  });

  // Sort by points, then GD, then GF
  return Object.values(standingsMap).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    return b.gf - a.gf;
  });
}
