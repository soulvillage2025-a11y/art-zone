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

  // Calibrated anatomical paths for 1024x1024 viewBox
  const frontalPaths = {
    // 1. Rizos del cabello y Ushnisha cónico
    rizos:
      "M 508 22 L 518 28 L 524 40 L 532 56 L 540 72 L 550 85 L 560 92 L 572 102 L 582 115 L 590 132 L 596 150 L 598 168 L 594 182 L 586 192 L 580 185 L 570 172 L 555 160 L 538 148 L 522 142 L 508 140 L 494 142 L 478 148 L 460 160 L 445 172 L 436 185 L 428 192 L 420 182 L 416 168 L 420 150 L 428 132 L 438 115 L 448 102 L 458 92 L 468 85 L 476 72 L 484 56 L 492 40 L 498 28 Z",

    // 2. Piel y Torso (Rostro, orejas, cuello, pecho descubierto, brazo, mano en Abhaya Mudra, cuenco y pies)
    piel:
      // Rostro, orejas y mejillas
      "M 508 140 L 522 142 L 538 148 L 555 160 L 570 172 L 580 185 L 586 192 L 592 198 L 598 215 L 602 240 L 600 268 L 594 292 L 584 308 L 574 312 L 560 314 L 540 316 L 522 318 L 508 320 L 494 318 L 476 316 L 456 314 L 438 312 L 428 308 L 418 292 L 412 268 L 410 240 L 412 215 L 418 198 L 428 192 L 436 185 L 445 172 L 460 160 L 478 148 L 494 142 Z " +
      // Cuello
      "M 438 312 L 476 316 L 508 320 L 540 316 L 574 312 L 570 335 L 548 345 L 528 350 L 508 352 L 485 350 L 465 345 L 442 335 Z " +
      // Hombro derecho, deltoides, brazo y pecho descubierto
      "M 442 335 L 410 355 L 370 370 L 335 395 L 318 425 L 310 465 L 304 510 L 298 555 L 294 590 L 306 622 L 325 638 L 355 640 L 390 628 L 425 600 L 455 565 L 465 530 L 475 480 L 480 430 L 476 385 L 465 355 L 445 338 Z " +
      // Mano alzada en Abhaya Mudra (palma y dedos de bendición)
      "M 448 565 L 455 520 L 460 480 L 464 450 L 470 420 L 482 415 L 494 418 L 504 430 L 514 455 L 520 485 L 520 520 L 512 545 L 498 565 L 475 570 Z " +
      // Mano izquierda y cuenco de ofrendas en el regazo
      "M 465 660 L 495 655 L 525 655 L 545 660 L 555 680 L 575 692 L 600 705 L 612 722 L 608 736 L 580 742 L 540 745 L 495 745 L 455 738 L 425 725 L 415 705 L 425 690 L 445 678 L 455 668 Z " +
      // Pie derecho con planta hacia arriba en postura de loto
      "M 475 755 L 500 745 L 540 738 L 585 735 L 630 732 L 670 735 L 700 742 L 715 755 L 710 775 L 690 788 L 655 794 L 610 796 L 560 794 L 515 788 L 485 778 Z " +
      // Dedos del pie izquierdo visibles en la base inferior
      "M 290 920 L 300 905 L 320 905 L 340 915 L 345 938 L 325 946 L 305 944 L 290 930 Z",

    // 3. Collar de perlas y dije floral
    collar:
      "M 442 335 L 465 345 L 485 350 L 508 352 L 528 350 L 548 345 L 570 335 L 574 348 L 555 365 L 535 375 L 525 382 L 525 395 L 520 412 L 508 418 L 496 412 L 492 395 L 485 382 L 475 375 L 455 365 L 438 348 Z",

    // 4. Manto kasaya grabado (hombro izquierdo, manga y vestimenta inferior)
    manto:
      // Túnica hombro izquierdo y manga drapeada
      "M 570 335 L 585 338 L 615 348 L 650 368 L 680 385 L 702 415 L 718 450 L 726 490 L 730 530 L 732 570 L 732 610 L 728 650 L 722 685 L 710 715 L 680 735 L 645 738 L 610 735 L 570 710 L 545 675 L 530 625 L 520 570 L 510 515 L 500 460 L 482 395 L 508 375 L 535 375 L 555 365 L 574 348 Z " +
      // Túnica inferior que cubre piernas, rodillas y regazo
      "M 145 835 L 155 785 L 180 740 L 214 705 L 270 670 L 325 650 L 380 640 L 430 645 L 460 655 L 465 740 L 475 755 L 485 778 L 515 788 L 560 794 L 610 796 L 655 794 L 690 788 L 710 775 L 718 750 L 725 720 L 758 755 L 801 785 L 832 815 L 848 850 L 840 880 L 820 915 L 780 942 L 720 955 L 650 960 L 570 960 L 508 960 L 440 960 L 370 955 L 290 945 L 220 930 L 170 895 L 145 835 Z",
  };

  const lateralPaths = {
    rizos:
      "M 530 25 L 542 35 L 548 50 L 555 68 L 565 85 L 575 95 L 588 108 L 598 125 L 606 145 L 608 168 L 604 185 L 595 195 L 585 188 L 572 175 L 555 162 L 535 150 L 515 145 L 495 148 L 475 160 L 455 175 L 442 188 L 435 192 L 430 180 L 426 165 L 430 145 L 440 125 L 455 105 L 470 90 L 485 75 L 500 55 L 515 38 Z",

    piel:
      "M 495 148 L 515 145 L 535 150 L 555 162 L 572 175 L 585 188 L 595 195 L 600 205 L 604 225 L 602 255 L 595 285 L 582 310 L 570 318 L 555 322 L 535 324 L 515 322 L 495 318 L 475 312 L 450 308 L 438 290 L 432 265 L 430 235 L 432 210 L 438 195 L 442 188 L 455 175 L 475 160 Z " +
      "M 450 308 L 495 318 L 535 324 L 570 318 L 565 340 L 540 350 L 515 355 L 485 352 L 460 345 L 445 335 Z " +
      "M 445 335 L 410 355 L 370 375 L 340 400 L 325 435 L 318 475 L 315 520 L 312 565 L 315 605 L 330 635 L 360 642 L 400 630 L 440 600 L 470 565 L 480 530 L 488 480 L 490 430 L 485 385 L 472 355 L 450 338 Z " +
      "M 465 565 L 470 520 L 475 475 L 478 445 L 485 415 L 496 410 L 508 415 L 518 428 L 526 450 L 530 480 L 528 515 L 520 545 L 505 568 L 485 572 Z " +
      "M 455 665 L 485 660 L 520 660 L 545 665 L 560 685 L 580 700 L 600 715 L 608 730 L 602 742 L 575 748 L 530 748 L 485 745 L 445 735 L 420 720 L 420 698 L 435 680 Z " +
      "M 465 755 L 495 745 L 535 738 L 580 735 L 625 735 L 665 740 L 695 750 L 708 765 L 700 782 L 680 792 L 645 798 L 598 798 L 550 795 L 505 788 L 475 778 Z",

    collar:
      "M 445 335 L 465 345 L 485 352 L 515 355 L 540 350 L 565 340 L 568 352 L 548 368 L 528 378 L 518 385 L 518 398 L 512 415 L 500 420 L 490 415 L 485 398 L 478 385 L 468 378 L 448 368 L 435 350 Z",

    manto:
      "M 565 340 L 580 342 L 610 352 L 645 372 L 675 390 L 698 420 L 712 455 L 720 495 L 725 535 L 726 575 L 725 615 L 720 655 L 712 690 L 698 718 L 670 738 L 635 742 L 600 738 L 565 712 L 540 678 L 525 628 L 515 572 L 508 518 L 498 462 L 485 400 L 512 380 L 538 380 L 558 370 L 572 352 Z " +
      "M 160 840 L 170 790 L 195 745 L 230 710 L 285 675 L 340 655 L 395 645 L 445 650 L 475 660 L 465 740 L 475 755 L 485 778 L 515 788 L 560 794 L 610 796 L 655 794 L 690 788 L 710 775 L 718 750 L 725 720 L 750 755 L 790 785 L 820 815 L 835 850 L 825 880 L 805 915 L 765 942 L 710 955 L 640 960 L 560 960 L 500 960 L 430 960 L 360 955 L 280 945 L 210 930 L 170 895 L 155 860 Z",
  };

  const activePaths = view === "frontal" ? frontalPaths : lateralPaths;

  // Hotspots positioned directly on each zone
  const hotspots: Record<string, { x: number; y: number; label: string }> =
    view === "frontal"
      ? {
          rizos: { x: 508, y: 145, label: "Rizos" },
          detalles: { x: 508, y: 205, label: "Urna" },
          collar: { x: 508, y: 390, label: "Collar" },
          piel: { x: 385, y: 475, label: "Piel" },
          manto: { x: 645, y: 530, label: "Manto" },
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
      </g>

      {/* 3. Interactive Selector Hotpoint Badges on the Sculpture */}
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
