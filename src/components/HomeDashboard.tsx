/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Compass, Users, MapPin, Tv, Clock, Award, ArrowRight, Info, Calendar } from "lucide-react";
import { Match, Team, Venue, AppState } from "../types";
import { Flag } from "./Flag";
import { MatchCalendarMenu } from "./MatchCalendarMenu";
import fifaLogo from "../assets/images/fifa_2026_logo_1780850177458.png";

interface HomeDashboardProps {
  teams: Team[];
  venues: Venue[];
  matches: Match[];
  onChangeState: (newState: Partial<AppState>) => void;
}

export function HomeDashboard({ teams, venues, matches, onChangeState }: HomeDashboardProps) {
  const [selectedPhase, setSelectedPhase] = useState<"todos" | "grupo" | "eliminatoria">("todos");
  
  // Extract all unique dates with matches
  const dateRibbon = useMemo(() => {
    const datesMap: { [key: string]: { rawDate: string; count: number; date: string } } = {};
    const sorted = [...matches].sort((a, b) => a.id - b.id);
    
    sorted.forEach(m => {
      // Filter according to Phase selection to make Ribbon reactive
      if (selectedPhase !== "todos" && m.phase !== selectedPhase) return;
      
      if (!datesMap[m.date]) {
        datesMap[m.date] = {
          date: m.date,
          rawDate: m.rawDate,
          count: 0
        };
      }
      datesMap[m.date].count++;
    });
    return Object.values(datesMap).sort((a, b) => {
      const [d1, m1, y1] = a.date.split("/").map(Number);
      const [d2, m2, y2] = b.date.split("/").map(Number);
      return new Date(y1, m1 - 1, d1).getTime() - new Date(y2, m2 - 1, d2).getTime();
    });
  }, [matches, selectedPhase]);

  // Selected date state (defaults to the first date in the ribbon list or "all")
  const [selectedDate, setSelectedDate] = useState<string>("");

  const activeDate = selectedDate || (dateRibbon[0] ? dateRibbon[0].date : "");

  // Filtered matches for displaying
  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      const matchPhase = selectedPhase === "todos" || m.phase === selectedPhase;
      const matchDate = selectedDate === "all" || m.date === activeDate;
      return matchPhase && matchDate;
    });
  }, [matches, activeDate, selectedDate, selectedPhase]);

  // Group matches by date for display
  const groupedMatches = useMemo(() => {
    const groups: { [key: string]: Match[] } = {};
    filteredMatches.forEach(m => {
      if (!groups[m.date]) groups[m.date] = [];
      groups[m.date].push(m);
    });
    return Object.entries(groups).sort((a, b) => {
      const [d1, m1, y1] = a[0].split("/").map(Number);
      const [d2, m2, y2] = b[0].split("/").map(Number);
      return new Date(y1, m1 - 1, d1).getTime() - new Date(y2, m2 - 1, d2).getTime();
    });
  }, [filteredMatches]);

  // Set active date appropriately if phase filters change
  React.useEffect(() => {
    if (dateRibbon.length > 0) {
      const isDateInRibbon = dateRibbon.some(d => d.date === activeDate) || selectedDate === "all";
      if (!isDateInRibbon) {
        setSelectedDate(dateRibbon[0].date);
      }
    }
  }, [selectedPhase, dateRibbon, activeDate, selectedDate]);

  // Timezone and General Banner Details
  const championshipRecordCount = teams.reduce((acc, t) => acc + t.campeonatos, 0);

  // Group snapshot
  const featuredGroups = ["A", "C", "H", "J"];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* 1. HERO BRAND PREFACE */}
      <div className="relative overflow-hidden rounded-3xl border border-neutral-200/50 bg-white p-6 sm:p-10 shadow-sm">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-rose-500/5 blur-3xl" />
        <div className="absolute left-1/3 bottom-0 h-48 w-48 rounded-full bg-indigo-500/5 blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row items-center md:items-start justify-between gap-6 sm:gap-10">
          
          {/* Official logo of world cup 2026 */}
          <div className="flex-shrink-0 w-24 sm:w-32 h-36 sm:h-[172px] bg-neutral-950 rounded-2xl p-0.5 select-none shadow-lg shadow-neutral-950/20 border border-neutral-900 transition-transform duration-200 hover:scale-105 flex items-center justify-center overflow-hidden">
            <img
              src={fifaLogo}
              alt="Copa del Mundo 2026 Logo"
              className="w-[95%] h-[95%] object-cover rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex-1 space-y-3 w-full text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-100/70 px-3 py-1 font-sans text-xs font-semibold text-rose-500">
              <Compass className="h-3.5 w-3.5" />
              Guía Oficial de Selección & Plantillas
            </div>
            <h2 className="font-sans text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 leading-tight">
              Bienvenido al Companion Premium <br className="hidden sm:block" />
              <span className="text-rose-500">Copa del Mundo 2026</span>
            </h2>
            <p className="font-sans text-sm text-neutral-500 leading-relaxed max-w-2xl mx-auto md:mx-0">
              Sigue el fixture de los 104 partidos, explora los rosters de las 48 selecciones, conoce el clima y capacidades de los estadios, y visualiza la tabla de posiciones en tiempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-center md:justify-end">
            {/* UTC-3 Alert Tag */}
            <div className="flex items-center gap-2 rounded-2xl bg-neutral-50 border border-neutral-200/60 p-3 w-full sm:w-auto shadow-xs text-left">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <span className="font-sans text-xs text-neutral-400 font-medium">Huso Horario Oficial</span>
                <p className="font-mono text-xs font-bold text-neutral-800 leading-none mt-1">UTC-3 (Argentina)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Key Metric Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-neutral-100 relative">
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
            { value: "48", label: "Selecciones", desc: "12 Grupos Oficiales", icon: Users, color: "text-emerald-500 bg-emerald-50" },
            { value: "16", label: "Estadios", desc: "3 Países Anfitriones", icon: MapPin, color: "text-blue-500 bg-blue-50" },
            { value: "104", label: "Partidos", desc: "Fase de Grupos & K.O.", icon: Calendar, color: "text-rose-500 bg-rose-50" },
            { value: championshipRecordCount.toString(), label: "Copas en Juego", desc: "Estrellas combinadas", icon: Award, color: "text-amber-500 bg-amber-50" }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-neutral-50/50 transition-colors">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${item.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-mono text-lg font-bold text-neutral-900 leading-none">{item.value}</h4>
                  <span className="text-xs font-sans font-semibold text-neutral-600 mt-1 block">{item.label}</span>
                  <span className="text-[10px] font-sans text-neutral-400 block mt-0.5">{item.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. DYNAMIC CALENDAR DATE RIBBON CAROUSEL */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-sans text-xl font-bold tracking-tight text-neutral-900 flex items-center gap-1.5">
              <Calendar className="h-5 w-5 text-rose-500" />
              Calendario Interactivo
            </h3>
            <p className="text-xs text-neutral-500 font-sans">
              Selecciona una fecha para ver los partidos asignados y canales de transmisión.
            </p>
          </div>

          <div className="inline-flex rounded-xl bg-neutral-100 border border-neutral-200/50 p-1">
            {[
              { type: "todos" as const, label: "Todo" },
              { type: "grupo" as const, label: "Fase Grupos" },
              { type: "eliminatoria" as const, label: "Eliminatorias" }
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPhase(p.type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold tracking-wide transition-all select-none cursor-pointer ${
                  selectedPhase === p.type
                    ? "bg-white text-rose-500 shadow-xs"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Date Ribbon */}
        <div className="scrollbar-custom relative flex gap-2.5 overflow-x-auto pb-4 select-none cursor-grab active:cursor-grabbing">
          {/* Opción para Ver Todo el Fixture */}
          <button
            onClick={() => setSelectedDate("all")}
            className={`flex flex-col items-center justify-center min-w-[80px] h-[100px] rounded-2xl border transition-all duration-200 focus:outline-hidden shrink-0 cursor-pointer ${
              selectedDate === "all"
                ? "bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/20 transform scale-[1.03]"
                : "bg-white border-neutral-200 hover:border-neutral-300 text-neutral-700"
            }`}
          >
            <Calendar className={`h-4.5 w-4.5 mb-1 ${selectedDate === "all" ? "text-rose-100" : "text-rose-500"}`} />
            <span className="font-sans text-xs font-extrabold tracking-tight leading-none my-0.5">
              Todo el
            </span>
            <span className={`text-[10px] font-sans font-bold tracking-tight ${selectedDate === "all" ? "text-rose-100" : "text-neutral-500"}`}>
              Fixture
            </span>
            <div className={`mt-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full text-[9px] font-mono font-bold leading-none ${selectedDate === "all" ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-500"}`}>
              {matches.filter(m => selectedPhase === "todos" || m.phase === selectedPhase).length}
            </div>
          </button>

          {dateRibbon.map((item, idx) => {
            const isActive = selectedDate !== "all" && item.date === activeDate;
            const parts = (item.date || "11/06/2026").split("/"); // ["11", "06", "2026"]
            const dayNum = parts[0] || "11";
            const monthNum = parts[1] || "06";
            const yearNum = parts[2] || "2026";
            
            // Reconstruct Date object to get day-of-week
            const dObj = new Date(parseInt(yearNum), parseInt(monthNum) - 1, parseInt(dayNum));
            const weekdays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
            const weekday = weekdays[dObj.getDay()] || "Día";
            const monthStr = monthNum === "06" ? "JUN" : "JUL";

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(item.date)}
                className={`flex flex-col items-center justify-center min-w-[72px] h-[100px] rounded-2xl border transition-all duration-200 focus:outline-hidden shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/20 transform scale-[1.03]"
                    : "bg-white border-neutral-200 hover:border-neutral-300 text-neutral-700"
                }`}
              >
                <span className={`text-[10px] font-sans font-bold uppercase tracking-wider ${isActive ? "text-rose-100" : "text-neutral-400"}`}>
                  {weekday}
                </span>
                <span className="font-mono text-2xl font-extrabold tracking-tight leading-none my-1">
                  {dayNum}
                </span>
                <span className={`text-[10px] font-sans font-medium tracking-widest ${isActive ? "text-rose-200" : "text-neutral-500"}`}>
                  {monthStr}
                </span>
                {/* Count badge */}
                <div className={`mt-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full text-[9px] font-mono font-bold leading-none ${isActive ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-500"}`}>
                  {item.count}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MATCH SUMMARY GRID FOR THE ACTIVE DATE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Matches listing (Main Block - Column Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-sans text-xs font-bold text-neutral-400 uppercase tracking-widest">
              {selectedDate === "all" ? "Todo el Fixture Programado" : `Partidos Programados (${activeDate})`}
            </h4>
            <span className="font-mono text-xs text-rose-500 font-bold bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded-full inline-block">
              {filteredMatches.length} {filteredMatches.length === 1 ? "partido" : "partidos"}
            </span>
          </div>

          <div className="space-y-8">
            {groupedMatches.map(([date, matchesInDate]) => (
              <div key={date} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-[2px] flex-1 bg-neutral-100" />
                  <span className="font-mono text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] bg-neutral-50 px-3 py-1 rounded-full border border-neutral-200/50">
                    {date}
                  </span>
                  <div className="h-[2px] flex-1 bg-neutral-100" />
                </div>
                
                <div className="space-y-4">
                  {matchesInDate.map(match => {
                    const localTeam = teams.find(t => t.id === match.localId);
                    const visitorTeam = teams.find(t => t.id === match.visitorId);
                    const isCupGroup = match.group.length === 1;

                    return (
                      <div
                        key={match.id}
                        className="rounded-2xl border border-neutral-200/50 bg-white p-5 shadow-xs hover:shadow-md hover:border-neutral-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden"
                      >
                        {/* Phase Label Indicator Stripe */}
                        <div className={`absolute top-0 left-0 h-full w-[4px] ${isCupGroup ? "bg-indigo-500" : "bg-rose-500"}`} />

                        {/* Left Side: Score / Match Header */}
                        <div className="space-y-3 pl-2 flex-1 md:border-r border-neutral-100/60 md:pr-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-black text-rose-500 uppercase tracking-wide">
                              Partida #{match.id}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-neutral-300" />
                            <span className="font-sans text-xs font-bold text-neutral-500">
                              {isCupGroup ? `Grupo ${match.group}` : `Fase ${match.group}`}
                            </span>
                          </div>

                          {/* Team flags and codes */}
                          <div className="space-y-2.5 py-1">
                            <div
                              onClick={() => onChangeState({ page: "team", selectedTeamId: match.localId })}
                              className="flex items-center gap-3.5 group cursor-pointer w-fit select-none"
                            >
                              <Flag id={match.localId} emoji={localTeam?.bandera} size="md" />
                              <span className="font-sans font-semibold text-neutral-800 group-hover:text-rose-500 group-hover:underline transition-all">
                                {localTeam ? localTeam.fullName : match.localId}
                              </span>
                              <span className="font-mono text-xs font-medium text-neutral-400 group-hover:text-rose-500">
                                {match.localId}
                              </span>
                            </div>

                            <div
                              onClick={() => onChangeState({ page: "team", selectedTeamId: match.visitorId })}
                              className="flex items-center gap-3.5 group cursor-pointer w-fit select-none"
                            >
                              <Flag id={match.visitorId} emoji={visitorTeam?.bandera} size="md" />
                              <span className="font-sans font-semibold text-neutral-800 group-hover:text-rose-500 group-hover:underline transition-all">
                                {visitorTeam ? visitorTeam.fullName : match.visitorId}
                              </span>
                              <span className="font-mono text-xs font-medium text-neutral-400 group-hover:text-rose-500">
                                {match.visitorId}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Side: Venue Weather, Time and Actions */}
                        <div className="flex flex-col justify-between md:items-end gap-3 min-w-[190px]">
                          {/* Date and Time indicator */}
                          <div className="flex flex-col md:items-end gap-1">
                            <div className="flex items-center gap-1.5 text-neutral-400">
                              <Calendar className="h-3.5 w-3.5" />
                              <span className="font-mono text-[11px] font-bold tracking-tight">
                                {match.date}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-neutral-800">
                              <Clock className="h-4 w-4 text-rose-500 shrink-0" />
                              <span className="font-mono text-sm font-extrabold tracking-tight">
                                {match.time}
                              </span>
                            </div>
                          </div>

                          {/* Stadium and city button trigger */}
                          <div
                            onClick={() => onChangeState({ page: "venue", selectedVenueId: match.venueId })}
                            className="flex items-center gap-1.5 text-xs font-sans text-neutral-500 hover:text-blue-600 cursor-pointer select-none transition-colors"
                          >
                            <MapPin className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                            <span className="hover:underline tracking-wide truncate max-w-[170px]}">
                              {match.venueName}
                            </span>
                          </div>

                          {/* TV Channels Block */}
                          <div className="flex flex-wrap gap-1 md:justify-end">
                            {match.tv.map((ch, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 shrink-0 rounded-md bg-neutral-100 border border-neutral-200/50 px-2 py-0.5 font-sans text-[10px] font-semibold text-neutral-600"
                              >
                                <Tv className="h-2.5 w-2.5 text-rose-400 shrink-0" />
                                {ch}
                              </span>
                            ))}
                          </div>

                          {/* Link trigger detail ficha with calendar reminder option */}
                          <div className="grid grid-cols-2 gap-2.5 w-full mt-1">
                            <button
                              onClick={() => onChangeState({ page: "match", selectedMatchId: match.id })}
                              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-neutral-900 hover:bg-rose-500 text-white font-sans text-xs font-bold py-2 px-3 transition-all cursor-pointer"
                            >
                              Ficha
                              <ArrowRight className="h-3 w-3" />
                            </button>
                            <MatchCalendarMenu match={match} teams={teams} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {filteredMatches.length === 0 && (
              <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center max-w-lg mx-auto">
                <p className="text-sm text-neutral-400 font-sans">No hay partidos de la fase filtrada programados en este día.</p>
              </div>
            )}
          </div>
        </div>

        {/* Groups Snapshot Side Info (Column Span 1) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200/50 bg-white p-5 shadow-xs">
            <h3 className="font-sans text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center justify-between">
              Grupos Destacados
              <span
                onClick={() => onChangeState({ page: "group" })}
                className="text-[10px] font-sans font-bold text-rose-500 uppercase tracking-wider hover:underline cursor-pointer select-none"
              >
                Ver todos
              </span>
            </h3>

            <div className="space-y-4">
              {featuredGroups.map(gId => {
                const groupTeams = teams.filter(t => t.group === gId);
                return (
                  <div
                    key={gId}
                    onClick={() => onChangeState({ page: "group", selectedGroupId: gId })}
                    className="group border border-neutral-100 rounded-xl p-3.5 hover:bg-indigo-50/20 hover:border-indigo-100 cursor-pointer transition-all shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-sans font-bold text-sm text-neutral-900 group-hover:text-indigo-600 transition-colors">
                        Grupo {gId}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {groupTeams.map(t => (
                        <div key={t.id} className="flex flex-col items-center gap-1">
                          <Flag id={t.id} emoji={t.bandera} size="sm" />
                          <span className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-widest leading-none">
                            {t.id}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Time converter widget */}
          <div className="rounded-2xl border border-neutral-200/50 bg-white p-5 shadow-xs space-y-3">
            <h4 className="font-sans text-xs font-bold text-neutral-400 uppercase tracking-widest">
              Equivalencias Horarias
            </h4>
            <div className="text-xs font-sans text-neutral-500 leading-relaxed">
              Todos los horarios del fixture están mostrados en la <strong className="text-neutral-800">Hora Oficial Argentina (UTC-3)</strong>.
            </div>
            <div className="border-t border-neutral-100 pt-3 space-y-2">
              {[
                { label: "Estadio Azteca (México)", diff: "-3 h", eg: "16:00 ARG = 13:00 LOCAL" },
                { label: "SoFi Stadium (Los Ángeles)", diff: "-4 h", eg: "22:00 ARG = 18:00 LOCAL" },
                { label: "BMO Field (Toronto)", diff: "-1 h", eg: "16:00 ARG = 15:00 LOCAL" },
                { label: "Hard Rock Stadium (Miami)", diff: "-1 h", eg: "19:00 ARG = 18:00 LOCAL" }
              ].map((eq, i) => (
                <div key={i} className="flex justify-between items-start gap-1 p-1 rounded-sm hover:bg-neutral-50">
                  <div>
                    <span className="font-sans font-semibold text-neutral-700 text-xs block leading-none">{eq.label}</span>
                    <span className="font-mono text-[10px] text-neutral-400 mt-1 block">{eq.eg}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-rose-500">{eq.diff}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
