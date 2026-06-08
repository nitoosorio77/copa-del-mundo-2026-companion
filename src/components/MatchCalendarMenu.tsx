import React, { useState, useRef, useEffect } from "react";
import { Calendar, Download, ExternalLink } from "lucide-react";
import { Match, Team } from "../types";
import { getGoogleCalendarUrl, downloadICSFile } from "../utils/calendar";

interface MatchCalendarMenuProps {
  match: Match;
  teams: Team[];
  align?: "left" | "right";
}

export function MatchCalendarMenu({ match, teams, align = "right" }: MatchCalendarMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleDownloadICS = () => {
    downloadICSFile(match, teams);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left w-full" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 font-sans text-xs font-bold py-2 px-3 transition-colors w-full cursor-pointer shadow-xs"
        id={`calendar-btn-${match.id}`}
        title="Agregar al calendario"
      >
        <Calendar className="h-4 w-4 text-rose-500 shrink-0" />
        Recordatorio
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 mt-1 w-52 rounded-xl bg-white border border-neutral-100 shadow-xl ring-1 ring-black/5 focus:outline-hidden ${
            align === "right" ? "right-0" : "left-0"
          } bottom-full mb-1.5 md:bottom-auto md:top-full md:mt-1`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-1.5 space-y-1">
            <div className="px-2.5 py-1.5 text-[10px] font-mono tracking-widest font-bold text-neutral-400 border-b border-neutral-50 uppercase">
              Opciones de Calendario
            </div>
            
            <a
              href={getGoogleCalendarUrl(match, teams)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-sans font-semibold text-neutral-700 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <ExternalLink className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
              Añadir a Google Calendar
            </a>

            <button
              onClick={handleDownloadICS}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-sans font-semibold text-neutral-700 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
              Descargar archivo (.ics)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
