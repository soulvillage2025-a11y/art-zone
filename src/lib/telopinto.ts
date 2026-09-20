export type Finish = "Original" | "Mate" | "Brillante" | "Metálico";

export const FINISHES: Finish[] = ["Original", "Mate", "Brillante", "Metálico"];

export const FINISH_SURCHARGE: Record<Finish, number> = {
  Original: 0,
  Mate: 0,
  Brillante: 8000,
  Metálico: 15000,
};

export type ZoneSelection = {
  zone_key: string;
  zone_name: string;
  color_name: string;
  hex: string;
  finish: Finish;
};

export const ORDER_STATUSES = [
  { key: "pendiente_aprobacion", label: "Pendiente de aprobación" },
  { key: "esperando_producto", label: "Esperando producto" },
  { key: "en_pintura", label: "En proceso de pintura" },
  { key: "control_calidad", label: "Control de calidad" },
  { key: "enviado", label: "Enviado" },
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number]["key"];

export function statusLabel(key: string) {
  return ORDER_STATUSES.find((s) => s.key === key)?.label ?? key;
}

export function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function estimateTotal(
  basePrice: number,
  pricePerZone: number,
  selections: ZoneSelection[],
  defaults: Record<string, string>,
) {
  let total = basePrice;
  for (const s of selections) {
    const isDefault = (defaults[s.zone_key] ?? "").toLowerCase() === s.hex.toLowerCase();
    if (!isDefault) total += pricePerZone + FINISH_SURCHARGE[s.finish];
  }
  return total;
}
