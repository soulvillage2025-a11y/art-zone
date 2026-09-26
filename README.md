# Paint Your World

# Product Requirements Document (PRD): TeLoPinto.com

---

## 1. Visión General del Producto

**TeLoPinto.com** es una plataforma web interactiva de personalización y cotización/pedido de pintura de productos físicos (por ejemplo: calzado, prendas, accesorios o piezas decorativas).

El sistema permite al usuario final cargar o seleccionar un modelo predeterminado, interactuar visualmente con un render/vector SVG por capas para definir el color y acabado de cada zona del objeto, y enviar la orden directamente a un panel administrativo (Dashboard de Operaciones) con el despiece exacto de colores (HEX/Pantone) y vistas previas generadas para el equipo de producción.

---

## 2. Objetivos y Métricas Clave

* **Reducción de fricción en la personalización:** Disminuir en un 80% las consultas manuales por canales de chat (WhatsApp/DM) para definir qué zonas pintar y en qué tono.
* **Cero ambigüedad en taller:** Reducir errores de producción a <1% mediante la entrega de esquemas técnicos con códigos de color exactos y un mockup digital de referencia.
* **Tiempo de configuración del cliente:** Lograr que un usuario configure y complete su solicitud en menos de 3 minutos.

---

## 3. Personas y Casos de Uso

* **Cliente Final:** Busca personalizar un artículo de forma intuitiva, previsualizar el resultado en tiempo real en web/móvil y realizar el pedido sin complicaciones técnicas.
* **Taller / Pintor (Operador):** Recibe la orden detallada, visualiza el desglose exacto por zonas/colores y actualiza el estado de producción hasta la entrega.
* **Administrador:** Gestiona el catálogo de productos disponibles, define las zonas pintables, administra la paleta de colores disponibles y supervisa las métricas de pedidos.

---

## 4. Requerimientos Funcionales

### A. Módulo de Catálogo y Selección de Producto

* **Explorador de productos:** Listado filtrable por categoría (ej. zapatillas, chaquetas, gorras, figuras).
* **Ficha de producto base:** Muestra vistas disponibles (lateral, frontal, superior), tiempo estimado de producción y precio base o variable por cantidad de zonas a intervenir.

### B. Personalizador Visual (Canvas/SVG Interactivo)

* **Sistema de Zonas / Capas:**
* Los productos se componen de vectores SVG independientes o capas Canvas estructuradas con IDs unívocos (ej. `zona_suela`, `zona_puntera`, `zona_logo`).
* Al hacer clic/tap en una zona física del modelo o en una lista lateral de componentes, la zona queda activa.


* **Selector de Color (Color Picker):**
* Paleta predeterminada: Colores oficiales disponibles en stock de pintura (nombre comercial + código HEX/Pantone).
* Opcional: Selector libre HEX si se ofrece servicio de mezcla personalizada.
* Acabados especiales (metálico, mate, brillante, degradado/neón) si aplica recargo o técnica específica.


* **Previsualización en tiempo real:**
* Renderizado instantáneo de los cambios sobre el lienzo.
* Cambio dinámico entre diferentes ángulos del producto (sincronizando el color de la zona en todas las vistas).
* Botones de control: Deshacer, Rehacer, Restablecer colores por defecto.



### C. Flujo de Checkout y Envío de Pedido

* **Resumen del diseño:** Modal que muestra:
* Thumbnail de todas las vistas del producto personalizado.
* Tabla resumen: Nombre de Zona ➔ Color seleccionado (HEX + Nombre) ➔ Acabado.
* Campo para observaciones o notas especiales del usuario (ej. iniciales, marcas particulares).


* **Captura de datos del cliente:** Nombre, correo, WhatsApp, dirección de envío y método de entrega (envío del producto por parte del cliente o compra de producto nuevo).
* **Confirmación:** Generación de un `Order ID` único con envío automático de confirmación vía correo/WhatsApp.

### D. Dashboard Operativo (Panel de Taller / Admin)

* **Listado de pedidos:** Vista Kanban o tabla filtrable por estado: *Pendiente de Aprobación*, *Esperando Producto*, *En Proceso de Pintura*, *Control de Calidad*, *Enviado*.
* **Ficha técnica de la orden (Work Order):**
* Vista visual grande del render generado.
* Botón para exportar PDF/PNG técnico para imprimir y colocar en el banco de trabajo del pintor.
* Desglose tabular de cada capa con su código de color exacto y swatch visual.


* **Gestor de Estados:** Botones para avanzar el pedido en la línea de producción y disparar notificaciones automáticas al cliente.

---

## 5. Arquitectura Técnica Sugerida

| Componente | Tecnología Recomendada | Propósito |
| --- | --- | --- |
| **Frontend** | React / Next.js + Tailwind CSS | Interfaz rápida, reactiva y adaptable a móviles. |
| **Motor Gráfico** | SVG manipulable vía DOM / Fabric.js / Konva.js | Pintado de capas en tiempo real y exportación de imágenes en alta resolución. |
| **Backend & Base de Datos** | Node.js con Supabase (PostgreSQL) o Firebase | Gestión de pedidos, autenticación de administradores y almacenamiento de renders (Storage). |
| **Exportación** | Canvas-to-Blob / html2canvas | Captura de los mockups en el momento del envío para adjuntarlos a la base de datos. |

---

## 6. Modelo de Datos Simplificado (Payload del Pedido)

```json
{
  "order_id": "TLP-2026-0891",
  "created_at": "2026-09-20T18:25:00Z",
  "customer": {
    "name": "Carlos Restrepo",
    "email": "carlos@ejemplo.com",
    "phone": "+573001234567"
  },
  "product": {
    "id": "prod_sneaker_af1",
    "name": "Zapatillas Urbanas Clásicas",
    "base_color": "#FFFFFF"
  },
  "customization": [
    { "zone_id": "puntera", "zone_name": "Puntera Frontal", "color_name": "Azul Cobalto", "hex": "#0047AB", "finish": "Mate" },
    { "zone_id": "swoosh_lateral", "zone_name": "Logo Lateral", "color_name": "Naranja Neón", "hex": "#FF5F1F", "finish": "Brillante" },
    { "zone_id": "suela", "zone_name": "Entresuela", "color_name": "Blanco Puro", "hex": "#FFFFFF", "finish": "Original" }
  ],
  "render_previews": [
    "https://storage.telopinto.com/orders/TLP-0891-lateral.png",
    "https://storage.telopinto.com/orders/TLP-0891-frontal.png"
  ],
  "status": "recibido",
  "notes": "Por favor mantener las costuras del logo en color contrastante si es posible."
}

```

---

## 7. Fases de Implementación (Roadmap MVP)

1. **Fase 1 (MVP Visual):** 1 producto demo vectorizado en SVG, selector de hasta 12 colores fijos por zona y exportación de resumen a base de datos básica.
2. **Fase 2 (Dashboard Operativo):** Panel administrativo con login, tabla de pedidos y visualización de la ficha técnica lista para pintar.
3. **Fase 3 (Pagos y Notificaciones):** Integración de pasarela de pagos (Wompi, Mercado Pago o Stripe) y avisos automáticos por correo/WhatsApp sobre el estado del pedido.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://art-zone.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d784ae34-134c-4402-ba74-2877bb7dbfc2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
