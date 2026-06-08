/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";

interface FlagProps {
  id: string; // e.g., "ARG", "MEX"
  emoji?: string; // e.g., "🇦🇷"
  size?: "sm" | "md" | "lg" | "xl";
}

// Map FIFA/custom 3-letter codes to ISO 3166-1-alpha-2 codes for FlagCDN
const CODE_MAP: { [key: string]: string } = {
  ARG: "ar",
  BRA: "br",
  COL: "co",
  URU: "uy",
  ECU: "ec",
  PAR: "py",
  ALE: "de",
  ESP: "es",
  FRA: "fr",
  ING: "gb-eng",
  POR: "pt",
  HOL: "nl",
  BEL: "be",
  AUT: "at",
  NOR: "no",
  SUE: "se",
  SUI: "ch",
  ESC: "gb-sct",
  CRO: "hr",
  TUR: "tr",
  CHE: "cz",
  BOS: "ba",
  MAR: "ma",
  TUN: "tn",
  DZA: "dz",
  EGI: "eg",
  GHA: "gh",
  CAB: "cv",
  SEN: "sn",
  CIV: "ci",
  SUD: "za",
  RDC: "cd",
  JAP: "jp",
  COR: "kr",
  IRA: "ir",
  ARS: "sa",
  JOR: "jo",
  QAT: "qa",
  AUS: "au",
  UZB: "uz",
  IRA2: "iq",
  USA: "us",
  MEX: "mx",
  CAN: "ca",
  HAI: "ht",
  PAN: "pa",
  CUR: "cw",
  NZL: "nz"
};

export function Flag({ id, emoji, size = "md" }: FlagProps) {
  const [hasError, setHasError] = useState(false);
  const cleanId = id ? id.trim().toUpperCase() : "";
  const isoCode = CODE_MAP[cleanId];

  const sizeClasses = {
    sm: "text-[12px]",
    md: "text-[18px]",
    lg: "text-[26px]",
    xl: "text-[42px]"
  };

  const wrapperClasses = {
    sm: "w-5 h-5 flex items-center justify-center rounded-sm bg-neutral-100 shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-neutral-200/40 select-none overflow-hidden shrink-0",
    md: "w-8 h-8 flex items-center justify-center rounded-md bg-neutral-100 shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-neutral-200/50 select-none overflow-hidden shrink-0",
    lg: "w-12 h-12 flex items-center justify-center rounded-xl bg-neutral-100 shadow-[0_2px_6px_rgba(0,0,0,0.12)] border border-neutral-300/40 select-none overflow-hidden shrink-0",
    xl: "w-20 h-20 flex items-center justify-center rounded-2xl bg-neutral-100 shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-neutral-300/50 select-none overflow-hidden shrink-0"
  };

  const fallback = cleanId ? cleanId.substring(0, 3) : "??";

  // Use FlagCDN images for high performance and visual consistency on Windows/other OSs
  const showImage = isoCode && !hasError;

  return (
    <div className={wrapperClasses[size]} title={cleanId}>
      {showImage ? (
        <img
          src={size === "xl" ? `https://flagcdn.com/w160/${isoCode}.png` : `https://flagcdn.com/w40/${isoCode}.png`}
          srcSet={size === "xl" ? `https://flagcdn.com/w320/${isoCode}.png 2x` : `https://flagcdn.com/w80/${isoCode}.png 2x`}
          alt={`${cleanId} Flag`}
          className="w-full h-full object-cover rounded-[inherit] transition-opacity duration-200"
          onError={() => setHasError(true)}
          referrerPolicy="no-referrer"
        />
      ) : emoji ? (
        <span className={`leading-none transform scale-110 translate-y-[-1px] select-none ${sizeClasses[size]}`}>
          {emoji}
        </span>
      ) : (
        <span className="font-mono text-[9px] font-black text-neutral-500 uppercase tracking-tighter">
          {fallback}
        </span>
      )}
    </div>
  );
}
