/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Venue {
  id: string; // e.g., "MX-01"
  name: string; // e.g., "Ciudad de México"
  officialName: string; // e.g., "Mexico City Stadium"
  commercialName: string; // e.g., "Estadio Azteca"
  pais: string; // e.g., "México"
  city: string;
  state: string;
  capacity: number;
  assignedMatches: number;
  tempMedia: string; // e.g., "17 °C"
  tempMaxJun: string; // e.g., "26 °C"
  tempMaxJul: string; // e.g., "24 °C"
  tempMinJun?: string;
  tempMinJul?: string;
  climateNote: string;
  temp2023Note?: string;
}

export interface Team {
  id: string; // e.g., "ARG"
  name: string; // e.g., "Argentina"
  fullName: string; // e.g., "Selección Argentina de Fútbol"
  bandera: string; // e.g., "🇦🇷"
  confederation: string; // e.g., "CONMEBOL"
  posicionClasificatoria: string; // e.g., "1º"
  campeonatos: number;
  subcampeonatos: number;
  ultimoMundial: string;
  dt: string;
  group: string; // e.g., "J"
}

export interface Player {
  id: string; // unique ID e.g. "ARG-Lionel-Messi"
  name: string;
  age: number | string; // 38, or "pendiente"
  dorsal?: string; // e.g., "10"
  club: string;
  capitan: boolean;
  posicion: string; // "Portero", "Defensa", "Mediocampista", "Delantero"
  golesEliminatorias: string; // e.g., "N/A"
  capsSeleccion?: number;
  golesSeleccion?: number;
  equipoId: string; // e.g., "ARG"
  nota?: string;
}

export interface Match {
  id: number; // match number 1 to 104
  date: string; // e.g., "Jue 11 jun"
  rawDate: string; // full day, e.g., "Jue 11 jun 2026"
  time: string; // e.g., "16:00"
  localId: string; // e.g., "MEX"
  visitorId: string; // e.g., "SUD"
  group: string; // e.g., "A", or "16avos", "Octavos", "Cuartos", "Semifinal", "Tercer puesto", "Final"
  venueId: string; // e.g., "MX-01"
  venueName: string; // e.g., "Ciudad de México"
  tv: string[]; // e.g., ["DSports", "Telefe"]
  phase: "grupo" | "eliminatoria";
}

export interface Group {
  id: string; // "A", "B", ... "L"
  teams: string[]; // list of Team IDs, e.g. ["MEX", "RSA", "COR", "CHE"]
}

export interface AppStateHistory {
  page: AppState["page"];
  selectedTeamId?: string;
  selectedPlayerName?: string;
  selectedVenueId?: string;
  selectedMatchId?: number;
  selectedGroupId?: string;
}

export interface AppState {
  page: "home" | "match" | "team" | "player" | "venue" | "group" | "scorers" | "search";
  selectedTeamId?: string;
  selectedPlayerName?: string;
  selectedVenueId?: string;
  selectedMatchId?: number;
  selectedGroupId?: string;
  searchQuery: string;
  navigationHistory: AppStateHistory[];
}
