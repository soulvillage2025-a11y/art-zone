import type { Finish } from "@/lib/telopinto";

type Shape =
  | { zone: string; type: "path"; d: string }
  | { zone: string; type: "ellipse"; cx: number; cy: number; rx: number; ry: number }
  | { zone: string; type: "circle"; cx: number; cy: number; r: number };

export type View = "frontal" | "lateral";

const budaCompleto: Record<View, Shape[]> = {
  frontal: [
    { zone: "aura", type: "circle", cx: 150, cy: 150, r: 104 },
    {
      zone: "base",
      type: "path",
      d: "M40 366 C66 326 106 310 150 310 C194 310 234 326 260 366 C214 390 86 390 40 366 Z",
    },
    {
      zone: "manto",
      type: "path",
      d: "M150 168 C96 174 64 238 60 320 L240 320 C236 238 204 174 150 168 Z",
    },
    {
      zone: "pecho",
      type: "path",
      d: "M150 172 C131 184 123 210 126 234 C138 248 162 248 174 234 C177 210 169 184 150 172 Z",
    },
    { zone: "rostro", type: "ellipse", cx: 150, cy: 118, rx: 46, ry: 54 },
    {
      zone: "rizos",
      type: "path",
      d: "M103 124 C98 68 202 68 197 124 C189 100 175 86 150 86 C125 86 111 100 103 124 Z",
    },
    { zone: "rizos", type: "circle", cx: 150, cy: 62, r: 15 },
  ],
  lateral: [
    { zone: "aura", type: "circle", cx: 162, cy: 150, r: 104 },
    {
      zone: "base",
      type: "path",
      d: "M50 366 C74 326 112 310 154 310 C196 310 234 326 258 366 C214 390 96 390 50 366 Z",
    },
    {
      zone: "manto",
      type: "path",
      d: "M156 168 C112 176 86 238 84 320 L230 320 C230 240 208 176 156 168 Z",
    },
    {
      zone: "pecho",
      type: "path",
      d: "M156 174 C142 190 138 214 142 236 C152 246 168 244 174 234 C178 210 170 186 156 174 Z",
    },
    { zone: "rostro", type: "ellipse", cx: 152, cy: 118, rx: 42, ry: 54 },
    {
      zone: "rizos",
      type: "path",
      d: "M110 128 C104 70 196 66 194 126 C186 102 172 86 148 86 C126 86 116 102 110 128 Z",
    },
    { zone: "rizos", type: "circle", cx: 156, cy: 62, r: 15 },
  ],
};

const budaSonriente: Record<View, Shape[]> = {
  frontal: [
    { zone: "aura", type: "circle", cx: 150, cy: 160, r: 108 },
    {
      zone: "base",
      type: "path",
      d: "M46 368 C70 336 108 322 150 322 C192 322 230 336 254 368 C210 388 90 388 46 368 Z",
    },
    {
      zone: "manto",
      type: "path",
      d: "M150 158 C86 166 54 240 62 330 L238 330 C246 240 214 166 150 158 Z",
    },
    { zone: "pecho", type: "ellipse", cx: 150, cy: 262, rx: 58, ry: 52 },
    { zone: "rostro", type: "ellipse", cx: 150, cy: 118, rx: 54, ry: 48 },
    {
      zone: "rizos",
      type: "path",
      d: "M96 118 C92 66 208 66 204 118 C194 96 176 82 150 82 C124 82 106 96 96 118 Z",
    },
  ],
  lateral: [
    { zone: "aura", type: "circle", cx: 164, cy: 160, r: 108 },
    {
      zone: "base",
      type: "path",
      d: "M56 368 C78 336 114 322 154 322 C196 322 232 336 254 368 C212 388 98 388 56 368 Z",
    },
    {
      zone: "manto",
      type: "path",
      d: "M158 158 C104 168 76 240 84 330 L232 330 C240 240 212 166 158 158 Z",
    },
    { zone: "pecho", type: "ellipse", cx: 142, cy: 262, rx: 52, ry: 50 },
    { zone: "rostro", type: "ellipse", cx: 154, cy: 118, rx: 48, ry: 48 },
    {
      zone: "rizos",
      type: "path",
      d: "M106 118 C102 66 206 66 202 116 C192 94 174 82 150 82 C126 82 116 96 106 118 Z",
    },
  ],
};

const cabezaZen: Record<View, Shape[]> = {
  frontal: [
    {
      zone: "base",
      type: "path",
      d: "M78 320 L222 320 L238 376 L62 376 Z",
    },
    { zone: "rostro", type: "ellipse", cx: 150, cy: 196, rx: 62, ry: 82 },
    {
      zone: "rizos",
      type: "path",
      d: "M88 192 C82 104 218 104 212 192 C200 154 180 132 150 132 C120 132 100 154 88 192 Z",
    },
    { zone: "rizos", type: "circle", cx: 150, cy: 100, r: 16 },
  ],
  lateral: [
    {
      zone: "base",
      type: "path",
      d: "M84 320 L226 320 L242 376 L68 376 Z",
    },
    { zone: "rostro", type: "ellipse", cx: 156, cy: 196, rx: 56, ry: 82 },
    {
      zone: "rizos",
      type: "path",
      d: "M100 196 C92 104 216 100 210 190 C198 152 178 132 148 132 C122 132 108 156 100 196 Z",
    },
    { zone: "rizos", type: "circle", cx: 158, cy: 100, r: 16 },
  ],
};

const VARIANTS: Record<string, Record<View, Shape[]>> = {
  buda_completo: budaCompleto,
  buda_sonriente: budaSonriente,
  cabeza_zen: cabezaZen,
};

type Props = {
  variant: string;
  view: View;
  colors: Record<string, string>;
  finishes?: Record<string, Finish>;
  activeZone?: string | null;
  onZoneClick?: (zone: string) => void;
  className?: string;
};

export function BudaSvg({
  variant,
  view,
  colors,
  finishes = {},
  activeZone,
  onZoneClick,
  className,
}: Props) {
  const shapes = (VARIANTS[variant] ?? budaCompleto)[view];
  const interactive = Boolean(onZoneClick);

  return (
    <svg
      viewBox="0 0 300 400"
      className={className}
      role="img"
      aria-label="Vista del producto personalizado"
    >
      <defs>
        <linearGradient id="marble" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.16" />
        </linearGradient>
        <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="35%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="60%" stopColor="#000000" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.45" />
        </linearGradient>
        <radialGradient id="gloss" cx="0.32" cy="0.25" r="0.75">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.12" />
        </radialGradient>
      </defs>

      {shapes.map((shape, i) => {
        const fill = colors[shape.zone] ?? "#EFEDE7";
        const finish = finishes[shape.zone] ?? "Original";
        const overlay =
          finish === "Metálico"
            ? "url(#metal)"
            : finish === "Brillante"
              ? "url(#gloss)"
              : finish === "Mate"
                ? null
                : "url(#marble)";
        const isActive = activeZone === shape.zone;
        const common = {
          onClick: interactive ? () => onZoneClick?.(shape.zone) : undefined,
          style: interactive ? { cursor: "pointer" } : undefined,
        };

        const geometry = (fillValue: string, extra?: Record<string, unknown>) => {
          if (shape.type === "path")
            return <path d={shape.d} fill={fillValue} {...extra} />;
          if (shape.type === "ellipse")
            return (
              <ellipse
                cx={shape.cx}
                cy={shape.cy}
                rx={shape.rx}
                ry={shape.ry}
                fill={fillValue}
                {...extra}
              />
            );
          return (
            <circle cx={shape.cx} cy={shape.cy} r={shape.r} fill={fillValue} {...extra} />
          );
        };

        return (
          <g key={`${shape.zone}-${i}`} {...common}>
            {geometry(fill)}
            {overlay ? geometry(overlay, { pointerEvents: "none" }) : null}
            {isActive
              ? geometry("none", {
                  stroke: "#0047AB",
                  strokeWidth: 3,
                  strokeDasharray: "6 5",
                  pointerEvents: "none",
                })
              : null}
          </g>
        );
      })}

      {variant !== "cabeza_zen" ? (
        <g
          pointerEvents="none"
          stroke="#2b2b2b"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
          opacity="0.75"
        >
          <path d={view === "frontal" ? "M130 116 q8 -7 16 0" : "M138 116 q8 -7 16 0"} />
          <path d={view === "frontal" ? "M154 116 q8 -7 16 0" : "M162 116 q8 -7 16 0"} />
          <path d={view === "frontal" ? "M136 140 q14 12 28 0" : "M144 140 q14 12 26 0"} />
        </g>
      ) : (
        <g
          pointerEvents="none"
          stroke="#2b2b2b"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
          opacity="0.7"
        >
          <path d={view === "frontal" ? "M124 196 q10 -8 20 0" : "M134 196 q10 -8 20 0"} />
          <path d={view === "frontal" ? "M156 196 q10 -8 20 0" : "M166 196 q10 -8 20 0"} />
          <path d={view === "frontal" ? "M132 232 q18 14 36 0" : "M142 232 q18 14 34 0"} />
        </g>
      )}
    </svg>
  );
}
