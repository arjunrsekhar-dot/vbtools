"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";

const DARK_LOGO_BG = "#10251d";
const LIGHT_LOGO_BG = "#f7faf5";

function getHexLuminance(color: string) {
  const hex = color.replace("#", "");
  if (!/^[0-9a-f]{3}$|^[0-9a-f]{6}$/i.test(hex)) return 0;
  const normalized = hex.length === 3 ? hex.split("").map((char) => char + char).join("") : hex;
  const [r, g, b] = [0, 2, 4].map((start) => parseInt(normalized.slice(start, start + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getImageLuminance(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  const size = 48;
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;

  context.clearRect(0, 0, size, size);
  context.drawImage(image, 0, 0, size, size);

  const { data } = context.getImageData(0, 0, size, size);
  let luminanceTotal = 0;
  let visiblePixels = 0;

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3] / 255;
    if (alpha < 0.1) continue;

    luminanceTotal += ((0.2126 * data[index]) + (0.7152 * data[index + 1]) + (0.0722 * data[index + 2])) / 255 * alpha;
    visiblePixels += alpha;
  }

  return visiblePixels > 0 ? luminanceTotal / visiblePixels : null;
}

export function ToolLogo({
  name,
  logo,
  logoColor,
  logoUrl,
  className = ""
}: {
  name: string;
  logo: string;
  logoColor: string;
  logoUrl?: string;
  className?: string;
}) {
  const fallbackLogoIsLight = getHexLuminance(logoColor) > 0.62;
  const [imageLogoIsLight, setImageLogoIsLight] = useState<boolean | null>(null);
  const logoIsLight = logoUrl ? imageLogoIsLight ?? fallbackLogoIsLight : fallbackLogoIsLight;
  const background = logoUrl ? (logoIsLight ? DARK_LOGO_BG : LIGHT_LOGO_BG) : logoColor;
  const textColor = fallbackLogoIsLight ? "#151515" : "#fff";

  return (
    <div className={`tool-logo ${className}`.trim()} style={{ background }}>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={`${name} logo`}
          className="tool-logo-image"
          loading="lazy"
          decoding="async"
          onLoad={(event) => {
            try {
              const luminance = getImageLuminance(event.currentTarget);
              if (luminance !== null) setImageLogoIsLight(luminance > 0.62);
            } catch {
              setImageLogoIsLight(fallbackLogoIsLight);
            }
          }}
        />
      ) : (
        <span style={{ color: textColor }}>{logo}</span>
      )}
    </div>
  );
}
