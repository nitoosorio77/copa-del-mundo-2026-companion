/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Team, Player, Venue, Match, Group } from "../types";
import { RAW_SEDES } from "./rawSedes";
import { RAW_TEAMS } from "./rawTeams";
import { RAW_MATCHES } from "./rawMatches";
import { RAW_PLAYERS } from "./rawPlayers";

// Resolve names of teams for placeholder rosters or stats
const Surnames = [
  "Fernández", "García", "Rodríguez", "González", "López", "Martínez", "Sánchez", "Pérez",
  "Gomez", "Martin", "Silva", "Santos", "Smith", "Johnson", "Williams", "Jones",
  "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas",
  "Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker",
  "Hwang", "Kim", "Lee", "Park", "Choi", "Jung", "Kang", "Cho", "Yoon", "Sato",
  "Tanaka", "Takahashi", "Watanabe", "Ito", "Yamamoto", "Nakamura", "Kobayashi", "Saito"
];

const Firstnames = [
  "Lucas", "Mateo", "Santiago", "Daniel", "Sebastián", "Alejandro", "Nicolás", "Samuel",
  "John", "David", "James", "Robert", "William", "Michael", "Thomas", "Richard",
  "Thomas", "Alexander", "Daniel", "Maximilian", "Paul", "Jonas", "Leon", "Felix",
  "Ji-hoon", "Dong-hyun", "Min-jun", "Hyun-woo", "Seo-jun", "Do-hyun", "Ye-jun",
  "Sota", "Sho", "Ren", "Yuto", "Haruto", "Yuma", "Itsuki", "Hiroto"
];

function generatePlaceholdersForTeam(teamId: string, teamName: string): Player[] {
  const positions = [
    { pos: "Portero", count: 3 },
    { pos: "Defensa", count: 8 },
    { pos: "Mediocampista", count: 9 },
    { pos: "Delantero", count: 6 }
  ];

  const players: Player[] = [];
  let isFirst = true;

  positions.forEach(({ pos, count }) => {
    for (let i = 0; i < count; i++) {
      const first = Firstnames[(teamId.charCodeAt(0) + teamId.charCodeAt(1) + i * 7) % Firstnames.length];
      const last = Surnames[(teamId.charCodeAt(1) + i * 13 + pos.charCodeAt(0)) % Surnames.length];
      const name = `${first} ${last}`;
      const age = 20 + ((teamId.charCodeAt(0) + i * 3) % 17);
      const isCap = pos === "Delantero" && isFirst;
      if (isCap) isFirst = false;

      players.push({
        id: `${teamId}-${pos}-${i}`,
        name,
        age,
        club: `${teamName} Club`,
        capitan: isCap,
        posicion: pos,
        golesEliminatorias: "N/A",
        capsSeleccion: 10 + (i * 3) % 45,
        golesSeleccion: pos === "Delantero" ? (i * 2) % 12 : 0,
        equipoId: teamId
      });
    }
  });

  return players;
}

export function parseAllData() {
  const teams: Team[] = [];
  const groupsTemp: { [key: string]: string[] } = {};

  // Initialize groups A to L
  "ABCDEFGHIJKL".split("").forEach(char => {
    groupsTemp[char] = [];
  });

  // --- 1. PARSE TEAMS & GROUP ASSIGNMENTS ---
  const teamBlocks = RAW_TEAMS.split("### ");
  teamBlocks.forEach(block => {
    if (!block.trim() || block.startsWith("#")) return;

    const lines = block.split("\n");
    const headerLine = lines[0].trim();
    if (!headerLine.includes(" — ")) return;

    const [id, name] = headerLine.split(" — ").map(s => s.trim());
    const cleanId = id.replace(/[^A-Z0-9_-]/g, "");

    const fields: any = {
      id: cleanId,
      name: name,
      fullName: name,
      bandera: "🏳️",
      confederation: "FIFA",
      posicionClasificatoria: "Clasificado",
      campeonatos: 0,
      subcampeonatos: 0,
      ultimoMundial: "N/A",
      dt: "Pendiente confirmar",
      group: "A"
    };

    lines.forEach(line => {
      const cleanLine = line.trim();
      if (!cleanLine.startsWith("- **")) return;

      const colonIdx = cleanLine.indexOf(":**");
      if (colonIdx === -1) return;

      const key = cleanLine.substring(4, colonIdx).trim().toLowerCase();
      const val = cleanLine.substring(colonIdx + 3).trim();

      if (key === "nombre_completo") fields.fullName = val;
      if (key === "bandera") fields.bandera = val;
      if (key === "confederation") fields.confederation = val;
      if (key === "posicion_clasificatoria") fields.posicionClasificatoria = val;
      if (key === "campeonatos_mundiales") {
        const num = parseInt(val);
        fields.campeonatos = isNaN(num) ? 0 : num;
      }
      if (key === "subcampeonatos_mundiales") {
        const num = parseInt(val);
        fields.subcampeonatos = isNaN(num) ? 0 : num;
      }
      if (key === "ultimo_mundial_anterior") fields.ultimoMundial = val;
      if (key === "dt") fields.dt = val;
    });

    teams.push(fields);
  });

  // Parse Groups structure from the bottom of RAW_TEAMS
  const groupRegex = /## Grupo ([A-L])([\s\S]*?)(?=##|$)/gi;
  let matchGroup;
  while ((matchGroup = groupRegex.exec(RAW_TEAMS)) !== null) {
    const groupId = matchGroup[1].trim();
    const groupContent = matchGroup[2];
    const itemRegex = /- \*\*equipo_\d+:\*\* ([A-Z0-9_]+)/g;
    let matchItem;
    while ((matchItem = itemRegex.exec(groupContent)) !== null) {
      const teamId = matchItem[1].trim();
      if (groupsTemp[groupId]) {
        groupsTemp[groupId].push(teamId);
      }
      // Associate group on the team
      const t = teams.find(team => team.id === teamId);
      if (t) {
        t.group = groupId;
      }
    }
  }

  // --- 2. PARSE SEDES (VENUES) ---
  const venues: Venue[] = [];
  const venueBlocks = RAW_SEDES.split("### ");
  venueBlocks.forEach(block => {
    if (!block.trim() || block.startsWith("#")) return;

    const lines = block.split("\n");
    const headerLine = lines[0].trim();
    if (!headerLine.includes(" — ")) return;

    const [id, name] = headerLine.split(" — ").map(s => s.trim());
    const cleanId = id.replace(/[^A-Z0-9_-]/g, "");

    const fields: any = {
      id: cleanId,
      name: name,
      officialName: name,
      commercialName: name,
      pais: "N/A",
      city: name,
      state: "",
      capacity: 50000,
      assignedMatches: 0,
      tempMedia: "20 °C",
      tempMaxJun: "25 °C",
      tempMaxJul: "25 °C",
      climateNote: "",
      temp2023Note: ""
    };

    lines.forEach(line => {
      const cleanLine = line.trim();
      if (!cleanLine.startsWith("- **")) return;

      const colonIdx = cleanLine.indexOf(":**");
      if (colonIdx === -1) return;

      const key = cleanLine.substring(4, colonIdx).trim().toLowerCase();
      const val = cleanLine.substring(colonIdx + 3).trim();

      if (key === "nombre_sede") fields.name = val;
      if (key === "nombre_estadio_oficial_fifa") fields.officialName = val;
      if (key === "nombre_estadio_comercial") fields.commercialName = val;
      if (key === "pais") fields.pais = val;
      if (key === "ciudad") fields.city = val;
      if (key === "estado_provincia") fields.state = val;
      if (key === "capacidad_mundial_2026") {
        const digits = val.replace(/[^0-9]/g, "");
        fields.capacity = parseInt(digits) || 50000;
      }
      if (key === "partidos_asignados") {
        // We will compute matches count directly later but store raw note or fallback
      }
      if (key === "temperatura_promedio_junio_julio_c") fields.tempMedia = val;
      if (key === "temperatura_maxima_promedio_junio_c") fields.tempMaxJun = val;
      if (key === "temperatura_maxima_promedio_julio_c") fields.tempMaxJul = val;
      if (key === "temperatura_minima_promedio_junio_c") fields.tempMinJun = val;
      if (key === "temperatura_minima_promedio_julio_c") fields.tempMinJul = val;
      if (key === "clima_nota") fields.climateNote = val;
      if (key === "temperatura_2023_nota") fields.temp2023Note = val;
    });

    venues.push(fields);
  });

  // --- 3. PARSE MATCHES ---
  const matches: Match[] = [];
  const dateBlocks = RAW_MATCHES.split("### ");
  dateBlocks.forEach(block => {
    if (!block.trim() || block.startsWith("#")) return;

    const lines = block.split("\n");
    const rawDateText = lines[0].trim();
    const dateParts = rawDateText.split(" ");
    if (dateParts.length < 3) return;
    
    // Format to dd/mm/yyyy
    const dayVal = (dateParts[1] || "01").padStart(2, "0");
    const parsedMo = (dateParts[2] || "jun").toLowerCase();
    const monthVal = parsedMo.startsWith("jun") ? "06" : (parsedMo.startsWith("jul") ? "07" : "06");
    const yearVal = dateParts[3] || "2026";
    const formattedDate = `${dayVal}/${monthVal}/${yearVal}`;

    lines.forEach(line => {
      const cleanLine = line.trim();
      if (cleanLine.startsWith("- **partido:** ")) {
        const payload = cleanLine.replace("- **partido:** ", "").trim();
        const parts = payload.split("|").map(s => s.trim());
        if (parts.length < 7) return;

        const id = parseInt(parts[0]);
        const time = parts[1];
        const localId = parts[2];
        const visitorId = parts[3];
        const group = parts[4];
        const venueId = parts[5];
        const tvParts = parts[6].split(",").map(s => s.trim());

        const matchedVenue = venues.find(v => v.id === venueId);
        const venueName = matchedVenue ? matchedVenue.name : venueId;

        matches.push({
          id,
          date: formattedDate,
          rawDate: formattedDate,
          time,
          localId,
          visitorId,
          group,
          venueId,
          venueName,
          tv: tvParts,
          phase: (group.length === 1 && "ABCDEFGHIJKL".includes(group)) ? "grupo" : "eliminatoria"
        });
      } else if (cleanLine.startsWith("- **resultado:** ")) {
        const payload = cleanLine.replace("- **resultado:** ", "").trim();
        const parts = payload.split("|").map(s => s.trim());
        if (parts.length < 2) return;

        const matchId = parseInt(parts[0]);
        const scoreParts = parts[1].split("-").map(s => parseInt(s.trim()));
        if (scoreParts.length < 2) return;

        const match = matches.find(m => m.id === matchId);
        if (match) {
          match.result = {
            localGoals: scoreParts[0],
            visitorGoals: scoreParts[1],
            goals: [],
            cards: []
          };

          // Parse goals: GOLES: (MEX) Player 45', (USA) Player 60' (P)
          const goalsPart = parts.find(p => p.startsWith("GOLES:"));
          if (goalsPart) {
            const goalsText = goalsPart.replace("GOLES:", "").trim();
            const goalEntries = goalsText.split(",").map(g => g.trim()).filter(Boolean);
            goalEntries.forEach(entry => {
              const teamMatch = entry.match(/^\(([A-Z0-9_-]+)\)/);
              const teamId = teamMatch ? teamMatch[1] : match.localId; // fallback to local if missing
              
              const minuteMatch = entry.match(/(\d+)'/);
              const minute = minuteMatch ? minuteMatch[1] : "";
              const isPenalty = entry.includes("(P)") || entry.includes("(pen)");
              const isOwnGoal = entry.includes("(OG)") || entry.includes("(EC)");

              // Strip tags to get name: (TEAM), minute, (P), (OG), (EC)
              const name = entry
                .replace(/^\([^)]+\)/, "") // strip leading team
                .replace(/\([^)]+\)/g, "") // strip other tags
                .replace(/\d+'/, "")
                .trim();

              match.result!.goals.push({
                playerName: name,
                teamId,
                minute,
                isPenalty,
                isOwnGoal
              });
            });
          }

          // Parse cards: CARDS: (MEX) Player 30' Y, (USA) Player 80' R
          const cardsPart = parts.find(p => p.startsWith("CARDS:"));
          if (cardsPart) {
            const cardsText = cardsPart.replace("CARDS:", "").trim();
            const cardEntries = cardsText.split(",").map(c => c.trim()).filter(Boolean);
            cardEntries.forEach(entry => {
              const teamMatch = entry.match(/^\(([A-Z0-9_-]+)\)/);
              const teamId = teamMatch ? teamMatch[1] : match.localId;

              const minuteMatch = entry.match(/(\d+)'/);
              const minute = minuteMatch ? minuteMatch[1] : "";
              const isRed = entry.endsWith(" R");
              const name = entry
                .replace(/^\([^)]+\)/, "")
                .replace(/\([^)]+\)/g, "")
                .replace(/\d+'/, "")
                .replace(/\s[YR]$/, "")
                .trim();

              match.result!.cards.push({
                playerName: name,
                teamId,
                minute,
                type: isRed ? "red" : "yellow"
              });
            });
          }
        }
      }
    });
  });

  // Update assignedMatches dynamic tally in venues
  venues.forEach(venue => {
    venue.assignedMatches = matches.filter(m => m.venueId === venue.id).length;
  });

  // --- 4. PARSE PLAYERS ---
  const players: Player[] = [];
  const playerChunks = RAW_PLAYERS.split("# Jugadores — ");
  playerChunks.forEach(chunk => {
    if (!chunk.trim()) return;

    const lines = chunk.split("\n");
    const titleLine = lines[0].trim();
    const idMatch = titleLine.match(/\(([A-Z0-9_-]+)\)/);
    if (!idMatch) return;

    const teamId = idMatch[1].trim();

    lines.forEach(line => {
      const cleanLine = line.trim();
      if (!cleanLine.startsWith("- **nombre:** ")) return;

      const payload = cleanLine.replace("- **nombre:** ", "").trim();
      const attribs = payload.split(" | ");
      const fields: any = {
        id: "",
        name: "",
        age: "Pendiente",
        club: "Sin club",
        capitan: false,
        posicion: "Delantero",
        golesEliminatorias: "N/A",
        equipoId: teamId
      };

      attribs.forEach((attr, idx) => {
        const colonIdx = attr.indexOf(":");
        if (colonIdx === -1) {
          if (idx === 0) {
            fields.name = attr.trim();
          }
          return;
        }
        const key = attr.substring(0, colonIdx).replace(/\*\*/g, "").trim().toLowerCase();
        const val = attr.substring(colonIdx + 1).replace(/\*\*/g, "").trim();

        if (key === "nombre") fields.name = val;
        if (key === "edad") {
          const parsedAge = parseInt(val);
          fields.age = isNaN(parsedAge) ? val : parsedAge;
        }
        if (key === "club") fields.club = val;
        if (key === "capitan") fields.capitan = val.toLowerCase() === "sí" || val.toLowerCase() === "si" || val.toLowerCase() === "yes";
        if (key === "posicion") fields.posicion = val;
        if (key === "goles_eliminatorias") fields.golesEliminatorias = val;
        if (key === "caps_seleccion") fields.capsSeleccion = parseInt(val) || undefined;
        if (key === "goles_seleccion") fields.golesSeleccion = parseInt(val) || undefined;
        if (key === "dorsal") fields.dorsal = val;
      });

      fields.id = `${teamId}-${fields.name.replace(/\s+/g, "-")}`;
      players.push(fields);
    });
  });

  // Ensure every of the 48 teams has a roster. If not parsed, fill with gorgeous placeholders!
  teams.forEach(team => {
    const hasRoster = players.some(p => p.equipoId === team.id);
    if (!hasRoster) {
      const defaultRoster = generatePlaceholdersForTeam(team.id, team.name);
      players.push(...defaultRoster);
    }
  });

  // Compile final Group contracts
  const groups: Group[] = [];
  Object.keys(groupsTemp).forEach(id => {
    groups.push({
      id,
      teams: groupsTemp[id]
    });
  });

  return {
    teams,
    venues,
    matches,
    players,
    groups
  };
}
