"use client";

import { useState, useRef, useEffect } from "react";
import type { YtudakEvent } from "@/types";
import { getEventColors } from "@/lib/eventColors";
import { TURKISH_MONTHS } from "@/lib/calendar";

interface SearchInputProps {
  events: YtudakEvent[];
  onSelect: (event: YtudakEvent) => void;
}

function formatDateShort(event: YtudakEvent): string {
  if (!event.startDate) return event.approxDate ?? "—";
  const [, m, d] = event.startDate.split("-").map(Number);
  return `${d} ${TURKISH_MONTHS[m - 1]}`;
}

export function SearchInput({ events, onSelect }: SearchInputProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = query.trim()
    ? events
        .filter((e) => {
          const q = query.trim().toLocaleLowerCase("tr");
          return (
            e.name.toLocaleLowerCase("tr").includes(q) ||
            (e.location?.toLocaleLowerCase("tr").includes(q) ?? false)
          );
        })
        .slice(0, 8)
    : [];

  const showDropdown = open && results.length > 0;

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  function handleSelect(event: YtudakEvent) {
    onSelect(event);
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      {/* Input box */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "0 12px",
          height: "36px",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: showDropdown ? "8px 8px 0 0" : "8px",
          borderBottomColor: showDropdown
            ? "var(--border-dim)"
            : "var(--border)",
          transition: "border-radius 0.1s",
        }}
      >
        <span
          style={{
            color: "var(--text-dim)",
            fontSize: "32px",
            lineHeight: 1,
            flexShrink: 0,
            marginTop: "-4px",
            marginLeft: "-4px",
          }}
        >
          ⌕
        </span>
        <input
          type="text"
          placeholder="Ara…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query.trim() && setOpen(true)}
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--text-primary)",
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            width: "100%",
          }}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-dim)",
              cursor: "pointer",
              fontSize: "12px",
              lineHeight: 1,
              padding: 0,
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: "auto",
            left: 0,
            width: "100%",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderTop: "none",
            borderRadius: "0 0 8px 8px",
            zIndex: 50,
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          }}
        >
          {results.map((event, i) => {
            const colors = getEventColors(event.type);
            return (
              <button
                key={event.id}
                onClick={() => handleSelect(event)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                  padding: "9px 12px",
                  background: "transparent",
                  border: "none",
                  borderTop: i > 0 ? "1px solid var(--border-dim)" : "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "var(--bg-cell-hover)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "transparent";
                }}
              >
                {/* Color dot */}
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: colors.dot,
                    flexShrink: 0,
                  }}
                />

                {/* Name */}
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "13px",
                    color: "var(--text-primary)",
                    flex: 1,
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {event.name}
                </span>

                {/* Campus */}
                {event.campus && (
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      color: "var(--accent)",
                      flexShrink: 0,
                    }}
                  >
                    {event.campus}
                  </span>
                )}

                {/* Date */}
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    color: "var(--text-dim)",
                    flexShrink: 0,
                  }}
                >
                  {formatDateShort(event)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
