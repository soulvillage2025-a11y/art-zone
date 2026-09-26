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

const budaBendicion: Record<View, Shape[]> = {
  frontal: [
    // Manto inferior (piernas cruzadas y regazo con pliegues)
    {
      zone: "manto",
      type: "path",
      d: "M36 368 C32 324 64 274 116 268 C142 264 162 268 186 268 C242 268 268 322 264 368 C224 388 76 388 36 368 Z",
    },
    // Manto superior (hombro izquierdo, brazo y manga)
    {
      zone: "manto",
      type: "path",
      d: "M148 168 C160 178 182 184 208 196 C228 206 240 228 236 274 L168 274 C162 248 156 222 142 196 Z",
    },
    // Piel del torso (pecho derecho descubierto)
    {
      zone: "piel",
      type: "path",
      d: "M148 168 L140 198 C126 226 120 252 118 272 L90 268 C82 246 86 198 120 178 C130 172 140 169 148 168 Z",
    },
    // Brazo derecho alzado y mano en Abhaya Mudra (gesto de bendición y protección)
    {
      zone: "piel",
      type: "path",
      d: "M86 236 C82 258 90 282 102 282 C114 282 126 264 130 240 L130 194 C130 184 140 184 140 196 L138 246 C136 272 118 294 96 292 C78 290 68 260 74 226 C78 204 86 198 92 198 C96 198 90 218 86 236 Z",
    },
    // Mano izquierda reposando en el regazo
    {
      zone: "piel",
      type: "path",
      d: "M136 290 C148 284 184 284 198 292 C206 298 202 310 188 310 C168 310 144 308 134 302 C128 298 130 292 136 290 Z",
    },
    // Pie visible en posición de loto
    {
      zone: "piel",
      type: "path",
      d: "M114 338 C124 328 144 330 148 342 C148 352 132 358 118 354 C110 350 110 342 114 338 Z",
    },
    // Cuello
    {
      zone: "piel",
      type: "path",
      d: "M136 156 L136 172 C144 176 156 176 164 172 L164 156 Z",
    },
    // Rostro sereno
    { zone: "piel", type: "ellipse", cx: 150, cy: 114, rx: 42, ry: 48 },
    // Orejas alargadas
    {
      zone: "piel",
      type: "path",
      d: "M108 112 C104 122 104 142 108 150 C110 150 112 138 112 122 Z",
    },
    {
      zone: "piel",
      type: "path",
      d: "M192 112 C196 122 196 142 192 150 C190 150 188 138 188 122 Z",
    },
    // Rizos del cabello y ushnisha cónico
    {
      zone: "rizos",
      type: "path",
      d: "M108 114 C102 60 198 60 192 114 C184 92 172 78 150 78 C128 78 116 92 108 114 Z",
    },
    { zone: "rizos", type: "circle", cx: 150, cy: 56, r: 14 },
    { zone: "rizos", type: "circle", cx: 150, cy: 42, r: 6 },
    // Collar de perlas en el cuello
    {
      zone: "collar",
      type: "path",
      d: "M134 168 C140 176 160 176 166 168 C168 174 162 182 150 184 C138 182 132 174 134 168 Z",
    },
    // Dije floral de 5 pétalos sobre el pecho
    { zone: "collar", type: "circle", cx: 150, cy: 191, r: 7 },
    { zone: "collar", type: "circle", cx: 150, cy: 185, r: 3.5 },
    { zone: "collar", type: "circle", cx: 155, cy: 189, r: 3.5 },
    { zone: "collar", type: "circle", cx: 153, cy: 195, r: 3.5 },
    { zone: "collar", type: "circle", cx: 147, cy: 195, r: 3.5 },
    { zone: "collar", type: "circle", cx: 145, cy: 189, r: 3.5 },
    // Detalles: Bindi / Urna en la frente y cenefa ornamental
    { zone: "detalles", type: "circle", cx: 150, cy: 102, r: 3.5 },
    {
      zone: "detalles",
      type: "path",
      d: "M146 170 C154 180 174 188 200 198 C202 201 198 204 194 202 C170 192 150 182 144 172 Z",
    },
  ],
  lateral: [
    {
      zone: "manto",
      type: "path",
      d: "M48 368 C44 324 74 274 124 268 C150 264 170 268 192 268 C242 268 266 322 260 368 C220 388 88 388 48 368 Z",
    },
    {
      zone: "manto",
      type: "path",
      d: "M154 168 C164 178 186 184 212 196 C230 206 242 228 238 274 L174 274 C168 248 162 222 148 196 Z",
    },
    {
      zone: "piel",
      type: "path",
      d: "M152 168 L144 198 C130 226 126 252 124 272 L96 268 C90 246 94 198 126 178 C136 172 144 169 152 168 Z",
    },
    {
      zone: "piel",
      type: "path",
      d: "M92 236 C88 258 96 282 108 282 C120 282 130 264 134 240 L134 194 C134 184 144 184 144 196 L142 246 C140 272 124 294 102 292 C84 290 76 260 82 226 C86 204 92 198 98 198 C102 198 96 218 92 236 Z",
    },
    {
      zone: "piel",
      type: "path",
      d: "M140 290 C152 284 186 284 200 292 C208 298 204 310 190 310 C170 310 148 308 138 302 C132 298 134 292 140 290 Z",
    },
    {
      zone: "piel",
      type: "path",
      d: "M138 156 L138 172 C146 176 158 176 166 172 L166 156 Z",
    },
    { zone: "piel", type: "ellipse", cx: 154, cy: 114, rx: 38, ry: 48 },
    {
      zone: "piel",
      type: "path",
      d: "M194 112 C198 122 198 142 194 150 C192 150 190 138 190 122 Z",
    },
    {
      zone: "rizos",
      type: "path",
      d: "M114 114 C108 60 200 60 194 114 C186 92 174 78 152 78 C130 78 120 92 114 114 Z",
    },
    { zone: "rizos", type: "circle", cx: 154, cy: 56, r: 14 },
    { zone: "rizos", type: "circle", cx: 154, cy: 42, r: 6 },
    {
      zone: "collar",
      type: "path",
      d: "M138 168 C144 176 162 176 168 168 C170 174 164 182 152 184 C140 182 136 174 138 168 Z",
    },
    { zone: "collar", type: "circle", cx: 152, cy: 191, r: 6 },
    { zone: "detalles", type: "circle", cx: 158, cy: 102, r: 3 },
  ],
};

const VARIANTS: Record<string, Record<View, Shape[]>> = {
  buda_completo: budaCompleto,
  buda_sonriente: budaSonriente,
  cabeza_zen: cabezaZen,
  buda_bendicion: budaBendicion,
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
