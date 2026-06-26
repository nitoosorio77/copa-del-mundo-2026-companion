/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from "react";
import { Award, TrendingUp, Users, ChevronRight, Goal, ArrowDownUp } from "lucide-react";
import { Match, Team, AppState } from "../types";
import { Flag } from "./Flag";

interface TournamentScorersPageProps {
  matches: Match[];
  teams: Team[];
  onChangeState: (newState: Partial<AppState>) => void;
}

export function TournamentScorersPage({ matches, teams, onChangeState }: TournamentScorersPageProps) {
  const { finishers, matchesPlayedByTeam } = useMemo(() => {
    const scorersMap: { [key: string]: { name: string; teamId: string; goals: number } } = {};
    const playedMap: { [teamId: string]: number } = {};

    matches.forEach(m => {
      if (m.result) {
        playedMap[m.localId] = (playedMap[m.localId] || 0) + 1;
        playedMap[m.visitorId] = (playedMap[m.visitorId] || 0) + 1;

        if (m.result.goals) {
          m.result.goals.forEach(g => {
            if (g.isOwnGoal) return;
            const key = `${g.playerName}-${g.teamId}`;
            if (!scorersMap[key]) {
              scorersMap[key] = { name: g.playerName, teamId: g.teamId, goals: 0 };
            }
            scorersMap[key].goals++;
          });
        }
      }
    });

    const finishers = Object.values(scorersMap).sort((a, b) => {
      if (b.goals !== a.goals) return b.goals - a.goals;
      return a.name.localeCompare(b.name);
    });

    return { finishers, matchesPlayedByTeam: playedMap };
  }, [matches]);

  const [sortBy, setSortBy] = useState<"goals" | "team">("goals");

  const sortedFinishers = useMemo(() => {
    if (sortBy === "goals") return finishers;
    return [...finishers].sort((a, b) => {
      const teamA = teams.find(t => t.id === a.teamId)?.name ?? a.teamId;
      const teamB = teams.find(t => t.id === b.teamId)?.name ?? b.teamId;
      const cmp = teamA.localeCompare(teamB);
      if (cmp !== 0) return cmp;
      return b.goals - a.goals;
    });
  }, [finishers, sortBy, teams]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Title section */}
      <div className="space-y-3 relative pb-2">
        <div className="space-y-1">
          <h2 className="font-sans text-2xl font-extrabold tracking-tight text-neutral-900 flex items-center gap-1.5 animate-fade-in">
            <Award className="h-6 w-6 text-rose-500 shrink-0" />
            Goleadores del Torneo
          </h2>
          <p className="text-xs text-neutral-500 font-sans">
            Seguimiento en tiempo real de los máximos anotadores de la Copa del Mundo FIFA 2026.
          </p>
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

      {/* Podium / Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-3xl border border-neutral-200/50 bg-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-rose-500/5 blur-3xl" />
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="flex flex-col items-center justify-center p-8 bg-rose-50 rounded-2xl border border-rose-100 shrink-0">
              <TrendingUp className="h-10 w-10 text-rose-500 mb-2" />
              <span className="font-sans text-[10px] font-bold text-rose-600 uppercase tracking-widest leading-none">Bota de Oro</span>
              <span className="font-mono text-4xl font-black text-rose-600 mt-2">
                {finishers[0]?.goals || 0}
              </span>
              <span className="text-xs text-rose-400 font-medium">Goles Líder</span>
            </div>
            <div className="space-y-4 text-center sm:text-left">
              <h3 className="font-sans text-xl font-bold tracking-tight text-neutral-900">
                Carrera por la Gloria
              </h3>
              <p className="text-sm text-neutral-500 font-sans leading-relaxed">
                {finishers.length > 0 
                  ? `${finishers[0].name} de ${teams.find(t => t.id === finishers[0].teamId)?.name || finishers[0].teamId} lidera actualmente la competencia con ${finishers[0].goals} goles.` 
                  : "Aún no se han registrado goles en el torneo."}
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-[10px] font-bold text-neutral-600 uppercase">
                  {finishers.length} Jugadores Anotaron
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-[10px] font-bold text-neutral-600 uppercase">
                  {matches.filter(m => m.result).length} Partidos Jugados
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-3xl p-6 sm:p-8 shadow-xl shadow-neutral-950/20 text-white relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-rose-500/10 blur-3xl" />
          <h4 className="font-sans text-xs font-black text-rose-500 uppercase tracking-widest">Información</h4>
          <h3 className="font-sans text-lg font-bold mt-2">Criterio de Desempate</h3>
          <ul className="mt-4 space-y-3">
            {[
              { label: "Goles", desc: "Máxima cantidad" },
              { label: "Asistencias", desc: "No registradas aún" },
              { label: "Minutos", desc: "Menos jugados" }
            ].map((item, i) => (
              <li key={i} className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs text-neutral-400">{item.label}</span>
                <span className="text-xs font-bold text-white uppercase">{item.desc}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* MAIN TABLE */}
      <div className="rounded-3xl border border-neutral-200/50 bg-white shadow-xs overflow-hidden">
        <div className="flex items-center gap-2 px-6 pt-4 pb-2">
          <ArrowDownUp className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mr-2">Ordenar por</span>
          <button
            onClick={() => setSortBy("goals")}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
              sortBy === "goals"
                ? "bg-rose-500 text-white"
                : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
            }`}
          >
            Goles
          </button>
          <button
            onClick={() => setSortBy("team")}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
              sortBy === "team"
                ? "bg-rose-500 text-white"
                : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
            }`}
          >
            Selección
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-sm border-collapse">
            <thead>
              <tr className="bg-neutral-50/50 border-b border-neutral-100 text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                <th className="py-4 pl-6 w-16">{sortBy === "goals" ? "Pos" : "#"}</th>
                <th className="py-4">Jugador</th>
                <th
                  className="py-4 cursor-pointer hover:text-rose-500 transition-colors select-none"
                  onClick={() => setSortBy(sortBy === "team" ? "goals" : "team")}
                >
                  <span className="flex items-center gap-1">
                    Selección
                    {sortBy === "team" && <ArrowDownUp className="h-3 w-3 text-rose-500" />}
                  </span>
                </th>
                <th className="py-4 text-center w-20">PJ</th>
                <th className="py-4 text-center font-mono w-24">Goles</th>
                <th className="py-4 pr-6 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100/60">
              {sortedFinishers.length > 0 ? sortedFinishers.map((player, idx) => {
                const team = teams.find(t => t.id === player.teamId);
                const goalRank = finishers.indexOf(player);
                const isLeader = goalRank === 0;

                return (
                  <tr key={`${player.teamId}-${player.name}`} className="group hover:bg-neutral-50/50 transition-all duration-200">
                    <td className="py-4 pl-6">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                        isLeader
                          ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                          : "bg-neutral-100 text-neutral-500"
                      }`}>
                        {sortBy === "goals" ? idx + 1 : goalRank + 1}
                      </div>
                    </td>
                    <td className="py-4">
                      <div 
                        onClick={() => onChangeState({ page: "player", selectedPlayerName: player.name, selectedTeamId: player.teamId })}
                        className="flex flex-col cursor-pointer hover:translate-x-1 transition-transform"
                      >
                        <span className="font-sans font-bold text-neutral-900 text-base group-hover:text-rose-500 transition-colors">
                          {player.name}
                        </span>
                        <span className="text-[10px] text-neutral-400 uppercase font-black tracking-widest">Delantero</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div 
                        onClick={() => onChangeState({ page: "team", selectedTeamId: player.teamId })}
                        className="flex items-center gap-3 cursor-pointer group/team"
                      >
                        <Flag id={player.teamId} emoji={team?.bandera} size="md" />
                        <span className="font-sans font-semibold text-neutral-700 group-hover/team:text-rose-500 group-hover/team:underline decoration-2 transition-all">
                          {team ? team.name : player.teamId}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <span className="font-mono text-sm font-bold text-neutral-400">
                        {matchesPlayedByTeam[player.teamId] ?? 0}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-neutral-900 text-white font-mono text-xl font-black shadow-lg shadow-neutral-950/10">
                        {player.goals}
                      </div>
                    </td>
                    <td className="py-4 pr-6 text-right">
                      <button 
                        onClick={() => onChangeState({ page: "player", selectedPlayerName: player.name, selectedTeamId: player.teamId })}
                        className="text-neutral-300 group-hover:text-rose-500 transition-colors"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 opacity-30 grayscale">
                      <Goal className="h-12 w-12" />
                      <p className="font-sans font-bold text-neutral-500">Todavía no hay registros.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
