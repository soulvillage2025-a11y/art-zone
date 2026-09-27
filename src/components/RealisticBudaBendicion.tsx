import React, { useState } from "react";
import type { Finish } from "@/lib/telopinto";
import type { View } from "./BudaSvg";
import { frontalPaths, lateralPaths } from "./realisticBudaPaths";

export type RealisticBudaProps = {
  view: View;
  colors: Record<string, string>;
  finishes?: Record<string, Finish> | undefined;
  activeZone?: string | null | undefined;
  onZoneClick?: ((zone: string) => void) | undefined;
  className?: string | undefined;
};

// Check if a color is the original white marble tone
function isDefaultMarbleColor(zone: string, hex?: string) {
  if (!hex) return true;
  const h = hex.toLowerCase();
  const defaults: Record<string, string> = {
    manto: "#ede9e3",
    piel: "#f5f3ef",
    rizos: "#dad5ca",
    collar: "#fdfcfb",
    detalles: "#e7e3da",
  };
  return (
    h === defaults[zone] ||
    h === "#ffffff" ||
    h === "#f3f1ec" ||
    h === "#efede7" ||
    h === "#e2ded4"
  );
}

export function RealisticBudaBendicion({
  view,
  colors,
  finishes = {},
  activeZone,
  onZoneClick,
  className,
}: RealisticBudaProps) {
  const interactive = Boolean(onZoneClick);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const imageSrc =
    view === "frontal"
      ? "/images/buda-bendicion-blanco.jpg"
      : "/images/buda-bendicion-lateral.jpg";

  const activePaths = view === "frontal" ? frontalPaths : lateralPaths;

  // Elegantly positioned hotspots that never obscure the Buddha's serene face or central features
  const hotspots: Record<
    string,
    {
      x: number;
      y: number;
      label: string;
      labelPlacement: "left" | "right";
    }
  > =
    view === "frontal"
      ? {
          rizos: { x: 508, y: 75, label: "Rizos", labelPlacement: "right" },
          detalles: { x: 508, y: 175, label: "Urna", labelPlacement: "right" },
          collar: { x: 508, y: 385, label: "Collar", labelPlacement: "right" },
          piel: { x: 350, y: 450, label: "Piel", labelPlacement: "left" },
          manto: { x: 665, y: 500, label: "Manto", labelPlacement: "right" },
        }
      : {
          rizos: { x: 540, y: 75, label: "Rizos", labelPlacement: "right" },
          detalles: { x: 435, y: 185, label: "Urna", labelPlacement: "right" },
          collar: { x: 480, y: 360, label: "Collar", labelPlacement: "right" },
          piel: { x: 360, y: 460, label: "Piel", labelPlacement: "left" },
          manto: { x: 650, y: 520, label: "Manto", labelPlacement: "right" },
        };

  const renderZoneOverlay = (zoneKey: string, pathD: string) => {
    const rawColor = colors[zoneKey];
    const isDefault = isDefaultMarbleColor(zoneKey, rawColor);
    const finish = finishes[zoneKey] ?? "Original";

    const fillColor = rawColor || "#EFEDE7";
    const isDark =
      fillColor.toLowerCase() === "#161616" ||
      fillColor.toLowerCase() === "#12284c" ||
      fillColor.toLowerCase() === "#281b18" ||
      fillColor.toLowerCase() === "#1f2937";

    return (
      <g
        key={zoneKey}
        className={interactive ? "cursor-pointer" : undefined}
        onClick={interactive ? () => onZoneClick?.(zoneKey) : undefined}
        onMouseEnter={interactive ? () => setHoveredZone(zoneKey) : undefined}
        onMouseLeave={interactive ? () => setHoveredZone(null) : undefined}
      >
        {/* Color tint: 'color' blend mode preserves marble luminance, relief shadows & engravings */}
        {!isDefault && (
          <path
            d={pathD}
            fill={fillColor}
            style={{ mixBlendMode: isDark ? "multiply" : "color" }}
            opacity={isDark ? 0.88 : 0.86}
            className="transition-all duration-300"
          />
        )}

        {/* Gloss finish specular overlay */}
        {!isDefault && finish === "Brillante" && (
          <path
            d={pathD}
            fill="url(#buda-gloss-shine)"
            style={{ mixBlendMode: "screen" }}
            opacity={0.32}
            pointerEvents="none"
          />
        )}

        {/* Metallic finish overlay */}
        {!isDefault && finish === "Metálico" && (
          <path
            d={pathD}
            fill="url(#buda-metal-specular)"
            style={{ mixBlendMode: "overlay" }}
            opacity={0.42}
            pointerEvents="none"
          />
        )}
      </g>
    );
  };

  return (
    <svg
      viewBox="0 0 1024 1024"
      className={className}
      role="img"
      aria-label="Buda de la Bendición personalizado"
    >
      <defs>
        {/* Radial highlight for glossy lacquer */}
        <radialGradient id="buda-gloss-shine" cx="0.45" cy="0.35" r="0.75">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
        </radialGradient>

        {/* Specular gradient for metallic effect */}
        <linearGradient id="buda-metal-specular" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="25%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="60%" stopColor="#000000" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.65" />
        </linearGradient>
      </defs>

      {/* 1. Base High-Definition Sculpture Photograph */}
      <image
        href={imageSrc}
        x="0"
        y="0"
        width="1024"
        height="1024"
        preserveAspectRatio="xMidYMid meet"
      />

      {/* 2. Interactive SVG Tint & Mask Overlays */}
      {renderZoneOverlay("manto", activePaths.manto)}
      {renderZoneOverlay("piel", activePaths.piel)}
      {renderZoneOverlay("rizos", activePaths.rizos)}
      {renderZoneOverlay("collar", activePaths.collar)}

      {/* Detalles: Urna / Bindi en la frente */}
      <g
        className={interactive ? "cursor-pointer" : undefined}
        onClick={interactive ? () => onZoneClick?.("detalles") : undefined}
        onMouseEnter={interactive ? () => setHoveredZone("detalles") : undefined}
        onMouseLeave={interactive ? () => setHoveredZone(null) : undefined}
      >
        <circle
          cx={view === "frontal" ? 508 : 435}
          cy={view === "frontal" ? 175 : 185}
          r={7.5}
          fill={colors["detalles"] || "#E7E3DA"}
          style={
            !isDefaultMarbleColor("detalles", colors["detalles"])
              ? { mixBlendMode: "multiply" }
              : undefined
          }
          className="transition-all duration-300"
        />
      </g>

      {/* 3. Interactive Minimalist Hotpoints */}
      {interactive && (
        <g className="select-none">
          {Object.entries(hotspots).map(([zoneKey, spot]) => {
            const isActive = activeZone === zoneKey;
            const isHovered = hoveredZone === zoneKey;
            const showLabel = isActive || isHovered;
            const currentColor = colors[zoneKey] || "#EFEDE7";
            const labelWidth = spot.label.length * 8 + 18;

            return (
              <g
                key={zoneKey}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  onZoneClick?.(zoneKey);
                }}
                onMouseEnter={() => setHoveredZone(zoneKey)}
                onMouseLeave={() => setHoveredZone(null)}
              >
                {/* Ping wave when active */}
                {isActive && (
                  <circle
                    cx={spot.x}
                    cy={spot.y}
                    r={20}
                    fill="#2563EB"
                    opacity={0.35}
                    className="animate-ping"
                  />
                )}

                {/* Outer badge ring */}
                <circle
                  cx={spot.x}
                  cy={spot.y}
                  r={isActive ? 13 : 10.5}
                  fill="#FFFFFF"
                  stroke={isActive ? "#2563EB" : isHovered ? "#3B82F6" : "rgba(0,0,0,0.22)"}
                  strokeWidth={isActive ? 3 : 1.5}
                  filter="drop-shadow(0 2px 5px rgba(0,0,0,0.28))"
                  className="transition-all duration-200"
                />

                {/* Color swatch circle inside badge */}
                <circle
                  cx={spot.x}
                  cy={spot.y}
                  r={isActive ? 8 : 6}
                  fill={currentColor}
                  stroke="rgba(0,0,0,0.18)"
                  strokeWidth={1}
                  className="transition-all duration-200"
                />

                {/* Floating pill label: displayed on active or hover */}
                {showLabel && (
                  <g
                    transform={
                      spot.labelPlacement === "left"
                        ? `translate(${spot.x - labelWidth - 14}, ${spot.y - 12})`
                        : `translate(${spot.x + 16}, ${spot.y - 12})`
                    }
                    className="transition-opacity duration-200"
                  >
                    <rect
                      rx={6}
                      ry={6}
                      width={labelWidth}
                      height={24}
                      fill={isActive ? "#1E293B" : "rgba(255,255,255,0.96)"}
                      stroke={isActive ? "#2563EB" : "rgba(0,0,0,0.18)"}
                      strokeWidth={isActive ? 1.5 : 1}
                      filter="drop-shadow(0 2px 6px rgba(0,0,0,0.2))"
                    />
                    <text
                      x={9}
                      y={16}
                      fontSize={11}
                      fontWeight={isActive ? "700" : "600"}
                      fill={isActive ? "#FFFFFF" : "#1E293B"}
                      fontFamily="system-ui, sans-serif"
                      letterSpacing="0.2px"
                    >
                      {spot.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
}
