"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function isInternalNavigation(element: HTMLAnchorElement) {
  if (element.target && element.target !== "_self") return false;
  if (element.hasAttribute("download")) return false;
  const href = element.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  const url = new URL(href, window.location.href);
  return url.origin === window.location.origin && url.href !== window.location.href;
}

export function PageLoadingIndicator() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setLoading(false);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
  }, [pathname]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest("a") : null;
      if (target instanceof HTMLAnchorElement && isInternalNavigation(target)) {
        setLoading(true);
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => setLoading(false), 8000);
      }
    }

    function handlePageShow() {
      setLoading(false);
    }

    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("click", handleClick, true);
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  return (
    <div className={`route-loading ${loading ? "is-visible" : ""}`} aria-hidden={!loading}>
      <span />
    </div>
  );
}
