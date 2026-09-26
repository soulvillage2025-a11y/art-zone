export interface ExtraProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  svg_variant: string;
  base_price: number;
  price_per_zone: number;
  production_days: number;
  image_url?: string;
  reference_image_url?: string;
  sort_order: number;
  zones: Array<{
    zone_key: string;
    zone_name: string;
    default_hex: string;
    sort_order: number;
    original_hex: string;
    original_color_name: string;
    original_finish: "Original" | "Mate" | "Brillante" | "Metálico";
  }>;
}

export const EXTRA_PRODUCTS: ExtraProduct[] = [
  {
    id: "7a1c8f42-9e3d-4c6b-8a5f-buda-bendicion",
    slug: "buda-bendicion",
    name: "Buda de la Bendición en Mármol",
    category: "Figuras",
    description:
      "Escultura sagrada en postura de loto con mudra de bendición y protección (Abhaya Mudra), túnica drapeada con finos relieves y gargantilla floral. Tallada en mármol blanco, lista para intervenir con la paleta de taller.",
    svg_variant: "buda_bendicion",
    base_price: 195000,
    price_per_zone: 35000,
    production_days: 7,
    image_url: "/images/buda-bendicion-blanco.jpg",
    reference_image_url: "/images/buda-bendicion-original.jpg",
    sort_order: 4,
    zones: [
      {
        zone_key: "manto",
        zone_name: "Manto / Túnica Grabada",
        default_hex: "#EDE9E3", // Blanco mármol suave
        sort_order: 1,
        original_hex: "#D9A520", // Amarillo Ocre / Dorado de la foto
        original_color_name: "Amarillo Ocre",
        original_finish: "Brillante",
      },
      {
        zone_key: "piel",
        zone_name: "Piel y Torso (Rostro, Pecho y Manos)",
        default_hex: "#F5F3EF", // Blanco mármol pulido
        sort_order: 2,
        original_hex: "#161616", // Negro Ónix / Ébano chocolate de la foto
        original_color_name: "Negro Ónix",
        original_finish: "Brillante",
      },
      {
        zone_key: "rizos",
        zone_name: "Rizos y Ushnisha (Cabello)",
        default_hex: "#DAD5CA", // Blanco mármol texturizado
        sort_order: 3,
        original_hex: "#B08D3F", // Oro viejo de la foto
        original_color_name: "Oro Viejo",
        original_finish: "Metálico",
      },
      {
        zone_key: "collar",
        zone_name: "Collar de Perlas y Dije Floral",
        default_hex: "#FDFCFB", // Blanco puro alabastro
        sort_order: 4,
        original_hex: "#F3F1EC", // Blanco Mármol nácar de la foto
        original_color_name: "Blanco Mármol",
        original_finish: "Brillante",
      },
      {
        zone_key: "detalles",
        zone_name: "Urna (Bindi) y Cenefas",
        default_hex: "#E7E3DA", // Blanco mármol satinado
        sort_order: 5,
        original_hex: "#B08D3F", // Oro viejo de los detalles
        original_color_name: "Oro Viejo",
        original_finish: "Metálico",
      },
    ],
  },
];
