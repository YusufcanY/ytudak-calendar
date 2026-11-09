import type { EventType } from "@/types";

export interface EventColorConfig {
  className: string;
  borderClass: string;
  dot: string;
  label: string;
}

const colorMap: Record<EventType, EventColorConfig> = {
  Teorik: {
    className: "ev-teorik",
    borderClass: "ev-teorik-border",
    dot: "#2b74b8",
    label: "Teorik",
  },
  Pratik: {
    className: "ev-pratik",
    borderClass: "ev-pratik-border",
    dot: "#1f8f5c",
    label: "Pratik",
  },
  "Konaklamalı Pratik": {
    className: "ev-kamp",
    borderClass: "ev-kamp-border",
    dot: "#7b4fc9",
    label: "Konaklamalı Pratik",
  },
  Sınav: {
    className: "ev-sinav",
    borderClass: "ev-sinav-border",
    dot: "#b83c3c",
    label: "Sınav",
  },
  Sohbet: {
    className: "ev-sohbet",
    borderClass: "ev-sohbet-border",
    dot: "#c97a00",
    label: "Sohbet",
  },
  Sunum: {
    className: "ev-sunum",
    borderClass: "ev-sunum-border",
    dot: "#1f8aaa",
    label: "Sunum",
  },
};

export function getEventColors(type: EventType): EventColorConfig {
  return colorMap[type] ?? colorMap["Teorik"];
}

export { colorMap };
