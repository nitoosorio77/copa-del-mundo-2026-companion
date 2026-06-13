/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Search, Home, MapPin, Users, Award, ChevronLeft, Trophy, History } from "lucide-react";
import { AppState } from "../types";

interface NavbarProps {
  state: AppState;
  onChangeState: (newState: Partial<AppState>) => void;
  onGoBack: () => void;
}

export function Navbar({ state, onChangeState, onGoBack }: NavbarProps) {
  const tabs = [
    { page: "home" as const, label: "Calendario", icon: Home },
    { page: "group" as const, label: "Grupos", icon: Users },
    { page: "venue" as const, label: "Sedes", icon: MapPin },
    { page: "scorers" as const, label: "Goleadores", icon: Trophy },
    { page: "historical-scorers" as const, label: "Históricos", icon: History }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/60 bg-white/95 backdrop-blur-md">
      {/* Official FIFA World Cup 2026 Color Spectrum Strip */}
      <div className="h-2 w-full flex overflow-hidden shrink-0">
        <div className="h-full flex-1 bg-[#e61a22]" /> {/* Crimson Red */}
        <div className="h-full flex-1 bg-[#8c152d]" /> {/* Dark Burgundy */}
        <div className="h-full flex-1 bg-[#3c1642]" /> {/* Midnight Plum/Purple */}
        <div className="h-full flex-1 bg-[#1ba3de]" /> {/* Light Sky Blue */}
        <div className="h-full flex-1 bg-[#1167b1]" /> {/* Vivid Royal Blue */}
        <div className="h-full flex-1 bg-[#032b53]" /> {/* Dark Navy */}
        <div className="h-full flex-1 bg-[#00a877]" /> {/* Emerald Green */}
        <div className="h-full flex-1 bg-[#5cd632]" /> {/* Vibrant Lime Green */}
        <div className="h-full flex-1 bg-[#0e5d32]" /> {/* Dark Forest Green */}
        <div className="h-full flex-1 bg-[#ff9f1c]" /> {/* Branded Yellow/Orange */}
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Side: Brand Logo / History Go Back */}
        <div className="flex items-center gap-3">
          {state.navigationHistory.length > 1 && (
            <button
              onClick={onGoBack}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-all select-none cursor-pointer"
              title="Atrás"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          <div
            onClick={() => onChangeState({ page: "home", selectedTeamId: undefined, selectedPlayerName: undefined, selectedVenueId: undefined, selectedMatchId: undefined, selectedGroupId: undefined })}
            className="flex items-center cursor-pointer select-none group gap-2.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-rose-500 to-rose-600 shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <span className="font-sans font-bold text-white text-base tracking-tighter">
                '26
              </span>
            </div>
            <div>
              <h1 className="font-sans font-semibold tracking-tight text-neutral-900 text-base leading-none">
                Mundial FIFA 2026
              </h1>
              <span className="font-mono text-[10px] font-medium text-rose-500 uppercase tracking-widest mt-1 block">
                Companion App
              </span>
            </div>
          </div>
        </div>

        {/* Center: Tabs */}
        <nav className="hidden md:flex items-center gap-1.5">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = state.page === tab.page;
            return (
              <button
                key={tab.page}
                onClick={() =>
                  onChangeState({
                    page: tab.page,
                    selectedTeamId: undefined,
                    selectedPlayerName: undefined,
                    selectedVenueId: undefined,
                    selectedMatchId: undefined,
                    selectedGroupId: undefined
                  })
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-sans text-xs font-semibold tracking-wide transition-all select-none cursor-pointer border ${
                  isActive
                    ? "bg-rose-50 border-rose-100/70 text-rose-600"
                    : "bg-transparent border-transparent text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-rose-500" : "text-neutral-400"}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right Side: Quick Search Bar / Mobile Menu Indicator */}
        <div className="flex items-center gap-2.5">
          <div className="relative group max-w-[200px] sm:max-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400 group-focus-within:text-rose-500 transition-colors pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar..."
              value={state.searchQuery}
              onClick={() => {
                if (state.page !== "search") {
                  onChangeState({ page: "search" });
                }
              }}
              onChange={e => onChangeState({ page: "search", searchQuery: e.target.value })}
              className="w-full rounded-full border border-neutral-200 bg-neutral-50/50 py-1.5 pl-9 pr-4 text-xs font-sans placeholder-neutral-400 focus:bg-white focus:border-rose-500 focus:outline-hidden focus:ring-1 focus:ring-rose-500/25 transition-all text-neutral-800"
            />
          </div>

          {/* Simple Mobile Tab Indicator Trigger */}
          <div className="flex md:hidden items-center gap-1 border-l border-neutral-200 pl-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = state.page === tab.page;
              return (
                <button
                  key={tab.page}
                  onClick={() =>
                    onChangeState({
                      page: tab.page,
                      selectedTeamId: undefined,
                      selectedPlayerName: undefined,
                      selectedVenueId: undefined,
                      selectedMatchId: undefined,
                      selectedGroupId: undefined
                    })
                  }
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                    isActive
                      ? "bg-rose-50 border-rose-100 text-rose-600"
                      : "bg-transparent border-transparent text-neutral-500 hover:text-neutral-900"
                  }`}
                  title={tab.label}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
