import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BudaSvg } from "@/components/BudaSvg";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listProducts } from "@/lib/telopinto.functions";
import { formatCOP } from "@/lib/telopinto";

const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: () => listProducts(),
});

export const Route = createFileRoute("/catalogo")({
  head: () => ({
    meta: [
      { title: "Catálogo de piezas en mármol — TeLoPinto" },
      {
        name: "description",
        content:
          "Budas de meditación, sonrientes y cabezas zen en mármol listos para personalizar con la paleta del taller.",
      },
      { property: "og:title", content: "Catálogo de piezas en mármol — TeLoPinto" },
      {
        property: "og:description",
        content: "Elige tu pieza base y define el color de cada zona antes de pedir.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  component: Catalogo,
  errorComponent: () => (
    <p className="p-10 text-center text-sm text-muted-foreground">
      No pudimos cargar el catálogo. Intenta de nuevo.
    </p>
  ),
  notFoundComponent: () => <p className="p-10 text-center">Catálogo no disponible.</p>,
});

function Catalogo() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const categories = ["Todas", ...Array.from(new Set(products.map((p) => p.category)))];
  const [filter, setFilter] = useState("Todas");
  const visible = filter === "Todas" ? products : products.filter((p) => p.category === filter);

  return (
    <main className="mx-auto max-w-6xl px-5 py-14">
      <p className="eyebrow">Catálogo</p>
      <h1 className="mt-3 text-4xl md:text-5xl">Piezas listas para intervenir</h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        Cada modelo trae sus zonas pintables definidas. El precio final depende de cuántas zonas
        intervengas y del acabado que elijas.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              filter === c
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:bg-secondary"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p) => (
          <article key={p.id} className="gallery-panel overflow-hidden">
            <div className="flex justify-center bg-stone-wash p-6">
              <BudaSvg
                variant={p.svg_variant}
                view="frontal"
                className="h-56 w-auto"
                colors={{
                  aura: "#E7E3DA",
                  rizos: "#DAD5CA",
                  rostro: "#F3F1EC",
                  manto: "#E2DED4",
                  pecho: "#F3F1EC",
                  base: "#DCD7CC",
                }}
              />
            </div>
            <div className="space-y-3 p-5">
              <Badge variant="secondary">{p.category}</Badge>
              <h2 className="text-2xl leading-tight">{p.name}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{p.description}</p>
              <div className="flex items-center justify-between pt-2 text-sm">
                <span className="font-medium">Desde {formatCOP(p.base_price)}</span>
                <span className="text-muted-foreground">{p.production_days} días</span>
              </div>
              <Button asChild className="w-full">
                <Link to="/personalizar/$slug" params={{ slug: p.slug }}>
                  Personalizar
                </Link>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
