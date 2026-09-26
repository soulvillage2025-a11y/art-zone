import fs from "node:fs";
import path from "node:path";
import type { ZoneSelection } from "./telopinto";

export type StoredOrder = {
  id: string;
  order_code: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  delivery_method: string;
  product_id: string | null;
  product_name: string;
  customization: ZoneSelection[];
  notes: string;
  estimated_total: number;
  status: string;
  created_at: string;
};

const ORDERS_FILE = path.resolve(process.cwd(), ".orders-store.json");

export function getStoredOrders(): StoredOrder[] {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const content = fs.readFileSync(ORDERS_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("[OrdersStorage] Read error:", err);
  }
  return [];
}

export function saveStoredOrder(order: StoredOrder): StoredOrder {
  try {
    const list = getStoredOrders();
    const idx = list.findIndex((o) => o.order_code === order.order_code || o.id === order.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...order };
    } else {
      list.unshift(order);
    }
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.warn("[OrdersStorage] Write error:", err);
  }
  return order;
}

export function updateStoredOrderStatus(id: string, status: string): boolean {
  try {
    const list = getStoredOrders();
    const item = list.find((o) => o.id === id || o.order_code === id);
    if (item) {
      item.status = status;
      fs.writeFileSync(ORDERS_FILE, JSON.stringify(list, null, 2), "utf-8");
      return true;
    }
  } catch (err) {
    console.warn("[OrdersStorage] Update error:", err);
  }
  return false;
}
