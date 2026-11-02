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

export function RealisticBudaBendicion({
  view,
  colors,
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

  // Calibrated hotspots placed precisely over anatomical landmarks
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
          rizos: { x: 508, y: 90, label: "Rizos", labelPlacement: "right" },
          detalles: { x: 508, y: 175, label: "Detalles", labelPlacement: "right" },
          collar: { x: 508, y: 368, label: "Collar", labelPlacement: "right" },
          piel: { x: 345, y: 440, label: "Piel", labelPlacement: "left" },
          manto: { x: 665, y: 485, label: "Manto", labelPlacement: "right" },
        }
      : {
          rizos: { x: 550, y: 95, label: "Rizos", labelPlacement: "right" },
          detalles: { x: 458, y: 198, label: "Detalles", labelPlacement: "right" },
          collar: { x: 482, y: 360, label: "Collar", labelPlacement: "right" },
          piel: { x: 390, y: 440, label: "Piel", labelPlacement: "left" },
          manto: { x: 640, y: 480, label: "Manto", labelPlacement: "right" },
        };

  const urnaCoords =
    view === "frontal" ? { cx: 508, cy: 175 } : { cx: 458, cy: 198 };

  // Transparent Interactive Hit Target: allows clicking on the sculpture to select the zone
  const renderZoneInteraction = (zoneKey: string, pathD: string) => {
    if (!pathD) return null;

    return (
      <path
        key={`interactive-${zoneKey}`}
        d={pathD}
        fill="transparent"
        pointerEvents="all"
        className={interactive ? "cursor-pointer" : undefined}
        onClick={interactive ? () => onZoneClick?.(zoneKey) : undefined}
        onMouseEnter={interactive ? () => setHoveredZone(zoneKey) : undefined}
        onMouseLeave={interactive ? () => setHoveredZone(null) : undefined}
      />
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
        {/* Sculpture silhouette clip path to keep hit areas bounded inside marble stone */}
        <clipPath id={`buda-statue-clip-${view}`}>
          <path d={activePaths.silhouette} />
        </clipPath>
      </defs>

      {/* 1. Base High-Definition Sculpture Photograph (kept clean and natural without color washes) */}
      <image
        href={imageSrc}
        x="0"
        y="0"
        width="1024"
        height="1024"
        preserveAspectRatio="xMidYMid meet"
      />

      {/* 2. Transparent Interactive Hit Areas (clean interaction without color overlays or shading) */}
      <g clipPath={`url(#buda-statue-clip-${view})`}>
        {renderZoneInteraction("manto", activePaths.manto)}
        {renderZoneInteraction("piel", activePaths.piel)}
        {renderZoneInteraction("collar", activePaths.collar)}
        {renderZoneInteraction("rizos", activePaths.rizos)}
        {renderZoneInteraction("detalles", activePaths.detalles)}
      </g>

      {/* Forehead Urna Interactive */}
      <circle
        cx={urnaCoords.cx}
        cy={urnaCoords.cy}
        r={14}
        fill="transparent"
        pointerEvents="all"
        className={interactive ? "cursor-pointer" : undefined}
        onClick={interactive ? () => onZoneClick?.("detalles") : undefined}
        onMouseEnter={interactive ? () => setHoveredZone("detalles") : undefined}
        onMouseLeave={interactive ? () => setHoveredZone(null) : undefined}
      />

      {/* 3. Interactive Minimalist Hotpoints: glowing bright green when selected */}
      {interactive && (
        <g className="select-none">
          {Object.entries(hotspots).map(([zoneKey, spot]) => {
            const isActive = activeZone === zoneKey;
            const isHovered = hoveredZone === zoneKey;
            const showLabel = isActive || isHovered;
            const rawColor = colors[zoneKey];
            const currentColor = rawColor || "#EFEDE7";
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
                {/* Outer badge ring: turns radiant bright green when selected */}
                <circle
                  cx={spot.x}
                  cy={spot.y}
                  r={isActive ? 13 : 10.5}
                  fill={isActive ? "#22C55E" : "#FFFFFF"}
                  stroke={isActive ? "#FFFFFF" : isHovered ? "#22C55E" : "rgba(0,0,0,0.22)"}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  filter={
                    isActive
                      ? "drop-shadow(0 0 10px rgba(34, 197, 94, 0.85)) drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
                      : "drop-shadow(0 2px 5px rgba(0,0,0,0.28))"
                  }
                  className="transition-all duration-200"
                />

                {/* Center dot inside badge: white core dot when active, color swatch when inactive */}
                <circle
                  cx={spot.x}
                  cy={spot.y}
                  r={isActive ? 5 : 6}
                  fill={isActive ? "#FFFFFF" : currentColor}
                  stroke={isActive ? "none" : "rgba(0,0,0,0.18)"}
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
                    className="transition-opacity duration-200 pointer-events-none"
                  >
                    <rect
                      rx={6}
                      ry={6}
                      width={labelWidth}
                      height={24}
                      fill={isActive ? "#0F172A" : "rgba(255,255,255,0.96)"}
                      stroke={isActive ? "#22C55E" : "rgba(0,0,0,0.18)"}
                      strokeWidth={2}
                      filter="drop-shadow(0 2px 6px rgba(0,0,0,0.2))"
                    />
                    <text
                      x={9}
                      y={16}
                      fontSize={11}
                      fontWeight={isActive ? "700" : "600"}
                      fill={isActive ? "#4ADE80" : "#1E293B"}
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
