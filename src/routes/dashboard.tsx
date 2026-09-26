import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, RefreshCw, ShoppingBag, Eye } from "lucide-react";
import { formatCOP, statusLabel } from "@/lib/telopinto";
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
  delivery_method: string;
  product_name: string;
  customization: Array<{
    zone_name: string;
    color_name: string;
    hex: string;
    finish: string;
  }>;
  notes: string;
  estimated_total: number;
  status: string;
  created_at: string;
};

function DashboardPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? null);
      }
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Could not fetch remote orders:", error.message);
      } else if (data) {
        setOrders(data as unknown as OrderItem[]);
      }
    } catch (err) {
      console.warn("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.info("Sesión cerrada");
    navigate({ to: "/" });
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="eyebrow">Producción</p>
          <h1 className="mt-1 text-3xl font-medium">Panel de Control del Taller</h1>
          <p className="text-xs text-muted-foreground">
            {userEmail ? `Sesión activa: ${userEmail}` : "Vista de pedidos de taller"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchOrders} className="gap-1.5 text-xs">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1.5 text-xs">
            <LogOut className="h-3.5 w-3.5" />
            Cerrar sesión
          </Button>
        </div>
      </div>

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
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-stone-wash text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Pieza</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-secondary/40 transition-colors">
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
                      <Badge variant="outline" className="text-xs">
                        {statusLabel(o.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleDateString("es-CO")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedOrder(o)}
                        className="h-8 gap-1 text-xs"
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

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="gallery-panel w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 bg-card">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-medium">Ficha Técnica: {selectedOrder.order_code}</h3>
                <p className="text-xs text-muted-foreground">{selectedOrder.product_name}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
                Cerrar
              </Button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-stone-wash p-3 rounded-lg">
                <div>
                  <span className="text-muted-foreground">Cliente:</span>{" "}
                  <span className="font-medium text-foreground">{selectedOrder.customer_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Teléfono:</span>{" "}
                  <span className="font-medium text-foreground">{selectedOrder.customer_phone}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>{" "}
                  <span className="font-medium text-foreground">{selectedOrder.customer_email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total:</span>{" "}
                  <span className="font-medium text-primary">
                    {formatCOP(selectedOrder.estimated_total)}
                  </span>
                </div>
              </div>

              <div>
                <p className="font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Despiece de color por zona
                </p>
                <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
                  {(selectedOrder.customization ?? []).map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-4 w-4 rounded-full border border-black/20"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="font-medium">{c.zone_name}</span>
                        <span className="text-muted-foreground">({c.color_name})</span>
                      </div>
                      <Badge variant="outline">{c.finish}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="p-3 border border-border rounded-lg">
                  <p className="font-semibold text-muted-foreground">Notas del cliente:</p>
                  <p className="mt-0.5 text-foreground">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
