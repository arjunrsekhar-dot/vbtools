"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export function ScreenshotSlider({ name, screenshots }: { name: string; screenshots: string[] }) {
  const [active, setActive] = useState(0);
  const total = screenshots.length;
  const hasPrevious = active > 0;
  const hasNext = active < total - 1;

  function move(direction: -1 | 1) {
    setActive((current) => Math.min(Math.max(current + direction, 0), total - 1));
  }

  return (
    <div
      className="tool-screenshot-slider"
      aria-label={`${name} screenshots`}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" && hasPrevious) move(-1);
        if (event.key === "ArrowRight" && hasNext) move(1);
      }}
    >
      <div className="screenshot-track">
        {screenshots.map((url, index) => (
          <figure className={`screenshot-slide ${index === active ? "active" : ""}`} key={`${url}-${index}`}>
            <Image
              src={url}
              alt={`${name} screenshot ${index + 1}`}
              fill
              priority={index === 0}
              sizes="(max-width: 900px) 100vw, 760px"
            />
          </figure>
        ))}
      </div>
      {total > 1 && (
        <>
          {hasPrevious && (
            <button className="screenshot-nav previous" type="button" onClick={() => move(-1)} aria-label="Previous screenshot">
              <ChevronLeft size={18} />
            </button>
          )}
          {hasNext && (
            <button className="screenshot-nav next" type="button" onClick={() => move(1)} aria-label="Next screenshot">
              <ChevronRight size={18} />
            </button>
          )}
          <div className="screenshot-dots" aria-label="Select screenshot">
            {screenshots.map((url, index) => (
              <button
                key={`${url}-${index}`}
                type="button"
                className={index === active ? "active" : ""}
                onClick={() => setActive(index)}
                aria-label={`Show screenshot ${index + 1}`}
                aria-current={index === active}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
