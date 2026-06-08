/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { Award, Compass, Shield, Users, HelpCircle, Star, Heart } from "lucide-react";
import { Player, Team, AppState } from "../types";
import { Flag } from "./Flag";
import { ProgressBar } from "./ProgressBar";

interface PlayerDetailProps {
  playerName: string;
  teamId: string;
  players: Player[];
  teams: Team[];
  onChangeState: (newState: Partial<AppState>) => void;
}

export function PlayerDetail({
  playerName,
  teamId,
  players,
  teams,
  onChangeState
}: PlayerDetailProps) {
  const player = useMemo(() => {
    return players.find(p => p.name === playerName && p.equipoId === teamId);
  }, [players, playerName, teamId]);

  const team = useMemo(() => teams.find(t => t.id === teamId), [teams, teamId]);

  if (!player) {
    return (
      <div className="mx-auto max-w-lg p-12 text-center">
        <p className="text-neutral-500 font-sans">No se encontró el perfil de jugador solicitado.</p>
      </div>
    );
  }

  // Generate deterministic stats for high-fidelity technical breakdown
  const stats = useMemo(() => {
    // Hash based on player name to make stats stable per player
    const hash = player.name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const speed = 65 + (hash % 31);
    const shoot = 55 + ((hash * 3) % 41);
    const pass = 60 + ((hash * 7) % 36);
    const physical = 60 + ((hash * 11) % 36);
    const defense = player.posicion === "Defensa" ? 75 + (hash % 21) : 40 + (hash % 30);
    const rating = Math.round((speed + shoot + pass + physical + defense) / 5);

    return { speed, shoot, pass, physical, defense, rating };
  }, [player]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Return hooks */}
      <div>
        <button
          onClick={() => onChangeState({ page: "team", selectedTeamId: teamId })}
          className="text-xs font-sans font-bold text-neutral-500 hover:text-emerald-500 flex items-center gap-1 select-none cursor-pointer"
        >
          &larr; Volver al Plantel de {team?.name || "Selección"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MAIN PROFILE CARD (Column Span 1) */}
        <div className="rounded-3xl border border-neutral-200/50 bg-white p-6 sm:p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-amber-500/5 blur-2xl" />

          {/* Player avatar fallback circular badge */}
          <div className="relative">
            <div className="h-28 w-28 rounded-full bg-linear-to-br from-neutral-50 to-neutral-100 border-2 border-neutral-200 flex items-center justify-center font-sans font-black text-4xl text-neutral-400 select-none shadow-md">
              {player.name.substring(0, 1)}
            </div>
            {player.capitan && (
              <div className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-white" title="Capitán de Selección">
                <Star className="h-4 w-4 fill-white" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="font-sans text-2xl font-black text-neutral-900 leading-tight">
              {player.name}
            </h2>
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-xs font-bold bg-neutral-100 border border-neutral-200/50 text-neutral-600 px-2.5 py-0.5 rounded-full shrink-0">
                Dorsal #{player.dorsal || "—"}
              </span>
              <span className="font-sans text-xs font-semibold text-neutral-500">
                {player.posicion}
              </span>
            </div>
          </div>

          {/* Quick core info list */}
          <div className="w-full border-t border-b border-neutral-100 py-5 space-y-4">
            <div className="flex justify-between items-center text-xs font-sans text-neutral-500">
              <span>Club Atual:</span>
              <strong className="text-neutral-800">{player.club}</strong>
            </div>
            <div className="flex justify-between items-center text-xs font-sans text-neutral-500">
              <span>Edad:</span>
              <strong className="text-neutral-800 font-mono">{player.age} años</strong>
            </div>
            <div className="flex justify-between items-center text-xs font-sans text-neutral-500">
              <span>Goles Clasificación:</span>
              <strong className="text-rose-500 font-mono">{player.golesEliminatorias}</strong>
            </div>
          </div>

          {/* Back links selection */}
          <div
            onClick={() => onChangeState({ page: "team", selectedTeamId: teamId })}
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-neutral-50 hover:bg-emerald-50/20 border border-neutral-100 hover:border-emerald-200 cursor-pointer select-none transition-all w-full justify-center group"
          >
            <Flag id={teamId} emoji={team?.bandera} size="sm" />
            <div className="text-left leading-none">
              <span className="text-[9px] font-sans font-bold text-neutral-400 uppercase tracking-widest block">Selección Nacional</span>
              <span className="font-sans font-bold text-xs text-neutral-800 group-hover:text-emerald-500 block mt-1 transition-colors">{team?.fullName}</span>
            </div>
          </div>
        </div>

        {/* DETAILED FIFA ATTRIBUTES & STATS BREAKDOWN (Column Span 2) */}
        <div className="lg:col-span-2 rounded-3xl border border-neutral-200/50 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
            <h3 className="font-sans text-base font-bold text-neutral-900 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Atributos Técnicos FIFA '26
            </h3>
            <div className="flex items-center gap-1">
              <span className="font-sans text-xs text-neutral-400 font-medium">Calificación Global:</span>
              <span className="font-mono text-base font-extrabold text-amber-500 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg">
                {stats.rating}
              </span>
            </div>
          </div>

          <div className="space-y-5">
            <ProgressBar value={stats.speed} max={100} label="Aceleración & Velocidad" color="rose" valueSuffix="/100" />
            <ProgressBar value={stats.shoot} max={100} label="Potencia & Precisión de Tiro" color="amber" valueSuffix="/100" />
            <ProgressBar value={stats.pass} max={100} label="Visión & Pases Cortos/Largos" color="emerald" valueSuffix="/100" />
            <ProgressBar value={stats.physical} max={100} label="Resistencia & Fuerza Física" color="blue" valueSuffix="/100" />
            <ProgressBar value={stats.defense} max={100} label="Intercepción & Táctica Defensiva" color="indigo" valueSuffix="/100" />
          </div>

          {/* High quality informational block */}
          <div className="border-t border-neutral-100 pt-6 space-y-4">
            <h4 className="font-sans text-xs font-bold text-neutral-400 uppercase tracking-widest">
              Análisis Táctico del Jugador
            </h4>
            <div className="font-sans text-xs sm:text-sm text-neutral-500 leading-relaxed bg-neutral-50/50 border border-neutral-150 p-4 rounded-2xl space-y-3.5">
              <p>
                Este jugador constituye un pilar esencial en el sistema técnico de su federación. Demuestra una gran consistencia de juego, con un promedio de calificaciones equilibradas en el fútbol de alta competencia internacional.
              </p>
              <p>
                Al vestir la camiseta de <strong className="text-neutral-800">{team?.name || "su selección"}</strong> para la Copa del Mundo 2026, sus métricas de rendimiento físico y táctico serán fundamentales para superar a los rivales del grupo y asegurar la ventaja en las fases eliminatorias del torneo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
