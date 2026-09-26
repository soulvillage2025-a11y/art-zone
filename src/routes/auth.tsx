import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [{ title: "Acceso Taller — TeLoPinto" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Sesión iniciada correctamente");
        navigate({ to: "/dashboard" });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.session) {
          toast.success("¡Cuenta creada y configurada como Administrador!");
          navigate({ to: "/dashboard" });
        } else {
          toast.success(
            "Cuenta registrada. Si Supabase tiene confirmación de correo activa, por favor revisa tu bandeja de entrada o inicia sesión."
          );
          setMode("login");
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al procesar la solicitud";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center justify-center px-4 py-12">
      <div className="gallery-panel w-full p-8 shadow-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="h-6 w-6" />
          </div>
          <p className="eyebrow">Área de Taller</p>
          <h1 className="mt-2 text-2xl font-medium">
            {mode === "login" ? "Acceso para Operadores" : "Registrar Administrador"}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {mode === "login"
              ? "Ingresa con tus credenciales de taller."
              : "El primer usuario registrado se convierte automáticamente en Administrador del taller."}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="mb-6 grid grid-cols-2 rounded-lg border border-border bg-stone-wash p-1 text-xs">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-md py-1.5 font-medium transition-colors ${
              mode === "login"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`rounded-md py-1.5 font-medium transition-colors ${
              mode === "register"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu-correo@tudominio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="Contraseña segura (mín. 8 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? mode === "login"
                ? "Iniciando sesión..."
                : "Creando cuenta..."
              : mode === "login"
                ? "Ingresar al panel"
                : "Crear cuenta de Administrador"}
          </Button>

          <div className="pt-2 text-center text-xs text-muted-foreground">
            <Link to="/catalogo" className="hover:underline">
              ← Volver al catálogo de clientes
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
