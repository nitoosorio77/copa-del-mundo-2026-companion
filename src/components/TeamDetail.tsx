/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { Users, Calendar, Award, Compass, Shield, ArrowRight, Clock, MapPin } from "lucide-react";
import { Team, Player, Match, AppState } from "../types";
import { Flag } from "./Flag";
import { MatchCalendarMenu } from "./MatchCalendarMenu";

interface TeamDetailProps {
  teamId: string;
  teams: Team[];
  players: Player[];
  matches: Match[];
  onChangeState: (newState: Partial<AppState>) => void;
}

export function TeamDetail({ teamId, teams, players, matches, onChangeState }: TeamDetailProps) {
  const team = useMemo(() => teams.find(t => t.id === teamId), [teams, teamId]);

  if (!team) {
    return (
      <div className="mx-auto max-w-lg p-12 text-center">
        <p className="text-neutral-500 font-sans">No se encontró la selección solicitada.</p>
      </div>
    );
  }

  // filter players of this team
  const roster = useMemo(() => players.filter(p => p.equipoId === teamId), [players, teamId]);

  // Group roster by position
  const groupedRoster = useMemo(() => {
    const categories = ["Portero", "Defensa", "Mediocampista", "Delantero"];
    const groups: { [key: string]: Player[] } = {};
    categories.forEach(cat => {
      groups[cat] = roster.filter(p => p.posicion === cat);
    });
    return groups;
  }, [roster]);

  // filter match schedules for this team
  const teamMatches = useMemo(() => {
    return matches
      .filter(m => m.localId === teamId || m.visitorId === teamId)
      .sort((a, b) => a.id - b.id);
  }, [matches, teamId]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Return button */}
      <div>
        <button
          onClick={() => onChangeState({ page: "home" })}
          className="text-xs font-sans font-bold text-neutral-500 hover:text-rose-500 flex items-center gap-1 select-none cursor-pointer"
        >
          &larr; Volver al Calendario General
        </button>
      </div>

      {/* TEAM PROFILE HERO HEADER */}
      <div className="relative overflow-hidden rounded-3xl border border-neutral-200/50 bg-white p-6 sm:p-10 shadow-sm">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-500/5 blur-3xl" />

        <div className="relative flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <Flag id={team.id} emoji={team.bandera} size="xl" />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <span className="font-mono text-xs font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                  Grupo {team.group}
                </span>
                <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest leading-none">
                  {team.confederation}
                </span>
              </div>
              <h2 className="font-sans text-3xl font-extrabold tracking-tight text-neutral-900 leading-none">
                {team.fullName}
              </h2>
              <p className="text-sm font-sans text-neutral-500">
                Director Técnico: <strong className="text-neutral-800">{team.dt}</strong>
              </p>
            </div>
          </div>

          {/* Championships stars board */}
          {team.campeonatos > 0 && (
            <div className="flex flex-col items-center justify-center bg-amber-50/50 border border-amber-100 rounded-2xl p-4 shrink-0 min-w-[120px]">
              <Award className="h-6 w-6 text-amber-500 mb-1" />
              <div className="flex gap-0.5">
                {Array.from({ length: team.campeonatos }).map((_, i) => (
                  <span key={i} className="text-amber-500 text-lg leading-none" title="Campeonatos Mundiales">⭐</span>
                ))}
              </div>
              <span className="font-sans text-[10px] text-amber-700 uppercase font-extrabold tracking-wider mt-1.5">
                {team.campeonatos} Títulos
              </span>
            </div>
          )}
        </div>

        {/* Quick historical facts sub-section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-neutral-100 relative select-none">
          <div className="absolute -top-[1.5px] left-0 right-0 h-[3px] flex rounded-full overflow-hidden opacity-90">
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
          {[
            { label: "Posición Clasificatorias", val: team.posicionClasificatoria },
            { label: "Último Mundial", val: team.ultimoMundial },
            { label: "Subcampeonatos", val: team.subcampeonatos > 0 ? `${team.subcampeonatos} veces` : "0" },
            { label: "Plantilla Registrada", val: `${roster.length} jugadores` }
          ].map((fact, i) => (
            <div key={i} className="text-center sm:text-left p-1 rounded-lg">
              <span className="text-[10px] font-sans font-bold text-neutral-400 uppercase tracking-widest">{fact.label}</span>
              <p className="font-sans text-sm font-bold text-neutral-800 mt-1">{fact.val}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SQUAD ROSTER ACCORDIONS / CATEGORIES (Column Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-sans text-base font-bold text-neutral-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-500" />
            Hojas de Jugadores
          </h3>

          <div className="space-y-6">
            {Object.keys(groupedRoster).map(pos => {
              const list = groupedRoster[pos];
              if (list.length === 0) return null;

              return (
                <div key={pos} className="rounded-2xl border border-neutral-200/50 bg-white p-5 shadow-xs">
                  <h4 className="font-sans text-xs font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-2.5 mb-3 flex items-center justify-between">
                    {pos}s
                    <span className="font-mono text-xs font-bold text-emerald-500 bg-emerald-50/50 border border-emerald-100 px-2 py-0.5 rounded-full">
                      {list.length}
                    </span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {list.map(player => (
                      <div
                        key={player.id}
                        onClick={() => onChangeState({ page: "player", selectedPlayerName: player.name, selectedTeamId: teamId })}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-100 hover:border-emerald-200 hover:bg-emerald-50/20 cursor-pointer select-none transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-50 border border-neutral-200 font-mono text-xs font-bold text-neutral-500 group-hover:border-emerald-300 group-hover:text-emerald-600">
                            {player.dorsal || "—"}
                          </div>
                          <div>
                            <span className="font-sans text-xs font-bold text-neutral-800 group-hover:text-emerald-600 block transition-colors leading-none">
                              {player.name} {player.capitan && "⭐"}
                            </span>
                            <span className="text-[10px] font-sans text-neutral-400 block mt-1 shrink-0">
                              {player.club} &bull; {player.age} años
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="h-3 w-3 text-neutral-300 opacity-0 group-hover:opacity-100 group-hover:text-emerald-500 transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TEAM SPECIFIC MATCH SCHEDULE (Column Span 1) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200/50 bg-white p-5 shadow-xs">
            <h3 className="font-sans text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-500" />
              Fixture Particular — Mundial 2026
            </h3>

            <div className="space-y-4">
              {teamMatches.map(match => {
                const local = teams.find(t => t.id === match.localId);
                const visitor = teams.find(t => t.id === match.visitorId);
                const isLocal = match.localId === teamId;
                const rival = isLocal ? visitor : local;

                return (
                  <div
                    key={match.id}
                    onClick={() => onChangeState({ page: "match", selectedMatchId: match.id })}
                    className="group border border-neutral-100 rounded-xl p-3.5 hover:bg-rose-50/20 hover:border-rose-200 cursor-pointer transition-all shadow-xs flex justify-between items-start gap-3"
                  >
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[10px] font-black text-rose-500 uppercase tracking-wide">
                          Partido #{match.id}
                        </span>
                        <span className="h-0.5 w-0.5 rounded-full bg-neutral-300" />
                        <span className="font-sans text-[10px] text-neutral-400 font-bold whitespace-nowrap">
                          {match.phase === "grupo" ? `Fase Grupos` : `Fase ${match.group}`}
                        </span>
                      </div>

                      {/* Opponent Code & Flag */}
                      <div className="flex items-center gap-2 min-w-0">
                        <Flag id={rival?.id || ""} emoji={rival?.bandera} size="sm" />
                        <div className="min-w-0">
                          <span className="text-[10px] font-sans font-medium text-neutral-400 uppercase leading-none">{isLocal ? "Rival (Visitante)" : "Rival (Local)"}</span>
                          <h4 className="font-sans font-bold text-xs text-neutral-800 leading-none mt-1 group-hover:text-rose-500 transition-colors truncate">
                            {rival ? rival.name : "Rival"}
                          </h4>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="text-right">
                        <span className="font-mono text-[10px] font-bold text-neutral-800 flex items-center gap-1 justify-end">
                          <Clock className="h-3 w-3 text-rose-400 shrink-0" />
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

              {teamMatches.length === 0 && (
                <p className="text-center font-sans text-xs text-neutral-400 py-6">No hay partidos calculados para esta selección.</p>
              )}
            </div>
          </div>

          {/* Quick stats distribution breakdown */}
          <div className="rounded-2xl border border-neutral-200/50 bg-white p-5 shadow-xs space-y-4">
            <h4 className="font-sans text-xs font-bold text-neutral-400 uppercase tracking-widest">
              Análisis de Plantilla
            </h4>
            <div className="text-xs font-sans text-neutral-500 leading-relaxed bg-neutral-50 border border-neutral-150 p-3.5 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-neutral-600">
                <span>Capitán Registrado:</span>
                <span className="font-bold text-neutral-800">
                  {roster.find(p => p.capitan)?.name || "Pendiente"}
                </span>
              </div>
              <div className="flex items-center justify-between text-neutral-600 border-t border-neutral-200/60 pt-2.5">
                <span>Promedio de Edad:</span>
                <span className="font-bold text-neutral-800 font-mono">
                  {Math.round(
                    roster
                      .map(p => (typeof p.age === "number" ? p.age : 28))
                      .reduce((a, b) => a + b, 0) / (roster.length || 1)
                  )} años
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
