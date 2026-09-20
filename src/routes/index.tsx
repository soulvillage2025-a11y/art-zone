import { createFileRoute, Link } from "@tanstack/react-router";
import { BudaSvg } from "@/components/BudaSvg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TeLoPinto — Budas en mármol pintados a tu medida" },
      {
        name: "description",
        content:
          "Personaliza cada zona de tu buda en mármol con colores de taller y acabados reales. Envía el pedido en menos de 3 minutos.",
      },
      { property: "og:title", content: "TeLoPinto — Budas en mármol pintados a tu medida" },
      {
        property: "og:description",
        content: "Color por zona, vista previa en vivo y ficha técnica lista para el taller.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="eyebrow">Taller de pintura sobre mármol</p>
          <h1 className="mt-4 text-5xl leading-[1.05] md:text-6xl">
            Tu buda, en los colores
            <br />
            que tú eliges.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            Pinta zona por zona sobre el modelo real, elige acabado mate, brillante o metálico y
            envía la orden al taller con el despiece exacto de color. Sin chats interminables.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/catalogo">Empezar a personalizar</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/catalogo">Ver catálogo</Link>
            </Button>
          </div>
          <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-6">
            {[
              ["3 min", "para configurar"],
              ["12", "colores de taller"],
              ["<1%", "error en producción"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="font-display text-3xl">{value}</dt>
                <dd className="text-xs text-muted-foreground">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="gallery-panel flex items-center justify-center bg-stone-wash p-8">
          <BudaSvg
            variant="buda_completo"
            view="frontal"
            className="h-[420px] w-auto"
            colors={{
              aura: "#0047AB",
              rizos: "#12284C",
              rostro: "#F3F1EC",
              manto: "#C8222B",
              pecho: "#F3F1EC",
              base: "#B08D3F",
            }}
            finishes={{ aura: "Mate", manto: "Brillante", base: "Metálico" }}
          />
        </div>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-3">
          {[
            {
              n: "01",
              t: "Elige tu pieza",
              d: "Budas de meditación, sonrientes o cabezas zen en mármol listos para intervenir.",
            },
            {
              n: "02",
              t: "Pinta cada zona",
              d: "Toca una zona del modelo, elige color de la paleta del taller y su acabado.",
            },
            {
              n: "03",
              t: "Envía la orden",
              d: "Recibes un código de pedido y el taller obtiene la ficha técnica con HEX y Pantone.",
            },
          ].map((s) => (
            <div key={s.n}>
              <p className="eyebrow">{s.n}</p>
              <h3 className="mt-3 text-2xl">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-10 text-center text-xs text-muted-foreground">
        TeLoPinto.com — Pintura artesanal sobre piezas en mármol.
      </footer>
    </main>
  );
}
