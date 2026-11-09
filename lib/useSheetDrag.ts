"use client";

import { useEffect, useRef } from "react";

const MOBILE_QUERY = "(max-width: 639px)";
const CLOSE_DISTANCE_RATIO = 0.25; // of sheet height
const CLOSE_VELOCITY = 0.5; // px per ms

/**
 * Bottom-sheet behavior for mobile: locks page scroll while mounted and lets
 * the user drag the sheet down to dismiss it (when its content is scrolled to
 * the top). Returns a ref to attach to the sheet element.
 */
export function useSheetDrag<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Lock background scroll so touches on the sheet don't scroll the page.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia(MOBILE_QUERY);

    let tracking = false;
    let dragging = false;
    let startY = 0;
    let startTime = 0;
    let dy = 0;

    const onStart = (e: TouchEvent) => {
      if (!mq.matches || e.touches.length !== 1) return;
      tracking = true;
      dragging = false;
      dy = 0;
      startY = e.touches[0].clientY;
      startTime = e.timeStamp;
    };

    const onMove = (e: TouchEvent) => {
      if (!tracking) return;
      const y = e.touches[0].clientY;
      if (!dragging) {
        // Only start a drag when pulling down with the content at the top;
        // otherwise let the sheet's own content scroll normally.
        if (y - startY > 0 && el.scrollTop <= 0) {
          dragging = true;
          startY = y;
          startTime = e.timeStamp;
          el.style.transition = "none";
        } else {
          tracking = false;
          return;
        }
      }
      e.preventDefault();
      dy = Math.max(0, y - startY);
      el.style.transform = `translateY(${dy}px)`;
    };

    const onEnd = (e: TouchEvent) => {
      if (!dragging) {
        tracking = false;
        return;
      }
      tracking = false;
      dragging = false;
      const velocity = dy / Math.max(1, e.timeStamp - startTime);
      el.style.transition = "transform 0.2s ease";
      if (dy > el.offsetHeight * CLOSE_DISTANCE_RATIO || velocity > CLOSE_VELOCITY) {
        el.style.transform = "translateY(100%)";
        el.addEventListener("transitionend", () => onCloseRef.current(), {
          once: true,
        });
      } else {
        el.style.transform = "";
      }
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, []);

  return ref;
}
