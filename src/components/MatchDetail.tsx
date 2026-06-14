/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { Clock, MapPin, Tv, Users, Info, Calendar, ArrowRight, Shield } from "lucide-react";
import { Match, Team, Venue, Player, AppState } from "../types";
import { Flag } from "./Flag";
import { MatchCalendarMenu } from "./MatchCalendarMenu";

interface MatchDetailProps {
  matchId: number;
  matches: Match[];
  teams: Team[];
  venues: Venue[];
  players: Player[];
  onChangeState: (newState: Partial<AppState>) => void;
}

export function MatchDetail({
  matchId,
  matches,
  teams,
  venues,
  players,
  onChangeState
}: MatchDetailProps) {
  const match = useMemo(() => matches.find(m => m.id === matchId), [matches, matchId]);

  if (!match) {
    return (
      <div className="mx-auto max-w-lg p-12 text-center">
        <p className="text-neutral-500 font-sans">No se encontró el partido solicitado.</p>
      </div>
    );
  }

  const localTeam = teams.find(t => t.id === match.localId);
  const visitorTeam = teams.find(t => t.id === match.visitorId);
  const venue = venues.find(v => v.id === match.venueId);

  // Get rosters of both teams grouped by position
  const localRoster = useMemo(() => players.filter(p => p.equipoId === match.localId), [players, match]);
  const visitorRoster = useMemo(() => players.filter(p => p.equipoId === match.visitorId), [players, match]);

  // Trivia generator based on stadium / team stars
  const trivia = useMemo(() => {
    const list = [
      `Este encuentro representa un hito para la sede: ${venue?.officialName || "el estadio asignado"}.`,
      `Se espera una concurrencia masiva cercana al aforo oficial de ${venue?.capacity.toLocaleString() || "50k"} espectadores.`,
      `Historial: Ambos directores técnicos (${localTeam?.dt || "el de casa"} y ${visitorTeam?.dt || "el visitante"}) se enfrentan por primera vez en citas mundialistas.`
    ];

    if (match.phase === "eliminatoria") {
      list.push("Al ser fase eliminatoria de K.O., en caso de empate tras los 90', habrá prórroga de 30 minutos y, si persiste, tanda de penales.");
    } else {
      list.push("Se otorgan 3 puntos por victoria, 1 por empate y 0 por derrota. Los goles a favor son criterios de desempate críticos.");
    }

    if (venue?.tempMedia) {
      list.push(`El pronóstico climático indica una temperatura media estimada de ${venue.tempMedia} con sensación agradable debido a la logística climatizada de FIFA.`);
    }

    return list;
  }, [venue, localTeam, visitorTeam, match]);
  
  // Combine goals and cards into a sorted event list
  const matchEvents = useMemo(() => {
    if (!match.result) return [];
    
    interface MatchEvent {
      playerName: string;
      minute: string;
      teamId?: string;
      eventType: "goal" | "card";
      isPenalty?: boolean;
      isOwnGoal?: boolean;
      cardType?: "yellow" | "red";
    }

    const goals: MatchEvent[] = match.result.goals.map(g => ({
      playerName: g.playerName,
      minute: g.minute,
      teamId: g.teamId,
      eventType: "goal",
      isPenalty: g.isPenalty,
      isOwnGoal: g.isOwnGoal
    }));

    const cards: MatchEvent[] = match.result.cards.map(c => ({
      playerName: c.playerName,
      minute: c.minute,
      teamId: c.teamId,
      eventType: "card",
      cardType: c.type
    }));

    const all = [...goals, ...cards];
    
    const parseMin = (m: string) => {
      const parts = m.replace("'", "").split("+");
      const base = parseInt(parts[0]) || 0;
      const extra = parts[1] ? parseInt(parts[1]) * 0.1 : 0;
      return base + extra;
    };

    return all.sort((a, b) => parseMin(a.minute) - parseMin(b.minute));
  }, [match]);


  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Back to list hook */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onChangeState({ page: "home" })}
          className="text-xs font-sans font-bold text-neutral-500 hover:text-rose-500 flex items-center gap-1 select-none cursor-pointer"
        >
          &larr; Volver al Calendario General
        </button>
        <span className="font-mono text-xs font-bold text-neutral-400">
          Match ID: #{match.id}
        </span>
      </div>

      {/* MATCH MAIN BOARD CARD */}
      <div className="rounded-3xl border border-neutral-200/50 bg-white p-6 sm:p-10 shadow-sm relative overflow-hidden">
        {/* Dynamic decorative 2026 spectrum bar */}
        <div className="absolute top-0 left-0 right-0 h-[4.5px] flex">
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
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-slate-500/5 blur-3xl animate-pulse" />
        
        {/* Match Header metadata */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-neutral-100 pb-5 mb-8 gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <span 
              onClick={() => match.phase === "grupo" && onChangeState({ page: "group", selectedGroupId: match.group })}
              className={`inline-flex rounded-full border px-3 py-1 font-sans text-xs font-bold uppercase tracking-wide transition-all ${
                match.phase === "grupo"
                  ? "bg-indigo-50 border-indigo-100 text-indigo-500 hover:bg-indigo-100 cursor-pointer shadow-xs"
                  : "bg-rose-50 border-rose-100 text-rose-500"
              }`}
            >
              {match.phase === "grupo" ? `Fase de Grupos — Grupo ${match.group}` : `Fase Eliminatoria — ${match.group}`}
            </span>
            <div className="text-xs font-sans text-neutral-400 mt-2 flex items-center justify-center sm:justify-start gap-1">
              <Calendar className="h-3.5 w-3.5 text-neutral-400" />
              {match.rawDate}
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2.5 w-full sm:w-auto">
            <div className="flex items-center gap-2 justify-center sm:justify-end">
              <Clock className="h-4 w-4 text-rose-500 shrink-0" />
              <span className="font-mono text-sm font-extrabold text-neutral-800 tracking-tight">
                {match.time}
              </span>
            </div>
            <div className="w-44 mx-auto sm:mx-0">
              <MatchCalendarMenu match={match} teams={teams} />
            </div>
          </div>
        </div>

        {/* Dynamic Versus Grid */}
        <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-8 py-4 px-2">
          {/* Local Team */}
          <div className="md:col-span-3 flex flex-col items-center text-center space-y-4">
            <div
              onClick={() => onChangeState({ page: "team", selectedTeamId: match.localId })}
              className="cursor-pointer group flex flex-col items-center space-y-4"
            >
              <Flag id={match.localId} emoji={localTeam?.bandera} size="xl" />
              <h3 className="font-sans text-2xl font-black text-neutral-900 group-hover:text-rose-500 group-hover:underline transition-all leading-tight">
                {localTeam ? localTeam.name : match.localId}
              </h3>
            </div>
            <p className="text-xs font-sans text-neutral-400">
              DT: <strong className="text-neutral-700">{localTeam?.dt || "Pendiente"}</strong>
            </p>
          </div>

          {/* Versus Center / Score */}
          <div className="md:col-span-1 flex flex-col items-center justify-center space-y-4 select-none">
            {match.result ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center h-16 w-14 rounded-2xl bg-neutral-900 text-white font-mono text-4xl font-black shadow-lg shadow-neutral-900/20">
                  {match.result.localGoals}
                </div>
                <div className="font-sans font-black text-2xl text-neutral-300">
                  -
                </div>
                <div className="flex items-center justify-center h-16 w-14 rounded-2xl bg-neutral-900 text-white font-mono text-4xl font-black shadow-lg shadow-neutral-900/20">
                  {match.result.visitorGoals}
                </div>
              </div>
            ) : (
              <div className="h-14 w-14 rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center font-sans font-black text-sm text-neutral-400 shadow-inner">
                VS
              </div>
            )}
            <div className="flex flex-col items-center">
              <div className="h-4 w-[1px] bg-neutral-200" />
              <span className="font-sans font-extrabold text-[10px] text-neutral-400 tracking-widest uppercase mt-1">
                {match.result ? "Finalizado" : `Partido #${match.id}`}
              </span>
            </div>
          </div>

          {/* Visitor Team */}
          <div className="md:col-span-3 flex flex-col items-center text-center space-y-4">
            <div
              onClick={() => onChangeState({ page: "team", selectedTeamId: match.visitorId })}
              className="cursor-pointer group flex flex-col items-center space-y-4"
            >
              <Flag id={match.visitorId} emoji={visitorTeam?.bandera} size="xl" />
              <h3 className="font-sans text-2xl font-black text-neutral-900 group-hover:text-rose-500 group-hover:underline transition-all leading-tight">
                {visitorTeam ? visitorTeam.name : match.visitorId}
              </h3>
            </div>
            <p className="text-xs font-sans text-neutral-400">
              DT: <strong className="text-neutral-700">{visitorTeam?.dt || "Pendiente"}</strong>
            </p>
          </div>
        </div>

        {/* Match Events (Chronological & Aligned by Team) */}
        {match.result && (
          <div className="border-t border-neutral-100 mt-8 pt-8">
            <div className="relative grid grid-cols-2 gap-x-12">
              {/* Vertical timeline line (desktop) */}
              <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-neutral-100 hidden md:block" />

              {/* Local Events Component */}
              <div className="space-y-5">
                <h4 className="font-sans text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] flex items-center justify-start gap-2 mb-4">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
                  Incidencias {localTeam?.name || match.localId}
                </h4>
                <div className="space-y-4">
                  {matchEvents.filter(e => e.teamId === match.localId).length > 0 ? (
                    matchEvents.filter(e => e.teamId === match.localId).map((event, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm font-sans">
                        {event.eventType === "goal" ? (
                          <div className="h-6 w-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] font-bold border border-emerald-100 shrink-0">
                            GP
                          </div>
                        ) : (
                          <div className={`h-6 w-4 rounded-xs border shadow-xs shrink-0 ${
                            event.cardType === "red" 
                              ? "bg-rose-500 border-rose-600" 
                              : "bg-amber-400 border-amber-500"
                          }`} />
                        )}
                        <span className="font-semibold text-neutral-800">{event.playerName}</span>
                        <span className="text-neutral-400 ml-auto font-mono text-xs">{event.minute}' {event.isPenalty && "(P)"} {event.isOwnGoal && "(OG)"}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-neutral-300 italic">Sin incidencias registradas</p>
                  )}
                </div>
              </div>

              {/* Visitor Events Component */}
              <div className="space-y-5 text-right md:text-left">
                <h4 className="font-sans text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] flex items-center justify-end md:justify-start gap-2 mb-4">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
                  Incidencias {visitorTeam?.name || match.visitorId}
                </h4>
                <div className="space-y-4">
                  {matchEvents.filter(e => e.teamId === match.visitorId).length > 0 ? (
                    matchEvents.filter(e => e.teamId === match.visitorId).map((event, idx) => (
                      <div key={idx} className="flex items-center justify-end md:justify-start gap-3 text-sm font-sans">
                        <span className="text-neutral-400 mr-auto md:mr-0 md:ml-auto order-1 md:order-3 font-mono text-xs">{event.minute}' {event.isPenalty && "(P)"} {event.isOwnGoal && "(OG)"}</span>
                        <span className="font-semibold text-neutral-800 order-2">{event.playerName}</span>
                        {event.eventType === "goal" ? (
                          <div className="h-6 w-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] font-bold border border-emerald-100 shrink-0 order-3 md:order-1">
                            GP
                          </div>
                        ) : (
                          <div className={`h-6 w-4 rounded-xs border shadow-xs shrink-0 order-3 md:order-1 ${
                            event.cardType === "red" 
                              ? "bg-rose-500 border-rose-600" 
                              : "bg-amber-400 border-amber-500"
                          }`} />
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-neutral-300 italic">Sin incidencias registradas</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stadium Info snippet and TV tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-neutral-100 mt-8 pt-6">
          <div
            onClick={() => onChangeState({ page: "venue", selectedVenueId: match.venueId })}
            className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-neutral-50 cursor-pointer select-none transition-all border border-transparent hover:border-neutral-100"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500 border border-blue-100">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="font-sans text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">Estadio Anfitrión</span>
              <h4 className="font-sans font-bold text-neutral-900 text-sm truncate leading-none mt-1">{venue?.commercialName || match.venueName}</h4>
              <p className="text-xs font-sans text-neutral-500 truncate mt-1">{venue?.city}, {venue?.pais}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-neutral-50/50 border border-neutral-100">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500 border border-rose-100">
              <Tv className="h-5 w-5" />
            </div>
            <div>
              <span className="font-sans text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">Transmite en Argentina</span>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {match.tv.map((ch, idx) => (
                  <span
                    key={idx}
                    className="inline-flex rounded-md bg-white border border-neutral-200 px-2 py-0.5 font-sans text-xs font-bold text-neutral-700"
                  >
                    {ch}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SQUAD PREVIEWS & DIRECT CROSSOVERS (Column span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-sans text-base font-bold text-neutral-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-rose-500" />
              Alineaciones Estimadas & Plantillas
            </h3>
            <span className="text-xs font-sans text-neutral-500">
              Selecciona cualquier jugador para ver su ficha.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Local Team Squad list */}
            <div className="rounded-2xl border border-neutral-200/50 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-3 mb-4">
                <Flag id={match.localId} emoji={localTeam?.bandera} size="sm" />
                <h4 className="font-sans font-bold text-sm text-neutral-900 uppercase tracking-wide">
                  {localTeam?.name} roster
                </h4>
              </div>

              <div className="space-y-2">
                {localRoster.map(p => (
                  <div
                    key={p.id}
                    onClick={() => onChangeState({ page: "player", selectedPlayerName: p.name, selectedTeamId: p.equipoId })}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-rose-50/40 cursor-pointer select-none transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-50 border border-neutral-200 text-xs font-mono font-bold text-neutral-600 group-hover:border-rose-300 group-hover:text-rose-600">
                        {p.dorsal || "—"}
                      </div>
                      <div>
                        <span className="font-sans text-xs font-semibold text-neutral-800 group-hover:text-rose-600 transition-colors block">
                          {p.name} {p.capitan && "⭐"}
                        </span>
                        <span className="text-[10px] font-sans text-neutral-400 block mt-0.5">
                          {p.posicion} &bull; {p.club}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-3 w-3 text-neutral-300 opacity-0 group-hover:opacity-100 group-hover:text-rose-500 transition-all shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Visitor Team Squad list */}
            <div className="rounded-2xl border border-neutral-200/50 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-3 mb-4">
                <Flag id={match.visitorId} emoji={visitorTeam?.bandera} size="sm" />
                <h4 className="font-sans font-bold text-sm text-neutral-900 uppercase tracking-wide">
                  {visitorTeam?.name} roster
                </h4>
              </div>

              <div className="space-y-2">
                {visitorRoster.map(p => (
                  <div
                    key={p.id}
                    onClick={() => onChangeState({ page: "player", selectedPlayerName: p.name, selectedTeamId: p.equipoId })}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-rose-50/40 cursor-pointer select-none transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-50 border border-neutral-200 text-xs font-mono font-bold text-neutral-600 group-hover:border-rose-300 group-hover:text-rose-600">
                        {p.dorsal || "—"}
                      </div>
                      <div>
                        <span className="font-sans text-xs font-semibold text-neutral-800 group-hover:text-rose-600 transition-colors block">
                          {p.name} {p.capitan && "⭐"}
                        </span>
                        <span className="text-[10px] font-sans text-neutral-400 block mt-0.5">
                          {p.posicion} &bull; {p.club}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-3 w-3 text-neutral-300 opacity-0 group-hover:opacity-100 group-hover:text-rose-500 transition-all shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SIDE BAR DETAILS: TRIVIA / STADIUM CLIMATE DATA */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200/50 bg-white p-5 shadow-xs">
            <h3 className="font-sans text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info className="h-4 w-4 text-rose-500 shrink-0" />
              Datos Clave & Curiosidades
            </h3>

            <div className="space-y-4">
              {trivia.map((item, idx) => (
                <div key={idx} className="flex gap-3 text-xs leading-relaxed text-neutral-600">
                  <div className="flex h-5 w-5 shrink-0 select-none items-center justify-center rounded-full bg-neutral-50 border border-neutral-200 font-mono text-[10px] font-bold text-neutral-400">
                    {idx + 1}
                  </div>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stadium climate indicator card */}
          {venue && (
            <div className="rounded-2xl border border-neutral-200/50 bg-white p-5 shadow-xs space-y-4">
              <h4 className="font-sans text-xs font-bold text-neutral-400 uppercase tracking-widest">
                Análisis Climático Local
              </h4>
              
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                  <span className="font-sans text-[10px] text-neutral-400 uppercase">Temp. Media</span>
                  <p className="font-mono text-base font-extrabold text-neutral-800 mt-1">{venue.tempMedia}</p>
                </div>
                <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                  <span className="font-sans text-[10px] text-neutral-400 uppercase">Máx. Diaria</span>
                  <p className="font-mono text-base font-extrabold text-rose-500 mt-1">{venue.tempMaxJun}</p>
                </div>
              </div>

              <div className="text-xs font-sans text-neutral-500 leading-relaxed bg-blue-50/30 border border-blue-100/50 rounded-xl p-3.5 space-y-2">
                <p className="text-neutral-700 font-semibold flex items-center gap-1.5 text-xs">
                  <Shield className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  Mitigación FIFA
                </p>
                <p>{venue.climateNote}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
