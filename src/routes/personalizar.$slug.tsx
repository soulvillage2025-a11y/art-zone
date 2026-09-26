import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Check,
  RotateCcw,
  ShoppingBag,
  Printer,
  MessageCircle,
  CheckCircle2,
  Calendar,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

import { BudaSvg, type View } from "@/components/BudaSvg";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { getProductDetail, createOrder } from "@/lib/telopinto.functions";
import {
  formatCOP,
  FINISHES,
  FINISH_SURCHARGE,
  estimateTotal,
  type Finish,
  type ZoneSelection,
} from "@/lib/telopinto";

const productDetailQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product-detail", slug],
    queryFn: () => getProductDetail({ data: { slug } }),
  });

export const Route = createFileRoute("/personalizar/$slug")({
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData(productDetailQuery(params.slug)),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.product
          ? `Personalizar ${loaderData.product.name} — TeLoPinto`
          : "Personalizar pieza — TeLoPinto",
      },
      {
        name: "description",
        content:
          "Personaliza zona por zona sobre budas en mármol con colores de taller y acabados reales.",
      },
    ],
  }),
  component: PersonalizarPage,
  errorComponent: () => (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <h2 className="text-3xl">No se pudo cargar la pieza</h2>
      <p className="mt-3 text-sm text-muted-foreground">
        Ocurrió un error al cargar la información del taller.
      </p>
      <Button asChild className="mt-6">
        <Link to="/catalogo">Volver al catálogo</Link>
      </Button>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <h2 className="text-3xl">Pieza no encontrada</h2>
      <p className="mt-3 text-sm text-muted-foreground">
        El modelo seleccionado no está en el catálogo actual.
      </p>
      <Button asChild className="mt-6">
        <Link to="/catalogo">Ver catálogo</Link>
      </Button>
    </div>
  ),
});

type ZoneConfig = {
  color_name: string;
  hex: string;
  finish: Finish;
  pantone?: string | null;
};

type CreatedOrderResult = {
  order_code: string;
  estimated_total: number;
  product_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_method: string;
  shipping_address: string;
  notes: string;
  customization: ZoneSelection[];
};

function PersonalizarPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(productDetailQuery(slug));

  if (!data || !data.product) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-20 text-center">
        <h1 className="text-3xl">Pieza no disponible</h1>
        <p className="mt-2 text-muted-foreground">
          Esta pieza no se encuentra disponible actualmente en el catálogo.
        </p>
        <Button asChild className="mt-6">
          <Link to="/catalogo">Explorar otras piezas</Link>
        </Button>
      </main>
    );
  }

  const { product, zones, palette } = data;

  // Defaults map: zone_key -> default_hex
  const defaults = useMemo(() => {
    const map: Record<string, string> = {};
    for (const z of zones) {
      map[z.zone_key] = z.default_hex;
    }
    return map;
  }, [zones]);

  // Initial state for each zone
  const [view, setView] = useState<View>("frontal");
  const [activeZoneKey, setActiveZoneKey] = useState<string>(
    zones[0]?.zone_key ?? "manto"
  );
  const [paletteFamily, setPaletteFamily] = useState<string>("todas");

  const [customization, setCustomization] = useState<Record<string, ZoneConfig>>(() => {
    const initial: Record<string, ZoneConfig> = {};
    for (const z of zones) {
      initial[z.zone_key] = {
        color_name: "Blanco Mármol Original",
        hex: z.default_hex,
        finish: "Original",
        pantone: "11-0601 TCX",
      };
    }
    return initial;
  });

  // Dialog & Order flow state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<CreatedOrderResult | null>(null);

  // Customer form inputs
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    delivery_method: "compra_pieza" as "cliente_envia" | "compra_pieza",
    shipping_address: "",
    notes: "",
  });

  // Derived current colors & finishes for BudaSvg
  const svgColors = useMemo(() => {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(customization)) {
      out[k] = v.hex;
    }
    return out;
  }, [customization]);

  const svgFinishes = useMemo(() => {
    const out: Record<string, Finish> = {};
    for (const [k, v] of Object.entries(customization)) {
      out[k] = v.finish;
    }
    return out;
  }, [customization]);

  // Selections array for estimation and order payload
  const currentSelections = useMemo<ZoneSelection[]>(() => {
    return zones.map((z) => {
      const cfg = customization[z.zone_key] ?? {
        color_name: "Original",
        hex: z.default_hex,
        finish: "Original" as Finish,
      };
      return {
        zone_key: z.zone_key,
        zone_name: z.zone_name,
        color_name: cfg.color_name,
        hex: cfg.hex,
        finish: cfg.finish,
      };
    });
  }, [zones, customization]);

  // Real-time calculated total
  const estimatedTotal = useMemo(() => {
    return estimateTotal(product.base_price, product.price_per_zone, currentSelections, defaults);
  }, [product, currentSelections, defaults]);

  // Zones that have been modified from original
  const modifiedZones = useMemo(() => {
    return currentSelections.filter(
      (s) =>
        (defaults[s.zone_key] ?? "").toLowerCase() !== s.hex.toLowerCase() ||
        s.finish !== "Original"
    );
  }, [currentSelections, defaults]);

  // Active zone details
  const activeZoneMeta = zones.find((z) => z.zone_key === activeZoneKey) ?? zones[0];
  const activeZoneConfig = customization[activeZoneKey] ?? {
    color_name: "Original",
    hex: activeZoneMeta?.default_hex ?? "#EFEDE7",
    finish: "Original" as Finish,
  };

  // Palette filtering
  const families = ["todas", ...Array.from(new Set(palette.map((c) => c.family)))];
  const filteredPalette =
    paletteFamily === "todas"
      ? palette
      : palette.filter((c) => c.family === paletteFamily);

  // Handlers
  const handleSelectColor = (color: (typeof palette)[number]) => {
    if (!activeZoneKey) return;
    setCustomization((prev) => ({
      ...prev,
      [activeZoneKey]: {
        color_name: color.name,
        hex: color.hex,
        finish: prev[activeZoneKey]?.finish === "Original" ? "Mate" : (prev[activeZoneKey]?.finish ?? "Mate"),
        pantone: color.pantone,
      },
    }));
    toast.success(`Color ${color.name} aplicado a ${activeZoneMeta?.zone_name}`);
  };

  const handleSelectFinish = (finish: Finish) => {
    if (!activeZoneKey) return;
    setCustomization((prev) => {
      const existing = prev[activeZoneKey];
      const baseConfig: ZoneConfig = existing ?? {
        color_name: "Blanco Mármol Original",
        hex: activeZoneMeta?.default_hex ?? "#EFEDE7",
        finish: "Original",
        pantone: "11-0601 TCX",
      };
      return {
        ...prev,
        [activeZoneKey]: {
          ...baseConfig,
          finish,
        },
      };
    });
  };

  const handleResetZone = () => {
    if (!activeZoneKey || !activeZoneMeta) return;
    setCustomization((prev) => ({
      ...prev,
      [activeZoneKey]: {
        color_name: "Blanco Mármol Original",
        hex: activeZoneMeta.default_hex,
        finish: "Original",
        pantone: "11-0601 TCX",
      },
    }));
    toast.info(`${activeZoneMeta.zone_name} restablecido a mármol original`);
  };

  const handleResetAll = () => {
    const resetState: Record<string, ZoneConfig> = {};
    for (const z of zones) {
      resetState[z.zone_key] = {
        color_name: "Blanco Mármol Original",
        hex: z.default_hex,
        finish: "Original",
        pantone: "11-0601 TCX",
      };
    }
    setCustomization(resetState);
    toast.info("Toda la figura se ha restablecido a los tonos de mármol base");
  };

  // Submit Order to backend
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_name.trim()) {
      toast.error("Por favor ingresa tu nombre completo");
      return;
    }
    if (!formData.customer_email.trim() || !formData.customer_email.includes("@")) {
      toast.error("Por favor ingresa un correo electrónico válido");
      return;
    }
    if (!formData.customer_phone.trim()) {
      toast.error("Por favor ingresa un número de teléfono o WhatsApp");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        product_id: product.id,
        customer_name: formData.customer_name.trim(),
        customer_email: formData.customer_email.trim(),
        customer_phone: formData.customer_phone.trim(),
        shipping_address: formData.shipping_address.trim(),
        delivery_method: formData.delivery_method,
        notes: formData.notes.trim(),
        customization: currentSelections,
      };

      const result = await createOrder({ data: payload });
      const newOrderData = {
        id: crypto.randomUUID(),
        order_code: result.order_code,
        estimated_total: result.estimated_total,
        product_name: product.name,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        delivery_method: formData.delivery_method,
        shipping_address: formData.shipping_address,
        notes: formData.notes,
        customization: currentSelections,
        status: "pendiente_aprobacion",
        created_at: new Date().toISOString(),
      };

      try {
        const stored = JSON.parse(localStorage.getItem("telopinto_client_orders") || "[]");
        stored.unshift(newOrderData);
        localStorage.setItem("telopinto_client_orders", JSON.stringify(stored));
      } catch (err) {
        console.warn("Could not save to localStorage backup:", err);
      }

      setCompletedOrder(newOrderData);
      setIsCheckoutOpen(false);
      toast.success(`¡Pedido ${result.order_code} generado con éxito!`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al procesar el pedido";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pre-generate WhatsApp message
  const whatsappUrl = useMemo(() => {
    if (!completedOrder) return "";
    const lines = [
      `¡Hola TeLoPinto! 🎨 Acabo de personalizar mi pieza y generar el pedido:`,
      `*Código:* ${completedOrder.order_code}`,
      `*Pieza:* ${completedOrder.product_name}`,
      `*Total estimado:* ${formatCOP(completedOrder.estimated_total)}`,
      `*Cliente:* ${completedOrder.customer_name} (${completedOrder.customer_phone})`,
      `*Método:* ${completedOrder.delivery_method === "compra_pieza" ? "Comprar pieza en taller" : "Envío mi propia pieza"}`,
      "",
      `*Despiece de color y acabados:*`,
      ...completedOrder.customization.map(
        (c) => `• ${c.zone_name}: ${c.color_name} (${c.hex}) - Acabado ${c.finish}`
      ),
    ];
    return `https://wa.me/573000000000?text=${encodeURIComponent(lines.join("\n"))}`;
  }, [completedOrder]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      {/* Top Bar Navigation */}
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="gap-1.5">
            <Link to="/catalogo">
              <ArrowLeft className="h-4 w-4" />
              Catálogo
            </Link>
          </Button>
          <span className="text-muted-foreground">/</span>
          <h1 className="text-xl font-medium tracking-tight md:text-2xl">{product.name}</h1>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            {product.category}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetAll}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restablecer figura
          </Button>
        </div>
      </div>

      {/* Main Customizer Workspace */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Interactive Canvas & 3D/View Controls (5 cols on lg) */}
        <section className="lg:col-span-5">
          <div className="gallery-panel sticky top-24 overflow-hidden border-border bg-stone-wash p-6 text-center">
            {/* View Toggles & Status */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex rounded-md border border-border bg-background p-1 text-xs shadow-xs">
                <button
                  type="button"
                  onClick={() => setView("frontal")}
                  className={`rounded-sm px-3 py-1 font-medium transition-colors ${
                    view === "frontal"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Vista frontal
                </button>
                <button
                  type="button"
                  onClick={() => setView("lateral")}
                  className={`rounded-sm px-3 py-1 font-medium transition-colors ${
                    view === "lateral"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Vista lateral
                </button>
              </div>

              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                Zona activa: {activeZoneMeta?.zone_name}
              </Badge>
            </div>

            {/* Interactive SVG Figure */}
            <div className="relative flex min-h-[440px] items-center justify-center py-4">
              <BudaSvg
                variant={product.svg_variant}
                view={view}
                colors={svgColors}
                finishes={svgFinishes}
                activeZone={activeZoneKey}
                onZoneClick={(zone) => {
                  setActiveZoneKey(zone);
                }}
                className="h-[420px] w-auto max-w-full drop-shadow-lg transition-transform duration-300 hover:scale-[1.01]"
              />
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              💡 Haz clic en cualquier parte de la figura para seleccionarla directamente.
            </p>
          </div>
        </section>

        {/* Right Column: Zone Selection, Palette, Finish & Price (7 cols on lg) */}
        <section className="space-y-6 lg:col-span-7">
          {/* Section 1: Zonas de la figura */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <p className="eyebrow">Paso 1</p>
                <h2 className="text-xl font-medium">Selecciona la zona a pintar</h2>
              </div>
              <span className="text-xs text-muted-foreground">
                {modifiedZones.length} de {zones.length} zonas personalizadas
              </span>
            </div>

            {/* Zone Selector Pills */}
            <div className="mt-4 flex flex-wrap gap-2">
              {zones.map((z) => {
                const cfg = customization[z.zone_key];
                const isSelected = z.zone_key === activeZoneKey;
                const isModified =
                  (defaults[z.zone_key] ?? "").toLowerCase() !== (cfg?.hex ?? "").toLowerCase() ||
                  cfg?.finish !== "Original";

                return (
                  <button
                    key={z.zone_key}
                    type="button"
                    onClick={() => setActiveZoneKey(z.zone_key)}
                    className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary ring-offset-1"
                        : "border-border bg-background hover:bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-black/20 shadow-xs"
                      style={{ backgroundColor: cfg?.hex ?? z.default_hex }}
                    />
                    <span className="font-medium">{z.zone_name}</span>
                    {isModified && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" title="Modificado" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Personalización de la zona activa */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <p className="eyebrow">Paso 2</p>
                <h2 className="text-xl font-medium">
                  Zona: <span className="text-primary">{activeZoneMeta?.zone_name}</span>
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetZone}
                className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3" />
                Color original de mármol
              </Button>
            </div>

            {/* Finish Selection */}
            <div className="mt-5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tipo de Acabado para esta zona
                </label>
                <span className="text-xs text-muted-foreground">
                  Recargo: {activeZoneConfig.finish === "Brillante" ? "+$8.000 COP" : activeZoneConfig.finish === "Metálico" ? "+$15.000 COP" : "Sin costo extra"}
                </span>
              </div>

              <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {FINISHES.map((f) => {
                  const isCurrent = activeZoneConfig.finish === f;
                  const surcharge = FINISH_SURCHARGE[f];
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => handleSelectFinish(f)}
                      className={`relative flex flex-col items-center justify-center rounded-lg border p-3 text-center transition-all ${
                        isCurrent
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                          : "border-border bg-background hover:bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="text-sm font-semibold">{f}</span>
                      <span className="mt-0.5 text-[11px] opacity-80">
                        {surcharge > 0 ? `+${formatCOP(surcharge)}` : "Base"}
                      </span>
                      {isCurrent && (
                        <Check className="absolute top-1.5 right-1.5 h-3.5 w-3.5 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Workshop Color Palette */}
            <div className="mt-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Paleta de Pigmentos del Taller
                </label>

                {/* Family filter pills */}
                <div className="flex flex-wrap gap-1">
                  {families.map((fam) => (
                    <button
                      key={fam}
                      type="button"
                      onClick={() => setPaletteFamily(fam)}
                      className={`rounded-full px-2.5 py-0.5 text-[11px] capitalize transition-colors ${
                        paletteFamily === fam
                          ? "bg-secondary text-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {fam}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color swatches grid */}
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {filteredPalette.map((col) => {
                  const isPicked =
                    activeZoneConfig.hex.toLowerCase() === col.hex.toLowerCase();
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => handleSelectColor(col)}
                      className={`group flex items-center gap-2.5 rounded-lg border p-2 text-left transition-all ${
                        isPicked
                          ? "border-primary bg-primary/10 ring-1 ring-primary"
                          : "border-border bg-background hover:border-muted-foreground/30 hover:bg-secondary"
                      }`}
                    >
                      <span
                        className="relative h-7 w-7 shrink-0 rounded-full border border-black/20 shadow-xs"
                        style={{ backgroundColor: col.hex }}
                      >
                        {isPicked && (
                          <Check className="absolute inset-0 m-auto h-3.5 w-3.5 text-white drop-shadow-md" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-foreground">{col.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {col.pantone ?? col.hex}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Desglose Financiero y Acción Principal */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
              <div>
                <p className="eyebrow">Resumen del pedido</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-4xl text-foreground">
                    {formatCOP(estimatedTotal)}
                  </span>
                  <span className="text-xs text-muted-foreground">IVA incluido</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Tiempo en taller: {product.production_days} días hábiles</span>
              </div>
            </div>

            {/* Cost Breakdown Details */}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Pieza base ({product.name})</span>
                <span className="font-mono text-foreground">{formatCOP(product.base_price)}</span>
              </div>

              {modifiedZones.map((m) => {
                const finishExtra = FINISH_SURCHARGE[m.finish];
                const zoneTotal = product.price_per_zone + finishExtra;
                return (
                  <div key={m.zone_key} className="flex justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-black/20"
                        style={{ backgroundColor: m.hex }}
                      />
                      <span>
                        {m.zone_name}: {m.color_name} ({m.finish})
                      </span>
                    </span>
                    <span className="font-mono text-foreground">+{formatCOP(zoneTotal)}</span>
                  </div>
                );
              })}

              {modifiedZones.length === 0 && (
                <p className="text-xs italic text-muted-foreground">
                  Figura en mármol blanco sin zonas pintadas todavía. Selecciona colores para personalizar.
                </p>
              )}
            </div>

            {/* Action Button to Process Order */}
            <div className="mt-6 pt-4 border-t border-border">
              <Button
                size="lg"
                className="w-full text-base font-medium shadow-md transition-all hover:shadow-lg"
                onClick={() => setIsCheckoutOpen(true)}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Procesar y generar pedido ({formatCOP(estimatedTotal)})
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* Checkout & Customer Details Modal */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Finalizar Pedido para Taller</DialogTitle>
            <DialogDescription>
              Completa los datos de contacto y entrega para enviar la ficha técnica al taller de pintura.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitOrder} className="mt-4 space-y-4">
            {/* Quick Summary Pill */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-stone-wash p-3 text-sm">
              <div>
                <p className="font-medium text-foreground">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {modifiedZones.length} zonas pintadas • Acabados taller
                </p>
              </div>
              <span className="font-display text-xl text-primary">
                {formatCOP(estimatedTotal)}
              </span>
            </div>

            {/* Inputs */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="customer_name">Nombre completo *</Label>
                <Input
                  id="customer_name"
                  placeholder="Ej. Juan Pérez"
                  value={formData.customer_name}
                  onChange={(e) => setFormData((p) => ({ ...p, customer_name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="customer_phone">Teléfono / WhatsApp *</Label>
                <Input
                  id="customer_phone"
                  placeholder="Ej. +57 310 123 4567"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData((p) => ({ ...p, customer_phone: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="customer_email">Correo electrónico *</Label>
              <Input
                id="customer_email"
                type="email"
                placeholder="juan@ejemplo.com"
                value={formData.customer_email}
                onChange={(e) => setFormData((p) => ({ ...p, customer_email: e.target.value }))}
                required
              />
            </div>

            {/* Delivery Method */}
            <div className="space-y-1.5">
              <Label>Método de adquisición de la pieza</Label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, delivery_method: "compra_pieza" }))}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    formData.delivery_method === "compra_pieza"
                      ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                      : "border-border hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  <p className="font-semibold text-foreground">Comprar en taller</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    El taller provee la pieza de mármol nueva tallada.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, delivery_method: "cliente_envia" }))}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    formData.delivery_method === "cliente_envia"
                      ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                      : "border-border hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  <p className="font-semibold text-foreground">Envío mi pieza</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Tienes la pieza y la envías a nuestras instalaciones.
                  </p>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="shipping_address">Dirección de entrega o despacho</Label>
              <Input
                id="shipping_address"
                placeholder="Calle 123 #45-67, Ciudad"
                value={formData.shipping_address}
                onChange={(e) => setFormData((p) => ({ ...p, shipping_address: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Notas o indicaciones para el maestro pintor (opcional)</Label>
              <Textarea
                id="notes"
                rows={2}
                placeholder="Ej. Por favor enfatizar los detalles dorados en el manto..."
                value={formData.notes}
                onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
              />
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Registrando orden en el taller..." : "Confirmar y Generar Pedido"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Dialog: Technical Sheet & Confirmation */}
      {completedOrder && (
        <Dialog open={Boolean(completedOrder)} onOpenChange={() => setCompletedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto print:max-w-none print:p-0">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    <h2 className="text-2xl font-medium">¡Pedido Generado con Éxito!</h2>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    La ficha técnica para el taller ha sido procesada correctamente.
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Código de Pedido
                  </p>
                  <div className="flex items-center gap-1 font-mono text-base font-bold text-primary">
                    <span>{completedOrder.order_code}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(completedOrder.order_code);
                        toast.success("Código copiado al portapapeles");
                      }}
                      className="rounded p-1 hover:bg-secondary"
                      title="Copiar código"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Data Summary */}
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-stone-wash p-4 text-xs sm:grid-cols-4">
                <div>
                  <p className="text-muted-foreground">Cliente</p>
                  <p className="font-semibold text-foreground">{completedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">WhatsApp / Teléfono</p>
                  <p className="font-semibold text-foreground">{completedOrder.customer_phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Método</p>
                  <p className="font-semibold text-foreground">
                    {completedOrder.delivery_method === "compra_pieza"
                      ? "Pieza en taller"
                      : "Cliente envía pieza"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Presupuestado</p>
                  <p className="font-display text-lg text-primary">
                    {formatCOP(completedOrder.estimated_total)}
                  </p>
                </div>
              </div>

              {/* Technical Sheet: Color breakdown */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Ficha Técnica de Pintura (Despiece por Zona)
                </h3>
                <div className="mt-2 divide-y divide-border rounded-lg border border-border overflow-hidden text-xs">
                  {completedOrder.customization.map((c) => (
                    <div key={c.zone_key} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-5 w-5 shrink-0 rounded-full border border-black/20 shadow-xs"
                          style={{ backgroundColor: c.hex }}
                        />
                        <div>
                          <p className="font-medium text-foreground">{c.zone_name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            Color: {c.color_name} ({c.hex})
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="font-mono text-[11px]">
                        Acabado: {c.finish}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {completedOrder.notes && (
                <div className="rounded-lg border border-border p-3 text-xs">
                  <p className="font-semibold text-muted-foreground">Instrucciones del cliente:</p>
                  <p className="mt-1 text-foreground">{completedOrder.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="no-print flex flex-wrap gap-2 pt-2">
                <Button
                  asChild
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Enviar ficha por WhatsApp al taller
                  </a>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  className="gap-1.5"
                >
                  <Printer className="h-4 w-4" />
                  Imprimir Ficha
                </Button>

                <Button
                  asChild
                  variant="secondary"
                >
                  <Link to="/catalogo">Volver al catálogo</Link>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
}
