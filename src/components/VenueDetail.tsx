/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { MapPin, Users, Clock, Info, Calendar, ArrowRight, Shield } from "lucide-react";
import { Venue, Match, Team, AppState } from "../types";
import { Flag } from "./Flag";
import { ProgressBar } from "./ProgressBar";
import { MatchCalendarMenu } from "./MatchCalendarMenu";

interface VenueDetailProps {
  venueId: string;
  venues: Venue[];
  matches: Match[];
  teams: Team[];
  onChangeState: (newState: Partial<AppState>) => void;
}

export function VenueDetail({ venueId, venues, matches, teams, onChangeState }: VenueDetailProps) {
  const venue = useMemo(() => venues.find(v => v.id === venueId), [venues, venueId]);

  if (!venue) {
    return (
      <div className="mx-auto max-w-lg p-12 text-center">
        <p className="text-neutral-500 font-sans">No se encontró la sede de estadio solicitada.</p>
      </div>
    );
  }

  // Filter matches scheduled in this venue
  const venueMatches = useMemo(() => {
    return matches
      .filter(m => m.venueId === venueId)
      .sort((a, b) => a.id - b.id);
  }, [matches, venueId]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Return hooks */}
      <div>
        <button
          onClick={() => onChangeState({ page: "home" })}
          className="text-xs font-sans font-bold text-neutral-500 hover:text-blue-500 flex items-center gap-1 select-none cursor-pointer"
        >
          &larr; Volver al Calendario General
        </button>
      </div>

      {/* VENUE PROFILE HERO CARD */}
      <div className="relative overflow-hidden rounded-3xl border border-neutral-200/50 bg-white p-6 sm:p-10 shadow-sm">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl" />

        <div className="relative flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 text-blue-500">
              <MapPin className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <span className="font-mono text-xs font-black text-blue-500 uppercase tracking-widest bg-blue-5/30 border border-blue-100 px-3 py-1 rounded-full">
                Sede {venue.id}
              </span>
              <h2 className="font-sans text-3xl font-extrabold tracking-tight text-neutral-900 leading-tight">
                {venue.commercialName}
              </h2>
              <p className="text-sm font-sans text-neutral-500 flex items-center justify-center sm:justify-start gap-1">
                {venue.city}, {venue.pais} &bull; <span className="font-mono text-xs font-bold text-neutral-400">{venue.state}</span>
              </p>
            </div>
          </div>

          {/* Quick core metrics capacity display */}
          <div className="bg-neutral-50 border border-neutral-200/60 p-4 rounded-2xl shrink-0 min-w-[200px] text-center md:text-left space-y-2">
            <span className="text-[10px] font-sans font-extrabold text-neutral-400 uppercase tracking-widest block">Capacidad oficial</span>
            <div className="flex items-center gap-1.5 justify-center md:justify-start">
              <Users className="h-5 w-5 text-neutral-400 shrink-0" />
              <span className="font-mono text-xl font-bold text-neutral-800 leading-none">
                {venue.capacity.toLocaleString()}
              </span>
            </div>
            <span className="text-[10px] font-sans text-neutral-500 block">Asientos ajustados FIFA</span>
          </div>
        </div>

        {/* Info detail banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-neutral-100 relative select-none">
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
            { label: "Nombre oficial FIFA", value: venue.officialName },
            { label: "Nº de Partidos Asignados", value: `${venue.assignedMatches} partidos` },
            { label: "Temperatura Promedio", value: venue.tempMedia },
            { label: "Máxima June-July", value: venue.tempMaxJun }
          ].map((item, idx) => (
            <div key={idx} className="text-center sm:text-left p-1">
              <span className="text-[10px] font-sans font-bold text-neutral-400 uppercase tracking-widest">{item.label}</span>
              <p className="font-sans text-sm font-bold text-neutral-800 mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MATCHES SCHEDULED IN THIS STADIUM (Column Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-sans text-base font-bold text-neutral-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Partidos Programados en este Estadio
          </h3>

          <div className="space-y-4">
            {venueMatches.map(match => {
              const local = teams.find(t => t.id === match.localId);
              const visitor = teams.find(t => t.id === match.visitorId);
              const isCupGroup = match.group.length === 1;

              return (
                <div
                  key={match.id}
                  onClick={() => onChangeState({ page: "match", selectedMatchId: match.id })}
                  className="group rounded-2xl border border-neutral-200/50 bg-white p-4 shadow-xs hover:shadow-md hover:border-neutral-200 hover:bg-neutral-50/10 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xs font-black text-rose-500 uppercase tracking-wide">
                        Partido #{match.id}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-neutral-300" />
                      <span className="font-sans text-xs font-bold text-neutral-500">
                        {isCupGroup ? `Grupo ${match.group}` : `Fase ${match.group}`}
                      </span>
                    </div>

                    {/* Flags row */}
                    <div className="flex items-center gap-4 py-1">
                      <div className="flex items-center gap-2.5">
                        <Flag id={match.localId} emoji={local?.bandera} size="sm" />
                        <span className="font-sans font-bold text-xs text-neutral-800 group-hover:text-rose-500 transition-colors">
                          {local ? local.name : match.localId}
                        </span>
                      </div>
                      <span className="text-xs text-neutral-400 font-sans font-black select-none">vs</span>
                      <div className="flex items-center gap-2.5">
                        <Flag id={match.visitorId} emoji={visitor?.bandera} size="sm" />
                        <span className="font-sans font-bold text-xs text-neutral-800 group-hover:text-rose-500 transition-colors">
                          {visitor ? visitor.name : match.visitorId}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-neutral-800 flex items-center gap-1 justify-end">
                        <Clock className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                        {match.time}
                      </span>
                      <span className="text-xs font-sans text-neutral-400 block mt-1">
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

            {venueMatches.length === 0 && (
              <p className="text-center font-sans text-xs text-neutral-400 py-6">No hay partidos calculados para este estadio.</p>
            )}
          </div>
        </div>

        {/* CLIMATIC HISTORICAL VALUES & FIFA CLIMATE NOTES (Column Span 1) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200/50 bg-white p-5 shadow-xs space-y-4">
            <h3 className="font-sans text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2 border-b border-neutral-100 pb-2.5">
              <Info className="h-4 w-4 text-blue-500" />
              Climatología Promedio (Junio-Julio)
            </h3>

            {/* Stadium dimensions comparison */}
            <ProgressBar value={venue.capacity} max={92960} label="Capacidad vs Mayor Estadio (Dallas)" color="blue" valueSuffix=" asientes" />

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs font-sans text-neutral-500">
                <span>Temperatura Media Jun-Jul:</span>
                <strong className="text-neutral-800 font-mono">{venue.tempMedia}</strong>
              </div>
              <div className="flex justify-between items-center text-xs font-sans text-neutral-500 border-t border-neutral-100 pt-2.5">
                <span>Máxima Histórica Registrada:</span>
                <strong className="text-rose-500 font-mono">{venue.tempMaxJun}</strong>
              </div>
              {venue.temp2023Note && (
                <div className="flex justify-between items-start text-xs font-sans text-neutral-500 border-t border-neutral-100 pt-2.5">
                  <span className="whitespace-nowrap shrink-0">Notas Recientes:</span>
                  <p className="font-sans text-neutral-600 text-right pl-2 leading-relaxed">{venue.temp2023Note}</p>
                </div>
              )}
            </div>
          </div>

          {/* CLIMATE SHIELD MITIGATION NOTE */}
          <div className="rounded-2xl border border-neutral-200/50 bg-white p-5 shadow-xs space-y-3">
            <h4 className="font-sans text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5 shrink-0">
              <Shield className="h-4 w-4 text-blue-500" />
              Adaptación Climática FIFA
            </h4>
            <div className="font-sans text-xs text-neutral-500 leading-relaxed bg-blue-50/30 border border-blue-100/50 rounded-xl p-3.5">
              {venue.climateNote}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
