/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Users, CheckCircle, TrendingUp, Info, Activity, ArrowRight, Shield } from "lucide-react";
import { Group, Team, Match, AppState } from "../types";
import { Flag } from "./Flag";
import { MatchCalendarMenu } from "./MatchCalendarMenu";

interface GroupDetailProps {
  groups: Group[];
  teams: Team[];
  matches: Match[];
  onChangeState: (newState: Partial<AppState>) => void;
  selectedGroupId?: string;
}

export function GroupDetail({
  groups,
  teams,
  matches,
  onChangeState,
  selectedGroupId
}: GroupDetailProps) {
  // If no group is explicitly selected, default to Group A
  const activeGroupId = selectedGroupId || "A";

  // Group list categories
  const alphabet = "ABCDEFGHIJKL".split("");

  // Get active group team IDs
  const activeGroup = useMemo(() => {
    return groups.find(g => g.id === activeGroupId) || { id: activeGroupId, teams: [] };
  }, [groups, activeGroupId]);

  // Retrieve teams of this active group
  const activeTeams = useMemo(() => {
    return teams.filter(t => t.group === activeGroupId);
  }, [teams, activeGroupId]);

  // We can calculate deterministic high-fidelity group standouts (simulate games played and points)
  // based on team stats (e.g. championships, historical weight, alphabetical sort)
  const standoutsTable = useMemo(() => {
    // Proportional standing weights
    const getWeights = (teamId: string) => {
      const t = teams.find(team => team.id === teamId);
      if (!t) return { pts: 0, gf: 2, gc: 5 };
      let pts = 0;
      let gf = 0;
      let gc = 0;

      if (t.id === "ARG") { pts = 9; gf = 8; gc = 1; }
      else if (t.id === "MEX") { pts = 7; gf = 5; gc = 2; }
      else if (t.id === "BRA") { pts = 7; gf = 6; gc = 1; }
      else if (t.id === "USA") { pts = 5; gf = 4; gc = 3; }
      else if (t.id === "ALE") { pts = 6; gf = 5; gc = 3; }
      else if (t.id === "ESP") { pts = 7; gf = 7; gc = 2; }
      else if (t.id === "ING") { pts = 9; gf = 6; gc = 1; }
      else if (t.id === "FRA") { pts = 7; gf = 5; gc = 2; }
      else if (t.id === "POR") { pts = 7; gf = 6; gc = 3; }
      else if (t.id === "HOL") { pts = 6; gf = 4; gc = 3; }
      else if (t.id === "BEL") { pts = 6; gf = 5; gc = 2; }
      else if (t.id === "COL") { pts = 4; gf = 4; gc = 4; }
      else if (t.id === "URU") { pts = 4; gf = 3; gc = 3; }
      else if (t.id === "SUI") { pts = 4; gf = 3; gc = 4; }
      else if (t.id === "ECU") { pts = 4; gf = 3; gc = 3; }
      // Generic formula based on ID weight
      else {
        const sum = teamId.charCodeAt(0) + teamId.charCodeAt(1);
        pts = sum % 2 === 0 ? (sum % 3 === 0 ? 4 : 1) : 0;
        gf = (sum % 4) + 1;
        gc = (sum % 5) + 3;
      }
      return { pts, gf, gc };
    };

    const records = activeTeams.map(t => {
      const stats = getWeights(t.id);
      let pg = 3; // simulated games played
      let pe = stats.pts % 3 === 1 ? 1 : (stats.pts === 5 ? 2 : 0);
      let pg_won = Math.floor(stats.pts / 3);
      let pp = pg - pg_won - pe;
      if (stats.pts === 0) { pg_won = 0; pe = 0; pp = 3; }

      return {
        ...t,
        played: pg,
        points: stats.pts,
        won: pg_won,
        drawn: pe,
        lost: pp,
        gf: stats.gf,
        gc: stats.gc,
        gd: stats.gf - stats.gc
      };
    });

    // Sort by points desc, goal difference desc, goals for desc
    return records.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });
  }, [activeTeams, teams]);

  // List of group stage matches of the active group
  const groupStageMatches = useMemo(() => {
    return matches.filter(m => m.group === activeGroupId).sort((a, b) => a.id - b.id);
  }, [matches, activeGroupId]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* HEADER LEVEL TITLE */}
      <div className="space-y-3 relative pb-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
          <div className="space-y-1">
            <h2 className="font-sans text-2xl font-extrabold tracking-tight text-neutral-900 flex items-center gap-1.5">
              <Users className="h-6 w-6 text-[#1167b1]" />
              Grupos de la Copa del Mundo 2026
            </h2>
            <p className="text-xs text-neutral-500 font-sans">
              Navega entre los 12 grupos oficiales de 4 selecciones. Clasifican los 2 primeros puestos y los 8 mejores terceros a 16avos de final.
            </p>
          </div>
        </div>
        {/* Brand official spectrum decoration */}
        <div className="h-[3px] w-full flex rounded-full overflow-hidden opacity-95">
          <div className="h-full flex-1 bg-[#e61a22]" />
          <div className="h-full flex-1 bg-[#8c152d]" />
          <div className="h-full flex-1 bg-[#3c1642]" />
          <div className="h-full flex-1 bg-[#1ba3de]" />
          <div className="h-full flex-1 bg-[#1167b1]" />
          <div className="h-full flex-1 bg-[#032b53]" />
          <div className="h-full flex-1 bg-[#00a877]" />
          <div className="h-full flex-1 bg-[#5cd632]" />
          <div className="h-full flex-1 bg-[#0e5d32]" />
          <div className="h-full flex-1 bg-[#ff9f1c]" />
        </div>
      </div>

      {/* HORIZONTAL INTERACTIVE TABS LIST FOR GROUPS (A to L) */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-custom select-none">
        {alphabet.map(letter => {
          const isActive = letter === activeGroupId;
          return (
            <button
              key={letter}
              onClick={() => onChangeState({ selectedGroupId: letter })}
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-sans text-sm font-extrabold tracking-tight border focus:outline-hidden transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-500/10 transform scale-102"
                  : "bg-white border-neutral-200 hover:border-neutral-300 text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              G-{letter}
            </button>
          );
        })}
      </div>

      {/* Group overall tactical analysis notes (Moved here to span full width below keys and above grid) */}
      <div id="tactical-analysis-card" className="rounded-2xl border border-neutral-200/50 bg-white p-5 shadow-xs space-y-3">
        <h4 className="font-sans text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5 shrink-0">
          <Shield className="h-4 w-4 text-[#1167b1]" />
          Análisis Táctico
        </h4>
        <div className="font-sans text-xs text-neutral-500 leading-relaxed bg-[#1167b1]/5 border border-[#1167b1]/10 rounded-xl p-3.5">
          Este grupo ({activeGroupId}) reúne a competidores de gran nivel táctico. La regularidad en los partidos de ida y el cuidado en el promedio de diferencia de goles jugarán un papel crucial para definir los dos cupos directos hacia las llaves eliminatorias en las ciudades de Estados Unidos, México y Canadá.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* STANDINGS TABLE SNAPSHOT (Column Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-neutral-200/50 bg-white p-5 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-5">
              <h3 className="font-sans text-sm font-bold text-neutral-400 uppercase tracking-widest leading-none">
                Tabla de Posiciones — Grupo {activeGroupId}
              </h3>
              <span className="font-sans text-xs bg-indigo-50 p-1 border border-indigo-100/60 rounded-full font-bold text-indigo-600 inline-flex items-center gap-1">
                <Activity className="h-3.5 w-3.5" />
                Simulaciones FIFA
              </span>
            </div>

            {/* Standings Table content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-sm border-collapse">
                <thead>
                  <tr className="border-b border-neutral-100 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    <th className="py-2.5 pl-3">Pos</th>
                    <th className="py-2.5">Selección</th>
                    <th className="py-2.5 text-center font-mono">Pts</th>
                    <th className="py-2.5 text-center font-mono">PJ</th>
                    <th className="py-2.5 text-center font-mono hidden sm:table-cell">G</th>
                    <th className="py-2.5 text-center font-mono hidden sm:table-cell">E</th>
                    <th className="py-2.5 text-center font-mono hidden sm:table-cell">P</th>
                    <th className="py-2.5 text-center font-mono">GF:GC</th>
                    <th className="py-2.5 text-center font-mono">DG</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100/60">
                  {standoutsTable.map((record, index) => {
                    const pos = index + 1;
                    const isQualifiedZone = pos <= 2;
                    const isPossibleThird = pos === 3;

                    return (
                      <tr
                        key={record.id}
                        className="hover:bg-neutral-50/50 transition-colors"
                      >
                        {/* Position */}
                        <td className="py-3.5 pl-3 ">
                          <div className={`flex h-5 w-5 items-center justify-center rounded-md font-mono text-xs font-black leading-none ${
                            isQualifiedZone
                              ? "bg-emerald-500/10 text-emerald-600"
                              : isPossibleThird
                              ? "bg-amber-500/10 text-amber-600"
                              : "bg-neutral-100 text-neutral-500"
                          }`}>
                            {pos}
                          </div>
                        </td>

                        {/* Team Info */}
                        <td className="py-3.5 pr-2">
                          <div
                            onClick={() => onChangeState({ page: "team", selectedTeamId: record.id })}
                            className="flex items-center gap-2.5 group cursor-pointer select-none w-fit"
                          >
                            <Flag id={record.id} emoji={record.bandera} size="sm" />
                            <span className="font-sans font-semibold text-neutral-800 group-hover:text-rose-500 group-hover:underline transition-all truncate max-w-[125px] sm:max-w-none">
                              {record.name}
                            </span>
                            <span className="font-mono text-xs font-medium text-neutral-400 group-hover:text-rose-500">
                              {record.id}
                            </span>
                          </div>
                        </td>

                        {/* Points */}
                        <td className="py-3.5 text-center font-mono font-bold text-neutral-900 border-l border-neutral-100/40">
                          {record.points}
                        </td>

                        {/* Played */}
                        <td className="py-3.5 text-center font-mono text-neutral-500">
                          {record.played}
                        </td>

                        {/* Won (sm:table-cell) */}
                        <td className="py-3.5 text-center font-mono text-neutral-500 hidden sm:table-cell">
                          {record.won}
                        </td>

                        {/* Drawn (sm:table-cell) */}
                        <td className="py-3.5 text-center font-mono text-neutral-500 hidden sm:table-cell">
                          {record.drawn}
                        </td>

                        {/* Lost (sm:table-cell) */}
                        <td className="py-3.5 text-center font-mono text-neutral-500 hidden sm:table-cell">
                          {record.lost}
                        </td>

                        {/* GF:GC */}
                        <td className="py-3.5 text-center font-mono text-neutral-500">
                          {record.gf}:{record.gc}
                        </td>

                        {/* GD */}
                        <td className={`py-3.5 text-center font-mono font-bold ${
                          record.gd > 0 ? "text-emerald-500" : record.gd < 0 ? "text-rose-500" : "text-neutral-500"
                        }`}>
                          {record.gd > 0 ? `+${record.gd}` : record.gd}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Explanation zones notes */}
            <div className="flex gap-4 border-t border-neutral-100 pt-5 mt-4 select-none flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                <span>Puestos 1 & 2 - Clasifican Directo</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <div className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
                <span>Puesto 3 - Repechaje mejores terceros</span>
              </div>
            </div>
          </div>
        </div>

        {/* SIDE BAR SCHEDULE FOR THIS GROUP (Column Span 1) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200/50 bg-white p-5 shadow-xs">
            <h3 className="font-sans text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-1.5 leading-none">
              Partidos Asignados — Grupo {activeGroupId}
            </h3>

            <div className="space-y-4">
              {groupStageMatches.map(match => {
                const local = teams.find(t => t.id === match.localId);
                const visitor = teams.find(t => t.id === match.visitorId);

                return (
                  <div
                    key={match.id}
                    onClick={() => onChangeState({ page: "match", selectedMatchId: match.id })}
                    className="group border border-neutral-50 rounded-xl p-3.5 hover:bg-rose-50/20 hover:border-rose-200 cursor-pointer transition-all shadow-xs flex justify-between items-start gap-2"
                  >
                    <div className="space-y-2 min-w-0">
                      <span className="font-mono text-[10px] font-black text-rose-500 uppercase tracking-wide block leading-none">
                        Partido #{match.id}
                      </span>

                      {/* Opponents preview */}
                      <div className="flex items-center gap-2">
                        <Flag id={match.localId} emoji={local?.bandera} size="sm" />
                        <span className="text-xs text-neutral-300 font-black select-none">vs</span>
                        <Flag id={match.visitorId} emoji={visitor?.bandera} size="sm" />
                        <span className="font-sans font-bold text-xs text-neutral-800 group-hover:text-rose-500 transition-colors leading-none ml-1 truncate">
                          {match.localId} - {match.visitorId}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="text-right">
                        <span className="font-mono text-[10px] font-black text-neutral-800 block">
                          {match.time}
                        </span>
                        <span className="text-[10px] font-sans text-neutral-400 block mt-1 whitespace-nowrap">
                          {match.date}
                        </span>
                      </div>
                      <div className="w-28 mt-0.5" onClick={(e) => e.stopPropagation()}>
                        <MatchCalendarMenu match={match} teams={teams} align="right" />
                      </div>
                    </div>
                  </div>
                );
              })}

              {groupStageMatches.length === 0 && (
                <p className="text-center font-sans text-xs text-neutral-400 py-6">No hay partidos de fase de grupos asignados.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
