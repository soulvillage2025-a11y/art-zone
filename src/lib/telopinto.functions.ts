import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
          h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("products")
    .select("id, slug, name, category, description, svg_variant, base_price, price_per_zone, production_days")
    .eq("active", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getProductDetail = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => z.object({ slug: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const [{ data: product, error: pErr }, { data: palette, error: cErr }] = await Promise.all([
      sb
        .from("products")
        .select("id, slug, name, category, description, svg_variant, base_price, price_per_zone, production_days")
        .eq("slug", data.slug)
        .eq("active", true)
        .maybeSingle(),
      sb
        .from("palette_colors")
        .select("id, name, hex, pantone, family")
        .eq("active", true)
        .order("sort_order"),
    ]);
    if (pErr) throw new Error(pErr.message);
    if (cErr) throw new Error(cErr.message);
    if (!product) return null;
    const { data: zones, error: zErr } = await sb
      .from("product_zones")
      .select("zone_key, zone_name, default_hex, sort_order")
      .eq("product_id", product.id)
      .order("sort_order");
    if (zErr) throw new Error(zErr.message);
    return { product, zones: zones ?? [], palette: palette ?? [] };
  });

const zoneSchema = z.object({
  zone_key: z.string().max(60),
  zone_name: z.string().max(80),
  color_name: z.string().max(80),
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  finish: z.enum(["Original", "Mate", "Brillante", "Metálico"]),
});

const orderSchema = z.object({
  product_id: z.string().uuid(),
  customer_name: z.string().trim().min(2).max(100),
  customer_email: z.string().trim().email().max(255),
  customer_phone: z.string().trim().min(7).max(30),
  shipping_address: z.string().trim().max(300).default(""),
  delivery_method: z.enum(["cliente_envia", "compra_pieza"]),
  notes: z.string().trim().max(1000).default(""),
  customization: z.array(zoneSchema).min(1).max(20),
});

// In-memory fallback for local development or when service_role key is not configured
const fallbackOrders: Array<{
  id: string;
  order_code: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  delivery_method: string;
  product_id: string | null;
  product_name: string;
  customization: unknown;
  notes: string;
  estimated_total: number;
  status: string;
  created_at: string;
}> = [];

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => orderSchema.parse(input))
  .handler(async ({ data }) => {
    const sb = publicClient();

    const { data: product, error: pErr } = await sb
      .from("products")
      .select("id, name, base_price, price_per_zone")
      .eq("id", data.product_id)
      .maybeSingle();
    if (pErr) throw new Error(pErr.message);
    if (!product) throw new Error("Producto no disponible");

    const { data: zones } = await sb
      .from("product_zones")
      .select("zone_key, default_hex")
      .eq("product_id", product.id);
    const defaults = new Map((zones ?? []).map((z) => [z.zone_key, z.default_hex.toLowerCase()]));

    const surcharge: Record<string, number> = {
      Original: 0,
      Mate: 0,
      Brillante: 8000,
      "Metálico": 15000,
    };
    let total = product.base_price;
    for (const z of data.customization) {
      if (defaults.get(z.zone_key) !== z.hex.toLowerCase()) {
        total += product.price_per_zone + (surcharge[z.finish] ?? 0);
      }
    }

    const year = new Date().getFullYear();
    const code = `TLP-${year}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Try supabaseAdmin if service role key is present
    if (process.env["SUPABASE_SERVICE_ROLE_KEY"]) {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: inserted, error } = await supabaseAdmin
          .from("orders")
          .insert({
            order_code: code,
            customer_name: data.customer_name,
            customer_email: data.customer_email,
            customer_phone: data.customer_phone,
            shipping_address: data.shipping_address,
            delivery_method: data.delivery_method,
            product_id: product.id,
            product_name: product.name,
            customization: data.customization,
            notes: data.notes,
            estimated_total: total,
            status: "pendiente_aprobacion",
          })
          .select("order_code, estimated_total")
          .single();

        if (!error && inserted) {
          return {
            order_code: inserted.order_code,
            estimated_total: inserted.estimated_total,
            product_name: product.name,
            customer_name: data.customer_name,
            customer_email: data.customer_email,
            customer_phone: data.customer_phone,
            delivery_method: data.delivery_method,
            shipping_address: data.shipping_address,
            notes: data.notes,
            customization: data.customization,
          };
        }
        console.warn("[createOrder] Supabase insert warning:", error?.message);
      } catch (err) {
        console.warn("[createOrder] Supabase admin error:", err);
      }
    }

    // Fallback store
    const localOrder = {
      id: crypto.randomUUID(),
      order_code: code,
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      shipping_address: data.shipping_address,
      delivery_method: data.delivery_method,
      product_id: product.id,
      product_name: product.name,
      customization: data.customization,
      notes: data.notes,
      estimated_total: total,
      status: "pendiente_aprobacion",
      created_at: new Date().toISOString(),
    };
    fallbackOrders.unshift(localOrder);

    return {
      order_code: code,
      estimated_total: total,
      product_name: product.name,
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      delivery_method: data.delivery_method,
      shipping_address: data.shipping_address,
      notes: data.notes,
      customization: data.customization,
    };
  });

export const listOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("orders")
      .select(
        "id, order_code, customer_name, customer_email, customer_phone, shipping_address, delivery_method, product_name, customization, notes, estimated_total, status, created_at, products(svg_variant)",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum([
          "pendiente_aprobacion",
          "esperando_producto",
          "en_pintura",
          "control_calidad",
          "enviado",
        ]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
