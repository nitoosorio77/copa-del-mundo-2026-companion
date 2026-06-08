/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from "react";
import { parseAllData } from "./data/worldCupParser";
import { AppState } from "./types";
import { Navbar } from "./components/Navbar";
import { HomeDashboard } from "./components/HomeDashboard";
import { MatchDetail } from "./components/MatchDetail";
import { TeamDetail } from "./components/TeamDetail";
import { PlayerDetail } from "./components/PlayerDetail";
import { VenueDetail } from "./components/VenueDetail";
import { GroupDetail } from "./components/GroupDetail";
import { ScorersPage } from "./components/ScorersPage";
import { SearchPage } from "./components/SearchPage";
import { Calendar, Globe } from "lucide-react";

export default function App() {
  // Parse all assets and structures once during load
  const { teams, venues, matches, players, groups } = useMemo(() => parseAllData(), []);

  // Set up navigation page state
  const [state, setState] = useState<AppState>({
    page: "home",
    searchQuery: "",
    navigationHistory: [{ page: "home" }]
  });

  // Loading indicator states when switching pages
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const triggerPageTransition = (onComplete: () => void) => {
    setLoading(true);
    setLoadingProgress(0);

    const startTime = Date.now();
    const duration = 1600; // 1.6 seconds total

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      let currentProgress = (elapsed / duration) * 100;

      if (currentProgress >= 100) {
        currentProgress = 100;
        setLoadingProgress(100);
        clearInterval(interval);

        // Execute the actual navigation state change right at 100%
        onComplete();

        // Hold briefly at 100% "done" for legibility and smooth finish
        setTimeout(() => {
          setLoading(false);
        }, 350);
      } else {
        setLoadingProgress(Math.floor(currentProgress));
      }
    }, 16);
  };

  const onChangeState = (update: Partial<AppState>) => {
    // Determine if this is a visual page change or detail change
    const isPageChange = 
      (update.page !== undefined && update.page !== state.page) ||
      (update.selectedTeamId !== undefined && update.selectedTeamId !== state.selectedTeamId) ||
      (update.selectedPlayerName !== undefined && update.selectedPlayerName !== state.selectedPlayerName) ||
      (update.selectedVenueId !== undefined && update.selectedVenueId !== state.selectedVenueId) ||
      (update.selectedMatchId !== undefined && update.selectedMatchId !== state.selectedMatchId) ||
      (update.selectedGroupId !== undefined && update.selectedGroupId !== state.selectedGroupId);

    if (!isPageChange) {
      setState(prev => ({ ...prev, ...update }));
      return;
    }

    triggerPageTransition(() => {
      setState(prev => {
        const nextState = { ...prev, ...update };
        
        const lastHistory = prev.navigationHistory[prev.navigationHistory.length - 1];
        const isSameStateStr = 
          lastHistory && 
          lastHistory.page === nextState.page &&
          lastHistory.selectedTeamId === nextState.selectedTeamId &&
          lastHistory.selectedPlayerName === nextState.selectedPlayerName &&
          lastHistory.selectedVenueId === nextState.selectedVenueId &&
          lastHistory.selectedMatchId === nextState.selectedMatchId &&
          lastHistory.selectedGroupId === nextState.selectedGroupId;

        let updatedHistory = [...prev.navigationHistory];
        if (!isSameStateStr) {
          updatedHistory.push({
            page: nextState.page,
            selectedTeamId: nextState.selectedTeamId,
            selectedPlayerName: nextState.selectedPlayerName,
            selectedVenueId: nextState.selectedVenueId,
            selectedMatchId: nextState.selectedMatchId,
            selectedGroupId: nextState.selectedGroupId
          });
        }

        // Smooth scroll back to top of container
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "instant" as any });
        }, 0);

        return {
          ...nextState,
          navigationHistory: updatedHistory
        };
      });
    });
  };

  const onGoBack = () => {
    if (state.navigationHistory.length <= 1) return;

    triggerPageTransition(() => {
      setState(prev => {
        if (prev.navigationHistory.length <= 1) return prev;
        const updatedHistory = [...prev.navigationHistory];
        updatedHistory.pop(); // Remove active slide
        const prevState = updatedHistory[updatedHistory.length - 1];

        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "instant" as any });
        }, 0);

        return {
          ...prev,
          page: prevState.page,
          selectedTeamId: prevState.selectedTeamId,
          selectedPlayerName: prevState.selectedPlayerName,
          selectedVenueId: prevState.selectedVenueId,
          selectedMatchId: prevState.selectedMatchId,
          selectedGroupId: prevState.selectedGroupId,
          navigationHistory: updatedHistory
        };
      });
    });
  };

  // Switch display component according to page parameter
  const renderContent = () => {
    switch (state.page) {
      case "home":
        return (
          <HomeDashboard
            teams={teams}
            venues={venues}
            matches={matches}
            onChangeState={onChangeState}
          />
        );
      case "match":
        return (
          <MatchDetail
            matchId={state.selectedMatchId || 1}
            matches={matches}
            teams={teams}
            venues={venues}
            players={players}
            onChangeState={onChangeState}
          />
        );
      case "team":
        return (
          <TeamDetail
            teamId={state.selectedTeamId || "ARG"}
            teams={teams}
            players={players}
            matches={matches}
            onChangeState={onChangeState}
          />
        );
      case "player":
        return (
          <PlayerDetail
            playerName={state.selectedPlayerName || ""}
            teamId={state.selectedTeamId || ""}
            players={players}
            teams={teams}
            onChangeState={onChangeState}
          />
        );
      case "venue":
        return (
          <VenueDetail
            venueId={state.selectedVenueId || "MX-01"}
            venues={venues}
            matches={matches}
            teams={teams}
            onChangeState={onChangeState}
          />
        );
      case "group":
        return (
          <GroupDetail
            groups={groups}
            teams={teams}
            matches={matches}
            onChangeState={onChangeState}
            selectedGroupId={state.selectedGroupId}
          />
        );
      case "scorers":
        return <ScorersPage />;
      case "search":
        return (
          <SearchPage
            teams={teams}
            players={players}
            venues={venues}
            matches={matches}
            searchQuery={state.searchQuery}
            onChangeState={onChangeState}
          />
        );
      default:
        return (
          <HomeDashboard
            teams={teams}
            venues={venues}
            matches={matches}
            onChangeState={onChangeState}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 flex flex-col font-sans antialiased text-neutral-800">
      {/* Loading Overlay with 2026 Branded Spectrum Progress Bar */}
      {loading && (
        <div id="page-loading-overlay" className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md animate-[fade-in_0.2s_ease-out]">
          <div className="w-full max-w-xs px-4 text-center space-y-6">
            {/* Minimalist emblem inspired by the 2026 World Cup official aesthetic */}
            <div className="relative mx-auto w-20 h-20 bg-neutral-950 rounded-2xl flex flex-col items-center justify-center border border-neutral-800 shadow-xl shadow-neutral-950/20 select-none animate-bounce">
              <span className="font-sans text-3xl font-black text-white leading-none">
                26
              </span>
              <span className="text-[9px] font-sans font-extrabold uppercase tracking-widest text-[#1167b1] mt-1">
                FIFA
              </span>
              {/* Outer soft glowing rings */}
              <div className="absolute inset-0 rounded-2xl border border-white/5" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between font-sans text-xs text-neutral-400 select-none tracking-wide">
                <span className="flex items-center gap-1.5 font-medium">
                  {/* Small animated pulse point */}
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1167b1] animate-ping" />
                  <span className="font-sans font-bold text-neutral-700 lowercase">
                    {loadingProgress >= 95 ? "done" : loadingProgress >= 50 ? "adaptando data" : "cargando data"}
                  </span>
                </span>
                <span className="font-mono font-bold text-neutral-800">{loadingProgress}%</span>
              </div>
              
              {/* Loaded track */}
              <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200/50 p-[1.5px] shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-75 ease-out shadow-xs"
                  style={{
                    width: `${loadingProgress}%`,
                    backgroundImage: "linear-gradient(to right, #e61a22, #8c152d, #3c1642, #1ba3de, #1167b1, #032b53, #00a877, #5cd632, #0e5d32, #ff9f1c)",
                    backgroundSize: "320px 100%", // Fit exactly to the max-w-xs container width (320px)
                    backgroundPosition: "left center",
                    backgroundRepeat: "no-repeat"
                  }}
                />
              </div>
            </div>

            <p className="text-[9px] uppercase font-bold tracking-widest text-neutral-400">
              Cargando interfaz oficial 2026
            </p>
          </div>
        </div>
      )}

      {/* Dynamic Header navbar */}
      <Navbar state={state} onChangeState={onChangeState} onGoBack={onGoBack} />

      {/* Main container page component */}
      <main className="flex-1 pb-16">{renderContent()}</main>

      {/* Footer information bar */}
      <footer className="border-t border-neutral-200/50 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 select-none">
            <span className="font-sans font-bold text-rose-500 uppercase tracking-widest text-xs">
              Mundial 2026 Companion App
            </span>
          </div>
          <p className="text-xs text-neutral-400 font-sans leading-relaxed max-w-md mx-auto">
            Un proyecto premium diseñado para seguir de cerca el torneo más grande de la historia en Norteamérica. Guía informativa no oficial.
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-400 font-sans tracking-wide">
            <Globe className="h-3 w-3 text-neutral-400 shrink-0" />
            <span>Todos los horarios de eventos están mostrados en UTC-3.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

