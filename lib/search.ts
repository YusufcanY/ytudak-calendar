import type { YtudakEvent } from "@/types";

const FOLD_MAP: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  ö: "o",
  ş: "s",
  ü: "u",
  â: "a",
  î: "i",
  û: "u",
};

/**
 * Lowercases (Turkish rules) and strips Turkish diacritics so "tanisma"
 * matches "Tanışma". Keeps string length, so indexes map back to the original.
 */
export function fold(s: string): string {
  return s
    .toLocaleLowerCase("tr")
    .replace(/[çğıöşüâîû]/g, (c) => FOLD_MAP[c]);
}

export interface MatchRange {
  start: number;
  end: number;
}

export interface SearchResult {
  event: YtudakEvent;
  /** Ranges in event.name to highlight. */
  ranges: MatchRange[];
}

/** Start indexes of each word in a folded string. */
function wordStarts(folded: string): number[] {
  const starts: number[] = [];
  for (let i = 0; i < folded.length; i++) {
    const isWordChar = /[a-z0-9]/.test(folded[i]);
    const prevIsWordChar = i > 0 && /[a-z0-9]/.test(folded[i - 1]);
    if (isWordChar && !prevIsWordChar) starts.push(i);
  }
  return starts;
}

/**
 * Finds where each token matches in the name. Returns null if any token
 * misses. With `prefixOnly`, tokens must match the start of a word.
 */
function matchName(
  name: string,
  tokens: string[],
  prefixOnly: boolean,
): { ranges: MatchRange[]; score: number } | null {
  const folded = fold(name);
  const starts = wordStarts(folded);
  const ranges: MatchRange[] = [];
  let score = 0;

  for (const token of tokens) {
    const prefixAt = starts.find((s) => folded.startsWith(token, s));
    if (prefixAt !== undefined) {
      ranges.push({ start: prefixAt, end: prefixAt + token.length });
      score += prefixAt === 0 ? 3 : 2;
      continue;
    }
    if (prefixOnly) return null;
    const at = folded.indexOf(token);
    if (at === -1) return null;
    ranges.push({ start: at, end: at + token.length });
    score += 1;
  }
  return { ranges: mergeRanges(ranges), score };
}

function mergeRanges(ranges: MatchRange[]): MatchRange[] {
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const merged: MatchRange[] = [];
  for (const r of sorted) {
    const last = merged[merged.length - 1];
    if (last && r.start <= last.end) last.end = Math.max(last.end, r.end);
    else merged.push({ ...r });
  }
  return merged;
}

/**
 * Searches event names only (not locations): every query word must match the
 * start of a word in the name; if nothing matches that way, falls back to
 * matching anywhere in the name. Best matches first, then by date.
 */
export function searchEvents(
  events: YtudakEvent[],
  query: string,
  limit = 20,
): SearchResult[] {
  const tokens = fold(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const run = (prefixOnly: boolean) =>
    events
      .map((event) => {
        const m = matchName(event.name, tokens, prefixOnly);
        return m && { event, ranges: m.ranges, score: m.score };
      })
      .filter((r): r is SearchResult & { score: number } => r !== null);

  let matches = run(true);
  if (matches.length === 0) matches = run(false);

  return matches
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const da = a.event.startDate ?? "9999";
      const db = b.event.startDate ?? "9999";
      return da.localeCompare(db);
    })
    .slice(0, limit)
    .map(({ event, ranges }) => ({ event, ranges }));
}
