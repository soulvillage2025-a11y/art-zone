import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BudaSvg, type View } from "@/components/BudaSvg";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LogOut,
  RefreshCw,
  ShoppingBag,
  Eye,
  CheckCircle2,
  Clock,
  Paintbrush,
  ShieldCheck,
  Send,
  Printer,
  MessageCircle,
} from "lucide-react";
import {
  formatCOP,
  statusLabel,
  ORDER_STATUSES,
  type OrderStatus,
  type Finish,
} from "@/lib/telopinto";
import { listOrders, updateOrderStatus } from "@/lib/telopinto.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Panel del Taller — TeLoPinto" }],
  }),
  component: DashboardPage,
});

type OrderItem = {
  id: string;
  order_code: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address?: string;
  delivery_method: string;
  product_name: string;
  customization: Array<{
    zone_key?: string;
    zone_name: string;
    color_name: string;
    hex: string;
    finish: string;
  }>;
  notes: string;
  estimated_total: number;
  status: OrderStatus | string;
  created_at: string;
};

export function DashboardPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [modalView, setModalView] = useState<View>("frontal");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const localUser =
        typeof window !== "undefined" ? localStorage.getItem("telopinto_user") : null;
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserEmail(user.email ?? null);
      } else if (localUser) {
        setUserEmail(localUser);
      }

      // 1. Fetch from server function (combines server file store + Supabase)
      let serverOrders: OrderItem[] = [];
      try {
        const fetched = await listOrders();
        if (Array.isArray(fetched)) {
          serverOrders = fetched as unknown as OrderItem[];
        }
      } catch (err) {
        console.warn("Could not fetch server orders:", err);
      }

      // 2. Fetch from browser localStorage backup
      let localClientOrders: OrderItem[] = [];
      try {
        const raw = localStorage.getItem("telopinto_client_orders");
        if (raw) {
          localClientOrders = JSON.parse(raw);
        }
      } catch (err) {
        console.warn("Could not parse local client orders:", err);
      }

      // 3. Merge and deduplicate by order_code
      const mergedMap = new Map<string, OrderItem>();
      for (const o of serverOrders) {
        mergedMap.set(o.order_code, o);
      }
      for (const o of localClientOrders) {
        if (!mergedMap.has(o.order_code)) {
          mergedMap.set(o.order_code, o);
        }
      }

      const mergedList = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setOrders(mergedList);
    } catch (err) {
      console.warn("Global fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSignOut = async () => {
    localStorage.removeItem("telopinto_role");
    localStorage.removeItem("telopinto_user");
    await supabase.auth.signOut();
    toast.info("Sesión cerrada");
    navigate({ to: "/" });
  };

  const handleChangeStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus({
        data: {
          id: orderId,
          status: newStatus as any,
        },
      });

      // Update in state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId || o.order_code === orderId ? { ...o, status: newStatus } : o
        )
      );

      // Update in localStorage
      try {
        const raw = localStorage.getItem("telopinto_client_orders");
        if (raw) {
          const list: OrderItem[] = JSON.parse(raw);
          const item = list.find((o) => o.id === orderId || o.order_code === orderId);
          if (item) {
            item.status = newStatus;
            localStorage.setItem("telopinto_client_orders", JSON.stringify(list));
          }
        }
      } catch (e) {}

      if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.order_code === orderId)) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      toast.success(`Estado actualizado: ${statusLabel(newStatus)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al actualizar estado";
      toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  // Derive SVG variant from product name
  const selectedVariant = useMemo(() => {
    if (!selectedOrder) return "buda_completo";
    const name = (selectedOrder.product_name || "").toLowerCase();
    if (name.includes("sonriente")) return "buda_sonriente";
    if (name.includes("cabeza") || name.includes("zen")) return "cabeza_zen";
    return "buda_completo";
  }, [selectedOrder]);

  // Derive colors and finishes map for BudaSvg
  const { selectedColors, selectedFinishes } = useMemo(() => {
    if (!selectedOrder) return { selectedColors: {}, selectedFinishes: {} };

    const colorsMap: Record<string, string> = {};
    const finishesMap: Record<string, Finish> = {};

    for (const c of selectedOrder.customization || []) {
      let key = c.zone_key;
      if (!key) {
        const name = (c.zone_name || "").toLowerCase();
        if (name.includes("pedestal") || name.includes("base")) key = "base";
        else if (
          name.includes("rizos") ||
          name.includes("cabello") ||
          name.includes("cabeza")
        )
          key = "rizos";
        else if (name.includes("rostro") || name.includes("cara")) key = "rostro";
        else if (name.includes("manto") || name.includes("túnica")) key = "manto";
        else if (name.includes("pecho") || name.includes("vientre")) key = "pecho";
        else if (name.includes("aura") || name.includes("halo")) key = "aura";
      }
      if (key) {
        colorsMap[key] = c.hex;
        finishesMap[key] = (c.finish as Finish) || "Original";
      }
    }

    return { selectedColors: colorsMap, selectedFinishes: finishesMap };
  }, [selectedOrder]);

  // Metrics
  const metrics = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.estimated_total || 0), 0);
    const pending = orders.filter((o) => o.status === "pendiente_aprobacion").length;
    const inProgress = orders.filter(
      (o) => o.status === "en_pintura" || o.status === "esperando_producto"
    ).length;
    const completed = orders.filter(
      (o) => o.status === "control_calidad" || o.status === "enviado"
    ).length;

    return {
      total: orders.length,
      revenue: totalRevenue,
      pending,
      inProgress,
      completed,
    };
  }, [orders]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendiente_aprobacion":
        return (
          <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-600">
            <Clock className="mr-1 h-3 w-3" />
            Pendiente
          </Badge>
        );
      case "esperando_producto":
        return (
          <Badge variant="outline" className="border-blue-500/40 bg-blue-500/10 text-blue-600">
            Esperando pieza
          </Badge>
        );
      case "en_pintura":
        return (
          <Badge variant="outline" className="border-purple-500/40 bg-purple-500/10 text-purple-600">
            <Paintbrush className="mr-1 h-3 w-3" />
            En pintura
          </Badge>
        );
      case "control_calidad":
        return (
          <Badge variant="outline" className="border-teal-500/40 bg-teal-500/10 text-teal-600">
            <ShieldCheck className="mr-1 h-3 w-3" />
            Control calidad
          </Badge>
        );
      case "enviado":
        return (
          <Badge variant="outline" className="border-green-600/40 bg-green-600/10 text-green-700">
            <Send className="mr-1 h-3 w-3" />
            Enviado
          </Badge>
        );
      default:
        return <Badge variant="outline">{statusLabel(status)}</Badge>;
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      {/* Top Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="eyebrow">Área de Producción</p>
          <h1 className="mt-1 text-3xl font-medium tracking-tight">Panel del Taller</h1>
          <p className="text-xs text-muted-foreground">
            {userEmail ? `Sesión: ${userEmail}` : "Vista de pedidos de taller"} • Actualización en vivo
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchOrders} className="gap-1.5 text-xs">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Actualizar pedidos
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1.5 text-xs">
            <LogOut className="h-3.5 w-3.5" />
            Cerrar sesión
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Pedidos</p>
          <p className="mt-2 font-display text-3xl text-foreground">{metrics.total}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <p className="text-xs uppercase tracking-wider text-amber-600">Por Aprobar</p>
          <p className="mt-2 font-display text-3xl text-amber-600">{metrics.pending}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <p className="text-xs uppercase tracking-wider text-purple-600">En Taller</p>
          <p className="mt-2 font-display text-3xl text-purple-600">{metrics.inProgress}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <p className="text-xs uppercase tracking-wider text-primary">Facturación</p>
          <p className="mt-2 font-display text-2xl text-primary">{formatCOP(metrics.revenue)}</p>
        </div>
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          Cargando pedidos del taller...
        </div>
      ) : orders.length === 0 ? (
        <div className="gallery-panel p-12 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h2 className="mt-4 text-xl">Sin pedidos pendientes</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Aún no se han registrado órdenes en la plataforma.
          </p>
          <Button asChild className="mt-6">
            <Link to="/catalogo">Ir al catálogo a crear un pedido</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-stone-wash text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Pieza</th>
                  <th className="px-4 py-3">Presupuesto</th>
                  <th className="px-4 py-3">Estado Actual</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => (
                  <tr key={o.id || o.order_code} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-primary">
                      {o.order_code}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{o.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{o.customer_phone}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{o.product_name}</td>
                    <td className="px-4 py-3 font-medium">{formatCOP(o.estimated_total)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        disabled={updatingId === o.id || updatingId === o.order_code}
                        onChange={(e) => handleChangeStatus(o.id || o.order_code, e.target.value)}
                        className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s.key} value={s.key}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleDateString("es-CO", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(o);
                          setModalView("frontal");
                        }}
                        className="h-8 gap-1.5 text-xs"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Ver despiece
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal with Visual Buddha Reference */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="gallery-panel w-full max-w-4xl max-h-[92vh] overflow-y-auto p-6 bg-card print:max-w-none print:max-h-none print:p-0">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-medium tracking-tight">
                    Ficha Técnica: {selectedOrder.order_code}
                  </h3>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <p className="text-sm text-muted-foreground">{selectedOrder.product_name}</p>
              </div>

              <div className="no-print flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="gap-1.5 text-xs"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Imprimir Ficha
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
                  Cerrar
                </Button>
              </div>
            </div>

            {/* Modal Body: 2-Column Responsive Layout */}
            <div className="mt-5 grid gap-6 md:grid-cols-12">
              {/* Left Column (5 cols): Rendered Figure (Visual Reference) */}
              <div className="md:col-span-5 flex flex-col">
                <div className="gallery-panel flex-1 bg-stone-wash p-4 rounded-xl border border-border flex flex-col items-center justify-between text-center">
                  <div className="w-full flex items-center justify-between border-b border-border/60 pb-2.5">
                    <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Paintbrush className="h-3.5 w-3.5 text-primary" />
                      Referencia Visual
                    </span>

                    <div className="no-print flex rounded-md border border-border bg-background p-0.5 text-xs shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setModalView("frontal")}
                        className={`rounded-xs px-2.5 py-0.5 font-medium transition-colors ${
                          modalView === "frontal"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Frontal
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalView("lateral")}
                        className={`rounded-xs px-2.5 py-0.5 font-medium transition-colors ${
                          modalView === "lateral"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Lateral
                      </button>
                    </div>
                  </div>

                  {/* The Rendered Buddha SVG */}
                  <div className="my-4 flex items-center justify-center min-h-[300px] w-full">
                    <BudaSvg
                      variant={selectedVariant}
                      view={modalView}
                      colors={selectedColors}
                      finishes={selectedFinishes}
                      className="h-72 w-auto max-w-full drop-shadow-md transition-all"
                    />
                  </div>

                  <div className="w-full rounded-lg bg-background/80 p-2.5 border border-border/50 text-[11px] text-muted-foreground">
                    💡 Modelo pintado con los colores y acabados exactos seleccionados por el cliente.
                  </div>
                </div>
              </div>

              {/* Right Column (7 cols): Client Data, Status Changer & Despiece Table */}
              <div className="md:col-span-7 space-y-4">
                {/* Client Info Grid */}
                <div className="grid grid-cols-2 gap-3 bg-stone-wash p-3.5 rounded-xl border border-border text-xs">
                  <div>
                    <span className="text-muted-foreground">Cliente:</span>
                    <p className="font-semibold text-foreground text-sm">
                      {selectedOrder.customer_name}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Teléfono / WhatsApp:</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-semibold text-foreground">
                        {selectedOrder.customer_phone}
                      </span>
                      <a
                        href={`https://wa.me/${selectedOrder.customer_phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700"
                        title="Chat de WhatsApp"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Correo:</span>
                    <p className="font-medium text-foreground truncate">
                      {selectedOrder.customer_email}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Presupuesto Total:</span>
                    <p className="font-display text-lg text-primary">
                      {formatCOP(selectedOrder.estimated_total)}
                    </p>
                  </div>
                  {selectedOrder.shipping_address && (
                    <div className="col-span-2 border-t border-border/50 pt-2">
                      <span className="text-muted-foreground">Dirección de despacho:</span>
                      <p className="font-medium text-foreground">{selectedOrder.shipping_address}</p>
                    </div>
                  )}
                </div>

                {/* Status Changer in Modal */}
                <div className="no-print flex items-center justify-between rounded-xl border border-border p-3 text-xs bg-card">
                  <span className="font-medium">Cambiar estado del pedido:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) =>
                      handleChangeStatus(
                        selectedOrder.id || selectedOrder.order_code,
                        e.target.value
                      )
                    }
                    className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Technical Despiece Table */}
                <div>
                  <p className="font-semibold text-muted-foreground uppercase tracking-wider text-xs mb-2">
                    Despiece de color por zona (Taller)
                  </p>
                  <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-card text-xs">
                    {(selectedOrder.customization ?? []).map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 hover:bg-secondary/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="h-5 w-5 shrink-0 rounded-full border border-black/20 shadow-xs"
                            style={{ backgroundColor: c.hex }}
                          />
                          <div>
                            <p className="font-semibold text-foreground">{c.zone_name}</p>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              {c.color_name} • {c.hex}
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

                {selectedOrder.notes && (
                  <div className="p-3 border border-border rounded-xl bg-stone-wash/60 text-xs">
                    <p className="font-semibold text-muted-foreground">Notas del cliente:</p>
                    <p className="mt-1 text-foreground leading-relaxed">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
