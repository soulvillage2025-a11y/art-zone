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

  // Precisely calibrated contours for 1024x1024 viewBox
  const frontalPaths = {
    // 1. Rizos del cabello y Ushnisha cónico
    rizos:
      "M 508 24 C 522 35 532 55 534 75 C 564 85 588 120 582 195 C 555 162 535 148 508 148 C 480 148 458 162 432 195 C 424 120 450 85 480 75 C 484 55 494 35 508 24 Z",

    // 2. Piel y Torso (Rostro, orejas, cuello, pecho derecho descubierto, brazo en Abhaya Mudra, mano en regazo con cuenco y pies)
    piel:
      // Rostro, orejas y cuello
      "M 432 195 C 458 162 480 148 508 148 C 535 148 555 162 582 195 C 592 225 588 280 582 295 C 572 315 540 332 508 332 C 476 332 444 315 434 295 C 428 280 424 225 432 195 Z " +
      // Hombro derecho, pecho descubierto y brazo alzado con mano en Abhaya Mudra
      "M 445 330 C 420 348 360 365 315 390 C 285 430 275 510 280 605 C 290 625 325 615 365 585 C 415 545 450 495 465 440 C 475 425 490 425 495 440 C 505 480 495 530 480 570 C 465 605 445 635 440 645 C 460 620 485 540 495 485 C 510 440 490 380 445 330 Z " +
      // Mano izquierda en el regazo con cuenco
      "M 460 670 C 490 655 530 655 560 670 C 585 685 580 725 550 735 C 510 740 470 735 455 715 C 450 695 455 680 460 670 Z " +
      // Pie derecho cruzado en loto
      "M 500 735 C 550 720 630 720 685 735 C 705 750 695 780 670 785 C 610 790 530 790 495 770 C 485 755 490 742 500 735 Z " +
      // Dedos del pie izquierdo visibles
      "M 315 865 C 345 850 380 855 390 875 C 395 895 375 905 345 905 C 320 900 310 885 315 865 Z",

    // 3. Collar de perlas y dije floral
    collar:
      "M 445 330 C 475 372 542 372 572 338 C 576 352 568 365 558 372 C 532 396 482 396 458 365 C 448 355 442 342 445 330 Z M 505 375 C 516 375 524 383 524 394 C 524 405 516 413 505 413 C 494 413 486 405 486 394 C 486 383 494 375 505 375 Z",

    // 4. Manto kasaya grabado (hombro izquierdo, manga y vestimenta inferior)
    manto:
      // Túnica hombro izquierdo y manga
      "M 572 338 C 610 355 660 370 695 390 C 725 435 730 520 720 640 C 710 675 690 705 655 715 C 630 715 605 690 595 650 C 585 600 580 540 565 480 C 550 435 535 400 505 394 C 535 365 560 348 572 338 Z " +
      // Túnica inferior piernas y base
      "M 155 835 C 145 765 185 695 250 655 C 300 625 360 635 410 660 C 445 680 450 705 440 730 C 385 755 305 785 280 825 C 260 860 255 905 260 945 C 320 955 450 955 508 955 C 620 955 720 955 760 945 C 785 910 815 860 835 835 C 845 825 845 845 835 860 C 815 900 780 940 730 955 C 650 965 360 965 280 955 C 200 940 155 895 155 835 Z",
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

  // Elegantly positioned selector callouts (cleanly placed outside to never obscure face or details)
  const hotspots: Record<
    string,
    {
      badgeX: number;
      badgeY: number;
      label: string;
      targetX: number;
      targetY: number;
    }
  > =
    view === "frontal"
      ? {
          rizos: {
            badgeX: 635,
            badgeY: 80,
            label: "Rizos",
            targetX: 535,
            targetY: 80,
          },
          detalles: {
            badgeX: 645,
            badgeY: 175,
            label: "Urna (Bindi)",
            targetX: 508,
            targetY: 175,
          },
          collar: {
            badgeX: 645,
            badgeY: 355,
            label: "Collar",
            targetX: 505,
            targetY: 392,
          },
          piel: {
            badgeX: 200,
            badgeY: 475,
            label: "Piel y Torso",
            targetX: 320,
            targetY: 460,
          },
          manto: {
            badgeX: 775,
            badgeY: 560,
            label: "Manto / Túnica",
            targetX: 685,
            targetY: 550,
          },
        }
      : {
          rizos: {
            badgeX: 630,
            badgeY: 85,
            label: "Rizos",
            targetX: 515,
            targetY: 85,
          },
          detalles: {
            badgeX: 600,
            badgeY: 185,
            label: "Urna",
            targetX: 435,
            targetY: 195,
          },
          collar: {
            badgeX: 620,
            badgeY: 360,
            label: "Collar",
            targetX: 485,
            targetY: 380,
          },
          piel: {
            badgeX: 215,
            badgeY: 480,
            label: "Piel y Torso",
            targetX: 340,
            targetY: 480,
          },
          manto: {
            badgeX: 770,
            badgeY: 560,
            label: "Manto / Túnica",
            targetX: 650,
            targetY: 560,
          },
        };

  const renderZoneOverlay = (zoneKey: string, pathD: string) => {
    const rawColor = colors[zoneKey];
    const isDefault = isDefaultMarbleColor(zoneKey, rawColor);
    const finish = finishes[zoneKey] ?? "Original";
    const isActive = activeZone === zoneKey;

    const fillColor = rawColor || "#EFEDE7";
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
        {/* Color tint with multiply blend mode: stains marble preserving all physical carvings & depth */}
        {!isDefault && (
          <path
            d={pathD}
            fill={fillColor}
            style={{ mixBlendMode: "multiply" }}
            opacity={isDark ? 0.92 : 0.82}
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

        {/* Active Zone: Soft luminous zone illumination & sleek contour */}
        {isActive && (
          <>
            {/* Luminous soft highlight over the entire active zone */}
            <path
              d={pathD}
              fill="#3B82F6"
              style={{ mixBlendMode: "screen" }}
              opacity={0.12}
              pointerEvents="none"
            />
            {/* Smooth glowing outline precisely tracing zone boundary */}
            <path
              d={pathD}
              fill="none"
              stroke="#2563EB"
              strokeWidth={3}
              opacity={0.88}
              filter="url(#zone-glow)"
              pointerEvents="none"
            />
          </>
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

        {/* Soft glow for active selector contour */}
        <filter id="zone-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
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
          cx={view === "frontal" ? 508 : 435}
          cy={view === "frontal" ? 175 : 195}
          r={7.5}
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
            cx={view === "frontal" ? 508 : 435}
            cy={view === "frontal" ? 175 : 195}
            r={14}
            fill="none"
            stroke="#2563EB"
            strokeWidth={3}
            opacity={0.9}
            filter="url(#zone-glow)"
            pointerEvents="none"
          />
        )}
      </g>

      {/* 3. Elegantly Positioned Interactive Callout Selectors */}
      {interactive && (
        <g className="select-none">
          {Object.entries(hotspots).map(([zoneKey, spot]) => {
            const isActive = activeZone === zoneKey;
            const currentColor = colors[zoneKey] || "#EFEDE7";
            const textWidth = spot.label.length * 7.5 + 24;

            return (
              <g
                key={zoneKey}
                className="cursor-pointer transition-all duration-200 group"
                onClick={(e) => {
                  e.stopPropagation();
                  onZoneClick?.(zoneKey);
                }}
              >
                {/* Delicate connector line from callout badge to target zone */}
                <line
                  x1={spot.badgeX}
                  y1={spot.badgeY}
                  x2={spot.targetX}
                  y2={spot.targetY}
                  stroke={isActive ? "#2563EB" : "rgba(0,0,0,0.22)"}
                  strokeWidth={isActive ? 2 : 1.2}
                  strokeDasharray={isActive ? "none" : "3 3"}
                  className="transition-colors duration-200"
                />

                {/* Target anchor point dot on the actual sculpture */}
                <circle
                  cx={spot.targetX}
                  cy={spot.targetY}
                  r={isActive ? 5 : 3.5}
                  fill={isActive ? "#2563EB" : "#FFFFFF"}
                  stroke={isActive ? "#FFFFFF" : "rgba(0,0,0,0.3)"}
                  strokeWidth={1.5}
                  className="transition-all duration-200"
                />

                {/* Ping wave when active */}
                {isActive && (
                  <circle
                    cx={spot.badgeX}
                    cy={spot.badgeY}
                    r={20}
                    fill="#2563EB"
                    opacity={0.3}
                    className="animate-ping"
                  />
                )}

                {/* Callout badge background pill */}
                <rect
                  x={spot.badgeX - 16}
                  y={spot.badgeY - 14}
                  width={textWidth + 28}
                  height={28}
                  rx={14}
                  ry={14}
                  fill={isActive ? "#1E293B" : "rgba(255,255,255,0.96)"}
                  stroke={isActive ? "#2563EB" : "rgba(0,0,0,0.14)"}
                  strokeWidth={isActive ? 2 : 1}
                  filter="drop-shadow(0 2px 6px rgba(0,0,0,0.18))"
                  className="transition-all duration-200 group-hover:scale-105"
                />

                {/* Color swatch circle */}
                <circle
                  cx={spot.badgeX}
                  cy={spot.badgeY}
                  r={8.5}
                  fill={currentColor}
                  stroke={isActive ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.2)"}
                  strokeWidth={1.2}
                />

                {/* Label text */}
                <text
                  x={spot.badgeX + 16}
                  y={spot.badgeY + 4}
                  fontSize={12}
                  fontWeight={isActive ? "700" : "600"}
                  fill={isActive ? "#FFFFFF" : "#1E293B"}
                  fontFamily="system-ui, sans-serif"
                  letterSpacing="0.2px"
                >
                  {spot.label}
                </text>
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
}
