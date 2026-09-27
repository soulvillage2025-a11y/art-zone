import React from "react";
import type { Finish } from "@/lib/telopinto";
import type { View } from "./BudaSvg";

export type RealisticBudaProps = {
  view: View;
  colors: Record<string, string>;
  finishes?: Record<string, Finish> | undefined;
  activeZone?: string | null | undefined;
  onZoneClick?: ((zone: string) => void) | undefined;
  className?: string | undefined;
};

// Check if a color is the original marble tone
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
  const imageSrc =
    view === "frontal"
      ? "/images/buda-bendicion-blanco.jpg"
      : "/images/buda-bendicion-lateral.jpg";

  // Coordinates and contours for 1024x1024 viewBox
  const frontalPaths = {
    // Rizos del cabello y Ushnisha cónico
    rizos:
      "M 512 18 C 524 32 536 52 538 74 C 568 82 594 105 608 138 C 615 156 612 180 598 184 C 576 168 546 150 512 150 C 478 150 448 168 426 184 C 412 180 409 156 416 138 C 430 105 456 82 486 74 C 488 52 500 32 512 18 Z",
    // Rostro, orejas, cuello, pecho descubierto, brazo en Abhaya Mudra, mano en regazo y pies
    piel:
      // Rostro y cuello
      "M 426 184 C 448 168 478 150 512 150 C 546 150 576 168 598 184 C 614 210 614 270 584 316 C 554 336 470 336 440 316 C 410 270 410 210 426 184 Z " +
      // Hombro derecho, pecho descubierto y brazo alzado
      "M 440 328 C 420 348 375 365 324 382 C 300 410 280 470 282 560 C 284 610 295 645 320 655 C 345 660 380 620 415 580 C 440 550 460 510 472 450 C 478 430 488 430 492 450 C 500 500 495 550 485 580 C 475 610 455 645 440 665 C 475 615 500 520 506 430 C 510 395 490 365 440 328 Z " +
      // Mano izquierda en el regazo
      "M 410 710 C 470 690 550 690 625 720 C 635 735 625 755 605 762 C 545 765 465 760 410 735 C 400 725 402 715 410 710 Z " +
      // Pies en loto
      "M 500 780 C 560 760 640 755 700 775 C 720 790 710 820 685 832 C 630 840 550 840 505 815 C 495 800 495 788 500 780 Z M 300 885 C 335 870 375 870 395 890 C 400 910 385 930 360 935 C 330 935 305 915 300 885 Z",
    // Collar de perlas y dije floral
    collar:
      "M 440 324 C 470 366 554 366 584 328 C 588 344 582 356 574 362 C 542 392 482 392 450 358 C 442 348 438 336 440 324 Z M 512 378 C 526 378 534 388 534 398 C 534 408 526 418 512 418 C 498 418 490 408 490 398 C 490 388 498 378 512 378 Z",
    // Manto kasaya superior e inferior
    manto:
      // Túnica hombro izquierdo y manga
      "M 584 328 C 630 355 675 370 712 395 C 728 440 735 520 726 620 C 720 660 705 690 670 710 C 640 715 620 690 610 650 C 600 600 595 540 575 480 C 560 435 545 400 515 385 C 545 355 570 340 584 328 Z " +
      // Túnica inferior piernas y base
      "M 145 840 C 135 770 175 700 240 660 C 290 630 350 640 400 665 C 440 685 450 710 440 735 C 385 760 305 790 280 830 C 260 865 255 910 260 945 C 320 955 450 955 512 955 C 620 955 720 955 780 945 C 795 910 820 860 845 840 C 855 830 855 850 845 865 C 825 905 790 945 740 960 C 660 970 360 970 280 960 C 200 945 150 900 145 840 Z",
  };

  const lateralPaths = {
    rizos:
      "M 490 22 C 504 36 515 54 518 76 C 545 86 565 110 572 140 C 576 160 570 180 555 186 C 535 170 510 155 480 155 C 450 155 430 170 415 186 C 405 180 402 160 408 140 C 420 110 445 86 470 76 C 475 54 482 36 490 22 Z",
    piel:
      "M 415 186 C 430 170 450 155 480 155 C 510 155 535 170 555 186 C 565 215 560 270 535 316 C 510 336 450 336 425 316 C 405 270 405 215 415 186 Z " +
      "M 425 328 C 405 348 375 375 330 400 C 310 430 300 480 305 560 C 310 610 320 645 345 655 C 370 660 400 620 430 580 C 450 550 465 510 472 450 C 478 430 485 430 488 450 C 495 500 490 550 480 580 C 470 610 450 645 435 665 C 465 615 490 520 495 430 C 500 395 480 365 425 328 Z " +
      "M 400 710 C 450 690 520 690 580 720 C 590 735 580 755 560 762 C 510 765 440 760 400 735 Z",
    collar:
      "M 430 324 C 455 366 525 366 550 328 C 554 344 548 356 542 362 C 515 392 465 392 438 358 C 432 348 428 336 430 324 Z M 490 378 C 502 378 510 388 510 398 C 510 408 502 418 490 418 C 478 418 470 408 470 398 C 470 388 478 378 490 378 Z",
    manto:
      "M 550 328 C 590 355 630 370 660 395 C 675 440 680 520 672 620 C 665 660 650 690 620 710 C 595 715 580 690 570 650 C 560 600 555 540 540 480 C 530 435 515 400 490 385 C 515 355 538 340 550 328 Z " +
      "M 160 840 C 150 770 190 700 250 660 C 295 630 350 640 395 665 C 430 685 440 710 430 735 C 380 760 310 790 285 830 C 265 865 260 910 265 945 C 320 955 440 955 490 955 C 590 955 680 955 740 945 C 755 910 775 860 795 840 C 805 830 805 850 795 865 C 775 905 745 945 700 960 C 630 970 350 970 280 960 C 210 945 165 900 160 840 Z",
  };

  const activePaths = view === "frontal" ? frontalPaths : lateralPaths;

  // Hotspots for interactive selector badges
  const hotspots: Record<string, { x: number; y: number; label: string }> =
    view === "frontal"
      ? {
          rizos: { x: 512, y: 110, label: "Rizos" },
          detalles: { x: 512, y: 180, label: "Urna" },
          collar: { x: 512, y: 396, label: "Collar" },
          piel: { x: 375, y: 490, label: "Piel" },
          manto: { x: 675, y: 550, label: "Manto" },
        }
      : {
          rizos: { x: 490, y: 110, label: "Rizos" },
          detalles: { x: 435, y: 195, label: "Urna" },
          collar: { x: 480, y: 360, label: "Collar" },
          piel: { x: 410, y: 490, label: "Piel" },
          manto: { x: 630, y: 560, label: "Manto" },
        };

  const renderZoneOverlay = (zoneKey: string, pathD: string) => {
    const rawColor = colors[zoneKey];
    const isDefault = isDefaultMarbleColor(zoneKey, rawColor);
    const finish = finishes[zoneKey] ?? "Original";
    const isActive = activeZone === zoneKey;

    const fillColor = rawColor || "#EFEDE7";
    // Check if color is dark for optimal multiply opacity
    const isDark =
      fillColor.toLowerCase() === "#161616" ||
      fillColor.toLowerCase() === "#12284c" ||
      fillColor.toLowerCase() === "#281b18";

    return (
      <g
        key={zoneKey}
        className={interactive ? "cursor-pointer" : undefined}
        onClick={interactive ? () => onZoneClick?.(zoneKey) : undefined}
      >
        {/* Tint overlay with multiply blend mode: stains the realistic marble photograph */}
        {!isDefault && (
          <path
            d={pathD}
            fill={fillColor}
            style={{ mixBlendMode: "multiply" }}
            opacity={isDark ? 0.92 : 0.82}
            className="transition-all duration-300"
          />
        )}

        {/* Gloss finish overlay */}
        {!isDefault && finish === "Brillante" && (
          <path
            d={pathD}
            fill="url(#buda-gloss-shine)"
            style={{ mixBlendMode: "screen" }}
            opacity={0.35}
            pointerEvents="none"
          />
        )}

        {/* Metallic finish overlay */}
        {!isDefault && finish === "Metálico" && (
          <path
            d={pathD}
            fill="url(#buda-metal-specular)"
            style={{ mixBlendMode: "overlay" }}
            opacity={0.45}
            pointerEvents="none"
          />
        )}

        {/* Active Zone Animated Outline & Glow */}
        {isActive && (
          <path
            d={pathD}
            fill="none"
            stroke="#2563EB"
            strokeWidth={5}
            strokeDasharray="14 10"
            className="animate-pulse"
            opacity={0.95}
            filter="drop-shadow(0 0 8px rgba(37,99,235,0.7))"
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
      >
        <circle
          cx={view === "frontal" ? 512 : 435}
          cy={view === "frontal" ? 180 : 195}
          r={9}
          fill={colors["detalles"] || "#E7E3DA"}
          style={
            !isDefaultMarbleColor("detalles", colors["detalles"])
              ? { mixBlendMode: "multiply" }
              : undefined
          }
          className="transition-all duration-300"
        />
        {activeZone === "detalles" && (
          <circle
            cx={view === "frontal" ? 512 : 435}
            cy={view === "frontal" ? 180 : 195}
            r={16}
            fill="none"
            stroke="#2563EB"
            strokeWidth={4}
            strokeDasharray="6 4"
            className="animate-pulse"
            pointerEvents="none"
          />
        )}
      </g>

      {/* 3. Interactive Selector Hotspot Badges on the Sculpture */}
      {interactive && (
        <g className="select-none">
          {Object.entries(hotspots).map(([zoneKey, spot]) => {
            const isActive = activeZone === zoneKey;
            const currentColor = colors[zoneKey] || "#EFEDE7";
            return (
              <g
                key={zoneKey}
                className="cursor-pointer transition-transform duration-200 hover:scale-110"
                onClick={(e) => {
                  e.stopPropagation();
                  onZoneClick?.(zoneKey);
                }}
              >
                {/* Ping wave when active */}
                {isActive && (
                  <circle
                    cx={spot.x}
                    cy={spot.y}
                    r={24}
                    fill="#2563EB"
                    opacity={0.35}
                    className="animate-ping"
                  />
                )}

                {/* Outer badge ring */}
                <circle
                  cx={spot.x}
                  cy={spot.y}
                  r={16}
                  fill="#FFFFFF"
                  stroke={isActive ? "#2563EB" : "rgba(0,0,0,0.18)"}
                  strokeWidth={isActive ? 3.5 : 1.5}
                  filter="drop-shadow(0 2px 5px rgba(0,0,0,0.25))"
                />

                {/* Color swatch circle inside badge */}
                <circle
                  cx={spot.x}
                  cy={spot.y}
                  r={10}
                  fill={currentColor}
                  stroke="rgba(0,0,0,0.15)"
                  strokeWidth={1}
                />

                {/* Floating pill with zone name */}
                <g transform={`translate(${spot.x + 22}, ${spot.y - 13})`}>
                  <rect
                    rx={6}
                    ry={6}
                    width={spot.label.length * 8 + 18}
                    height={26}
                    fill={isActive ? "#1E293B" : "rgba(255,255,255,0.92)"}
                    stroke={isActive ? "#2563EB" : "rgba(0,0,0,0.14)"}
                    strokeWidth={isActive ? 1.5 : 1}
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
                  />
                  <text
                    x={9}
                    y={17}
                    fontSize={12}
                    fontWeight={isActive ? "700" : "600"}
                    fill={isActive ? "#FFFFFF" : "#1E293B"}
                    fontFamily="system-ui, sans-serif"
                    letterSpacing="0.2px"
                  >
                    {spot.label}
                  </text>
                </g>
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
}
