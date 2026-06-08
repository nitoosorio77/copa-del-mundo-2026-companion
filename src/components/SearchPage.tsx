/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Search as SearchIcon, Users, MapPin, Calendar, Tv, ArrowRight, Star, Clock } from "lucide-react";
import { Team, Player, Venue, Match, AppState } from "../types";
import { Flag } from "./Flag";
import { MatchCalendarMenu } from "./MatchCalendarMenu";

interface SearchPageProps {
  teams: Team[];
  players: Player[];
  venues: Venue[];
  matches: Match[];
  searchQuery: string;
  onChangeState: (newState: Partial<AppState>) => void;
}

export function SearchPage({
  teams,
  players,
  venues,
  matches,
  searchQuery,
  onChangeState
}: SearchPageProps) {
  const [activeTab, setActiveTab] = useState<"todo" | "jugador" | "seleccion" | "sede" | "partido">("todo");

  // Normalize queries for indexing
  const qClean = searchQuery.toLowerCase().trim();

  // 1. Match Teams indexing
  const matchTeams = useMemo(() => {
    if (!qClean) return [];
    return teams.filter(
      t =>
        t.name.toLowerCase().includes(qClean) ||
        t.fullName.toLowerCase().includes(qClean) ||
        t.id.toLowerCase().includes(qClean) ||
        t.confederation.toLowerCase().includes(qClean) ||
        t.dt.toLowerCase().includes(qClean)
    );
  }, [teams, qClean]);

  // 2. Match Players indexing
  const matchPlayers = useMemo(() => {
    if (!qClean) return [];
    return players.filter(
      p =>
        p.name.toLowerCase().includes(qClean) ||
        p.club.toLowerCase().includes(qClean) ||
        p.posicion.toLowerCase().includes(qClean) ||
        p.equipoId.toLowerCase().includes(qClean)
    );
  }, [players, qClean]);

  // 3. Match Venues indexing
  const matchVenues = useMemo(() => {
    if (!qClean) return [];
    return venues.filter(
      v =>
        v.name.toLowerCase().includes(qClean) ||
        v.officialName.toLowerCase().includes(qClean) ||
        v.commercialName.toLowerCase().includes(qClean) ||
        v.city.toLowerCase().includes(qClean) ||
        v.pais.toLowerCase().includes(qClean) ||
        v.id.toLowerCase().includes(qClean)
    );
  }, [venues, qClean]);

  // 4. Match Games indexing
  const matchMatches = useMemo(() => {
    if (!qClean) return [];
    // Can match by ID (e.g. "12") or date or team names
    return matches.filter(m => {
      const matchId = m.id.toString() === qClean;
      const matchDate = m.date.toLowerCase().includes(qClean);
      const matchVenue = m.venueName.toLowerCase().includes(qClean);
      const localTeamName = (teams.find(t => t.id === m.localId)?.name || "").toLowerCase();
      const visitorTeamName = (teams.find(t => t.id === m.visitorId)?.name || "").toLowerCase();
      const matchTeamsName = localTeamName.includes(qClean) || visitorTeamName.includes(qClean);
      const matchTVName = m.tv.some(tv => tv.toLowerCase().includes(qClean));

      return matchId || matchDate || matchVenue || matchTeamsName || matchTVName;
    });
  }, [matches, teams, qClean]);

  const totalResultsCount =
    matchTeams.length + matchPlayers.length + matchVenues.length + matchMatches.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Dynamic Search Hero header */}
      <div className="space-y-4">
        <h2 className="font-sans text-2xl font-extrabold tracking-tight text-neutral-900 flex items-center gap-1.5 leading-none">
          <SearchIcon className="h-6 w-6 text-rose-500 shrink-0" />
          Buscador Unificado Copa del Mundo
        </h2>
        
        {/* Large search input */}
        <div className="relative group max-w-2xl bg-white rounded-2xl shadow-xs border border-neutral-200 focus-within:border-rose-500 focus-within:ring-1 focus-within:ring-rose-500/25 transition-all">
          <SearchIcon className="absolute left-4 top-3.5 h-5 w-5 text-neutral-400 group-focus-within:text-rose-500 transition-colors pointer-events-none" />
          <input
            type="text"
            placeholder="Escribe el nombre de un jugador, país, estadio, canal o nº de partido..."
            value={searchQuery}
            onChange={e => onChangeState({ searchQuery: e.target.value })}
            className="w-full rounded-2xl py-3.5 pl-11 pr-4 text-sm font-sans placeholder-neutral-400 bg-transparent text-neutral-800 focus:outline-hidden"
            autoFocus
          />
        </div>

        {/* Tab filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-custom select-none">
          {[
            { id: "todo" as const, label: "Todo", count: totalResultsCount },
            { id: "jugador" as const, label: "Jugadores", count: matchPlayers.length },
            { id: "seleccion" as const, label: "Selecciones", count: matchTeams.length },
            { id: "sede" as const, label: "Sedes", count: matchVenues.length },
            { id: "partido" as const, label: "Partidos", count: matchMatches.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-sans font-semibold border focus:outline-hidden whitespace-nowrap transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-rose-50 border-rose-100/70 text-rose-600 font-bold"
                  : "bg-white border-neutral-200 hover:border-neutral-300 text-neutral-500"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`inline-flex shrink-0 h-4 min-w-[16px] px-1 items-center justify-center rounded-full text-[9px] font-mono font-bold leading-none ${activeTab === tab.id ? "bg-rose-500 text-white" : "bg-neutral-100 text-neutral-400"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* SEARCH RESULTS LIST SECTION */}
      {searchQuery.trim() === "" ? (
        <div className="rounded-3xl border border-dashed border-neutral-200 p-12 text-center max-w-lg mx-auto">
          <p className="font-sans text-sm text-neutral-400">Escribe algunas letras en la barra para buscar coincidencias.</p>
        </div>
      ) : totalResultsCount === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-200 p-12 text-center max-w-lg mx-auto">
          <p className="font-sans text-sm text-neutral-400 leading-relaxed">No se encontraron resultados para su consulta. Intente escribir con acentos o por nombres simples (ej. "Messi", "Ochoa").</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
          {/* Display matching selection */}

          {/* 1. SELECCIONES */}
          {(activeTab === "todo" || activeTab === "seleccion") && matchTeams.map(t => (
            <div
              key={t.id}
              onClick={() => onChangeState({ page: "team", selectedTeamId: t.id })}
              className="group rounded-2xl border border-neutral-200/50 bg-white p-4 shadow-xs hover:border-emerald-300 hover:shadow-md hover:bg-emerald-50/5 transition-all cursor-pointer flex justify-between items-center select-none"
            >
              <div className="flex items-center gap-3">
                <Flag id={t.id} emoji={t.bandera} size="md" />
                <div>
                  <span className="inline-flex rounded-full bg-emerald-50 border border-emerald-100/60 px-2 py-0.5 font-mono text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">
                    Selección &bull; {t.confederation}
                  </span>
                  <h4 className="font-sans font-bold text-neutral-800 leading-none group-hover:text-rose-500 transition-colors">
                    {t.fullName}
                  </h4>
                  <p className="text-[10px] font-sans text-neutral-400 mt-1">DT: {t.dt}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-neutral-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all shrink-0" />
            </div>
          ))}

          {/* 2. JUGADORES */}
          {(activeTab === "todo" || activeTab === "jugador") && matchPlayers.map(p => {
            const playerTeam = teams.find(t => t.id === p.equipoId);
            return (
              <div
                key={p.id}
                onClick={() => onChangeState({ page: "player", selectedPlayerName: p.name, selectedTeamId: p.equipoId })}
                className="group rounded-2xl border border-neutral-200/50 bg-white p-4 shadow-xs hover:border-amber-300 hover:shadow-md hover:bg-amber-50/5 transition-all cursor-pointer flex justify-between items-center select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-100 text-amber-500 font-sans font-black tracking-tight shrink-0 select-none">
                    {p.name.substring(0, 1)}
                  </div>
                  <div>
                    <span className="inline-flex rounded-full bg-amber-50 border border-amber-100/60 px-2 py-0.5 font-sans text-[9px] font-bold text-amber-700 leading-none mb-1">
                      Jugador &bull; {p.posicion}
                    </span>
                    <h4 className="font-sans font-extrabold text-neutral-800 leading-none group-hover:text-rose-500 transition-colors">
                      {p.name} {p.capitan && "⭐"}
                    </h4>
                    <p className="text-[10px] font-sans text-neutral-400 mt-1 flex items-center gap-1 leading-none">
                      <Flag id={p.equipoId} emoji={playerTeam?.bandera} size="sm" />
                      {playerTeam?.name} &bull; {p.club}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            );
          })}

          {/* 3. SEDES */}
          {(activeTab === "todo" || activeTab === "sede") && matchVenues.map(v => (
            <div
              key={v.id}
              onClick={() => onChangeState({ page: "venue", selectedVenueId: v.id })}
              className="group rounded-2xl border border-neutral-200/50 bg-white p-4 shadow-xs hover:border-blue-300 hover:shadow-md hover:bg-blue-50/5 transition-all cursor-pointer flex justify-between items-center select-none"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-500 shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <span className="inline-flex rounded-full bg-blue-50 border border-blue-100/60 px-2 py-0.5 font-mono text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">
                    Estadio Anfitrión &bull; {v.pais}
                  </span>
                  <h4 className="font-sans font-bold text-neutral-800 leading-none group-hover:text-rose-500 transition-colors">
                    {v.commercialName}
                  </h4>
                  <p className="text-[10px] font-sans text-neutral-400 mt-1">{v.city}, {v.pais} &bull; {v.capacity.toLocaleString()} asientes</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-neutral-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all shrink-0" />
            </div>
          ))}

          {/* 4. PARTIDOS */}
          {(activeTab === "todo" || activeTab === "partido") && matchMatches.map(match => {
            const local = teams.find(t => t.id === match.localId);
            const visitor = teams.find(t => t.id === match.visitorId);
            const isCupGroup = match.group.length === 1;

            return (
              <div
                key={match.id}
                onClick={() => onChangeState({ page: "match", selectedMatchId: match.id })}
                className="group rounded-2xl border border-neutral-200/50 bg-white p-4 shadow-xs hover:border-rose-300 hover:shadow-md hover:bg-rose-50/5 transition-all cursor-pointer flex justify-between items-center select-none"
              >
                <div className="space-y-2 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-[10px] font-black text-rose-500 uppercase tracking-wide leading-none">
                      Partido #{match.id}
                    </span>
                    <span className="h-0.5 w-0.5 rounded-full bg-neutral-300" />
                    <span className="font-sans text-[10px] text-neutral-400 font-bold whitespace-nowrap leading-none">
                      {isCupGroup ? `Grupo ${match.group}` : `Fase ${match.group}`}
                    </span>
                  </div>

                  {/* Opponent list */}
                  <div className="flex items-center gap-2 pr-1 min-w-0">
                    <Flag id={match.localId} emoji={local?.bandera} size="sm" />
                    <span className="text-[10px] font-bold text-neutral-500 shrink-0">vs</span>
                    <Flag id={match.visitorId} emoji={visitor?.bandera} size="sm" />
                    <h4 className="font-sans font-bold text-xs text-neutral-800 leading-none group-hover:text-rose-500 transition-colors truncate">
                      {local ? local.name : match.localId} - {visitor ? visitor.name : match.visitorId}
                    </h4>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="text-right">
                    <span className="font-mono text-[10px] font-black text-neutral-800 flex items-center justify-end gap-1">
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
        </div>
      )}
    </div>
  );
}
