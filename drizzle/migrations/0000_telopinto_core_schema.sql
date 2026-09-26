-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin', 'operador', 'cliente');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- El primer usuario registrado se vuelve admin del taller
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'operador');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PRODUCTOS
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  description text NOT NULL DEFAULT '',
  svg_variant text NOT NULL DEFAULT 'buda_completo',
  base_price integer NOT NULL DEFAULT 0,
  price_per_zone integer NOT NULL DEFAULT 0,
  production_days integer NOT NULL DEFAULT 5,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Catalogo publico" ON public.products FOR SELECT TO anon, authenticated USING (active);
CREATE POLICY "Admin gestiona productos" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.product_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  zone_key text NOT NULL,
  zone_name text NOT NULL,
  default_hex text NOT NULL DEFAULT '#EFEDE7',
  sort_order integer NOT NULL DEFAULT 0,
  UNIQUE (product_id, zone_key)
);
GRANT SELECT ON public.product_zones TO anon, authenticated;
GRANT ALL ON public.product_zones TO service_role;
ALTER TABLE public.product_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Zonas publicas" ON public.product_zones FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin gestiona zonas" ON public.product_zones FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PALETA
CREATE TABLE public.palette_colors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  hex text NOT NULL,
  pantone text,
  family text NOT NULL DEFAULT 'general',
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.palette_colors TO anon, authenticated;
GRANT ALL ON public.palette_colors TO service_role;
ALTER TABLE public.palette_colors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Paleta publica" ON public.palette_colors FOR SELECT TO anon, authenticated USING (active);
CREATE POLICY "Admin gestiona paleta" ON public.palette_colors FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PEDIDOS
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  shipping_address text NOT NULL DEFAULT '',
  delivery_method text NOT NULL DEFAULT 'cliente_envia',
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  customization jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text NOT NULL DEFAULT '',
  estimated_total integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pendiente_aprobacion',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Taller lee pedidos" ON public.orders FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operador'));
CREATE POLICY "Taller actualiza pedidos" ON public.orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operador'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operador'));
CREATE POLICY "Admin borra pedidos" ON public.orders FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX orders_status_idx ON public.orders (status, created_at DESC);

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER orders_touch_updated BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- SEED PRODUCTOS
INSERT INTO public.products (slug, name, category, description, svg_variant, base_price, price_per_zone, production_days, sort_order) VALUES
('buda-meditacion', 'Buda Meditación en Mármol', 'Figuras', 'Figura clásica en posición dhyana, tallada en mármol blanco. Ideal para intervenciones de color en manto, aura y base de loto.', 'buda_completo', 180000, 35000, 7, 1),
('buda-sonriente', 'Buda Sonriente de la Fortuna', 'Figuras', 'Pieza redondeada en mármol con superficie amplia, perfecta para acabados metálicos y contrastes vivos.', 'buda_sonriente', 210000, 35000, 8, 2),
('cabeza-zen', 'Cabeza Zen en Mármol', 'Decorativos', 'Busto minimalista de líneas limpias. Pocas zonas, máximo impacto visual sobre pedestal.', 'cabeza_zen', 150000, 30000, 5, 3),
('buda-bendicion', 'Buda de la Bendición en Mármol', 'Figuras', 'Escultura sagrada en postura de loto con mudra de bendición y protección (Abhaya Mudra), túnica drapeada con finos relieves y gargantilla floral. Tallada en mármol blanco.', 'buda_bendicion', 195000, 35000, 7, 4);

INSERT INTO public.product_zones (product_id, zone_key, zone_name, default_hex, sort_order)
SELECT p.id, z.zone_key, z.zone_name, z.default_hex, z.sort_order
FROM public.products p
JOIN (VALUES
  ('buda-meditacion','aura','Aura / Halo','#E7E3DA',1),
  ('buda-meditacion','rizos','Rizos del cabello','#DAD5CA',2),
  ('buda-meditacion','rostro','Rostro y manos','#F3F1EC',3),
  ('buda-meditacion','manto','Manto / Túnica','#E2DED4',4),
  ('buda-meditacion','pecho','Pecho descubierto','#F3F1EC',5),
  ('buda-meditacion','base','Base de loto','#DCD7CC',6),
  ('buda-sonriente','aura','Aura / Halo','#E7E3DA',1),
  ('buda-sonriente','rizos','Cabeza','#DAD5CA',2),
  ('buda-sonriente','rostro','Rostro','#F3F1EC',3),
  ('buda-sonriente','manto','Túnica','#E2DED4',4),
  ('buda-sonriente','pecho','Vientre','#F3F1EC',5),
  ('buda-sonriente','base','Base','#DCD7CC',6),
  ('cabeza-zen','rizos','Rizos del cabello','#DAD5CA',1),
  ('cabeza-zen','rostro','Rostro','#F3F1EC',2),
  ('cabeza-zen','base','Pedestal','#DCD7CC',3),
  ('buda-bendicion','manto','Manto / Túnica Grabada','#EDE9E3',1),
  ('buda-bendicion','piel','Piel y Torso (Rostro, Pecho y Manos)','#F5F3EF',2),
  ('buda-bendicion','rizos','Rizos y Ushnisha (Cabello)','#DAD5CA',3),
  ('buda-bendicion','collar','Collar de Perlas y Dije Floral','#FDFCFB',4),
  ('buda-bendicion','detalles','Urna (Bindi) y Cenefas','#E7E3DA',5)
) AS z(slug, zone_key, zone_name, default_hex, sort_order) ON z.slug = p.slug;

-- SEED PALETA (12 colores de taller)
INSERT INTO public.palette_colors (name, hex, pantone, family, sort_order) VALUES
('Blanco Mármol', '#F3F1EC', '11-0601 TCX', 'neutros', 1),
('Gris Piedra', '#B8B3A8', 'Cool Gray 5 C', 'neutros', 2),
('Negro Ónix', '#161616', 'Black 6 C', 'neutros', 3),
('Azul Cobalto', '#0047AB', '2935 C', 'frios', 4),
('Azul Noche', '#12284C', '289 C', 'frios', 5),
('Verde Jade', '#1C7C63', '3295 C', 'frios', 6),
('Turquesa Zen', '#37A9B8', '7710 C', 'frios', 7),
('Rojo Bermellón', '#C8222B', '186 C', 'calidos', 8),
('Naranja Azafrán', '#E8761F', '1595 C', 'calidos', 9),
('Amarillo Ocre', '#D9A520', '7409 C', 'calidos', 10),
('Oro Viejo', '#B08D3F', '8640 C', 'metalicos', 11),
('Cobre Antiguo', '#8C4A2F', '7526 C', 'metalicos', 12);