"use client";

import { useState, useRef, useEffect, useId } from "react";
import type { YtudakEvent } from "@/types";
import { getEventColors } from "@/lib/eventColors";
import { TURKISH_MONTHS } from "@/lib/calendar";
import { searchEvents, type MatchRange } from "@/lib/search";

interface SearchInputProps {
  events: YtudakEvent[];
  onSelect: (event: YtudakEvent) => void;
}

function formatDateShort(event: YtudakEvent): string {
  if (!event.startDate) return event.approxDate ?? "—";
  const [, m, d] = event.startDate.split("-").map(Number);
  return `${d} ${TURKISH_MONTHS[m - 1]}`;
}

function Highlighted({ text, ranges }: { text: string; ranges: MatchRange[] }) {
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  ranges.forEach((r, i) => {
    if (r.start > cursor) parts.push(text.slice(cursor, r.start));
    parts.push(
      <mark
        key={i}
        style={{
          background: "var(--accent-dim)",
          color: "inherit",
          fontWeight: 600,
          borderRadius: "2px",
        }}
      >
        {text.slice(r.start, r.end)}
      </mark>,
    );
    cursor = r.end;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}

export function SearchInput({ events, onSelect }: SearchInputProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const hasQuery = query.trim().length > 0;
  const results = searchEvents(events, query);
  const showDropdown = open && hasQuery;
  const active = Math.min(activeIndex, Math.max(results.length - 1, 0));

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
    inputRef.current?.blur();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!showDropdown || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((active + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((active - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(results[active].event);
    }
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
          ref={inputRef}
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          role="combobox"
          aria-label="Etkinlik ara"
          aria-expanded={showDropdown}
          aria-controls={listId}
          aria-activedescendant={
            showDropdown && results.length > 0
              ? `${listId}-${active}`
              : undefined
          }
          placeholder="Etkinlik ara…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onFocus={() => hasQuery && setOpen(true)}
          onKeyDown={handleKeyDown}
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--text-primary)",
            fontFamily: "var(--font-body)",
            // 16px prevents iOS Safari from zooming in on focus.
            fontSize: "16px",
            width: "100%",
          }}
        />
        {query && (
          <button
            type="button"
            aria-label="Aramayı temizle"
            onClick={() => {
              setQuery("");
              setOpen(false);
              inputRef.current?.focus();
            }}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-dim)",
              cursor: "pointer",
              fontSize: "14px",
              lineHeight: 1,
              padding: "8px",
              margin: "-8px",
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
          id={listId}
          role="listbox"
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
            maxHeight: "min(60vh, 420px)",
            overflowY: "auto",
            overscrollBehavior: "contain",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          }}
        >
          {results.length === 0 && (
            <div
              style={{
                padding: "12px",
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                color: "var(--text-muted)",
              }}
            >
              “{query.trim()}” için sonuç yok
            </div>
          )}
          {results.map(({ event, ranges }, i) => {
            const colors = getEventColors(event.type);
            return (
              <button
                key={event.id}
                id={`${listId}-${i}`}
                type="button"
                role="option"
                aria-selected={i === active}
                onClick={() => handleSelect(event)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                  padding: "11px 12px",
                  background:
                    i === active ? "var(--bg-cell-hover)" : "transparent",
                  border: "none",
                  borderTop: i > 0 ? "1px solid var(--border-dim)" : "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.1s",
                }}
                onMouseEnter={() => setActiveIndex(i)}
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
                    fontSize: "14px",
                    color: "var(--text-primary)",
                    flex: 1,
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Highlighted text={event.name} ranges={ranges} />
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
