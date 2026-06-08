/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Award, Compass, AwardIcon, Bookmark, TrendingUp } from "lucide-react";
import { Flag } from "./Flag";

export function ScorersPage() {
  const keepers = [
    { name: "Miroslav Klose", country: "Alemania", code: "ALE", emoji: "🇩🇪", goals: 16, matches: 24, editions: "2002, 2006, 2010, 2014" },
    { name: "Ronaldo Nazário", country: "Brasil", code: "BRA", emoji: "🇧🇷", goals: 15, matches: 19, editions: "1994, 1998, 2002, 2006" },
    { name: "Gerd Müller", country: "Alemania", code: "ALE", emoji: "🇩🇪", goals: 14, matches: 13, editions: "1970, 1974" },
    { name: "Just Fontaine", country: "Francia", code: "FRA", emoji: "🇫🇷", goals: 13, matches: 6, editions: "1958" },
    { name: "Lionel Messi", country: "Argentina", code: "ARG", emoji: "🇦🇷", goals: 13, matches: 26, editions: "2006, 2010, 2014, 2018, 2022" },
    { name: "Kylian Mbappé", country: "Francia", code: "FRA", emoji: "🇫🇷", goals: 12, matches: 14, editions: "2018, 2022" },
    { name: "Pelé", country: "Brasil", code: "BRA", emoji: "🇧🇷", goals: 12, matches: 14, editions: "1958, 1962, 1966, 1970" },
    { name: "Sándor Kocsis", country: "Hungría", code: "HUN", emoji: "🇭🇺", goals: 11, matches: 5, editions: "1954" },
    { name: "Jürgen Klinsmann", country: "Alemania", code: "ALE", emoji: "🇩🇪", goals: 11, matches: 17, editions: "1990, 1994, 1998" },
    { name: "Helmut Rahn", country: "Alemania", code: "ALE", emoji: "🇩🇪", goals: 10, matches: 10, editions: "1954, 1958" }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Title section */}
      <div className="space-y-3 relative pb-2">
        <div className="space-y-1">
          <h2 className="font-sans text-2xl font-extrabold tracking-tight text-neutral-900 flex items-center gap-1.5 animate-fade-in">
            <Award className="h-6 w-6 text-[#1167b1] shrink-0" />
            Goleadores Históricos del Mundial
          </h2>
          <p className="text-xs text-neutral-500 font-sans">
            La tabla de oro de la FIFA. El registro histórico de los máximos anotadores de todos los tiempos en la Copa del Mundo de la FIFA.
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

      {/* HEADER GOLD BOARD */}
      <div className="relative overflow-hidden rounded-3xl border border-neutral-200/50 bg-white p-6 sm:p-8 shadow-sm">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-amber-500/5 blur-2xl" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="inline-flex rounded-full bg-amber-50 border border-amber-100 px-3 py-1 font-sans text-xs font-semibold text-amber-600 uppercase tracking-wide">
              Estadísticas Legendarias de Oro
            </span>
            <h3 className="font-sans text-xl font-bold tracking-tight text-neutral-900">
              Botas de Oro de la Copa del Mundo
            </h3>
            <p className="text-xs text-neutral-500 font-sans leading-relaxed max-w-xl">
              Miroslav Klose lidera el ranking de goleadores históricos con 16 anotaciones acumuladas. Seguido de cerca por el astro brasileño Ronaldo. Lionel Messi y Kylian Mbappé son las leyendas en activo de la tabla.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-center shrink-0 min-w-[200px]">
            <span className="text-[10px] font-sans font-bold text-amber-800 uppercase tracking-widest block leading-none">Récord de un torneo</span>
            <span className="font-mono text-xl font-black text-neutral-800 mt-2 block">Just Fontaine (13 goles)</span>
            <span className="text-[10px] font-sans text-amber-600 block mt-1">Suecia 1958</span>
          </div>
        </div>
      </div>

      {/* HISTORICAL TABLE CONTAINER */}
      <div className="rounded-3xl border border-neutral-200/50 bg-white p-5 sm:p-7 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-sm border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                <th className="py-2.5 pl-3">Orden</th>
                <th className="py-2.5">Goleador</th>
                <th className="py-2.5 text-center font-mono">Goles</th>
                <th className="py-2.5 text-center font-mono">Partidos</th>
                <th className="py-2.5 text-center font-mono hidden sm:table-cell">Promedio</th>
                <th className="py-2.5 pl-4 hidden md:table-cell">Ediciones Disputadas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100/60 select-none">
              {keepers.map((player, idx) => {
                const pos = idx + 1;
                const isPodium = pos <= 3;
                const avg = (player.goals / player.matches).toFixed(2);

                return (
                  <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                    {/* Rank number */}
                    <td className="py-3.5 pl-3">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-lg font-mono text-xs font-bold leading-none ${
                        pos === 1
                          ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                          : pos === 2
                          ? "bg-neutral-300 text-neutral-800"
                          : pos === 3
                          ? "bg-amber-700/80 text-white"
                          : "bg-neutral-100 text-neutral-500"
                      }`}>
                        {pos}
                      </div>
                    </td>

                    {/* Roster profiles */}
                    <td className="py-3.5 pr-2">
                      <div className="flex items-center gap-2.5">
                        <Flag id={player.code} emoji={player.emoji} size="sm" />
                        <div>
                          <span className="font-sans font-bold text-neutral-800 block leading-none">
                            {player.name}
                          </span>
                          <span className="text-[10px] font-sans text-neutral-400 mt-1 block">
                            {player.country}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Goals count */}
                    <td className="py-3.5 text-center font-mono font-extrabold text-neutral-900 border-l border-neutral-100/40">
                      {player.goals}
                    </td>

                    {/* Played matches */}
                    <td className="py-3.5 text-center font-mono font-semibold text-neutral-500">
                      {player.matches}
                    </td>

                    {/* Average goals ratio */}
                    <td className="py-3.5 text-center font-mono text-neutral-400 hidden sm:table-cell">
                      {avg}
                    </td>

                    {/* Year editions */}
                    <td className="py-3.5 pl-4 text-xs font-sans text-neutral-500 hidden md:table-cell">
                      {player.editions}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
