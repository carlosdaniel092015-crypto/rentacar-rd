"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Categoria } from "@/types/database.types";

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [creando, setCreando] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [slug, setSlug] = useState("");
  const [editNombre, setEditNombre] = useState("");

  const supabase = createClient();

  const cargar = async () => {
    const { data } = await supabase.from("categorias").select("*").order("nombre");
    setCategorias(data ?? []);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const slugificar = (text: string) =>
    text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleNombreChange = (v: string) => {
    setNombre(v);
    setSlug(slugificar(v));
  };

  const crear = async () => {
    if (!nombre.trim()) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("categorias") as any).insert({ nombre: nombre.trim(), slug: slug || slugificar(nombre) });
    if (error) {
      toast.error(error.code === "23505" ? "Ya existe una categoría con ese nombre." : "Error creando categoría.");
      return;
    }
    toast.success("Categoría creada.");
    setCreando(false);
    setNombre("");
    setSlug("");
    cargar();
  };

  const guardarEdicion = async (id: string) => {
    if (!editNombre.trim()) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("categorias") as any).update({ nombre: editNombre.trim() }).eq("id", id);
    if (error) { toast.error("Error actualizando."); return; }
    toast.success("Categoría actualizada.");
    setEditando(null);
    cargar();
  };

  const eliminar = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar la categoría "${nombre}"? Los vehículos con esta categoría quedarán sin categoría asignada.`)) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("categorias") as any).delete().eq("id", id);
    if (error) { toast.error("Error eliminando."); return; }
    toast.success("Categoría eliminada.");
    cargar();
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Categorías</h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">Gestiona las categorías de vehículos</p>
        </div>
        <Button variant="accent" onClick={() => { setCreando(true); setNombre(""); setSlug(""); }}>
          <Plus className="size-4 mr-2" />
          Nueva categoría
        </Button>
      </div>

      {/* Formulario crear */}
      {creando && (
        <div className="mb-4 border border-[var(--color-border)] rounded-[var(--radius-xl)] p-4 bg-[var(--color-surface)] space-y-3">
          <h2 className="font-semibold text-sm">Nueva categoría</h2>
          <div>
            <Label>Nombre</Label>
            <Input className="mt-1" placeholder="ej. Compacto" value={nombre} onChange={(e) => handleNombreChange(e.target.value)} autoFocus />
          </div>
          <div>
            <Label>Slug (generado automático)</Label>
            <Input className="mt-1" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="ej. compacto" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="accent" onClick={crear} disabled={!nombre.trim()}>
              <Check className="size-4 mr-1" /> Crear
            </Button>
            <Button size="sm" variant="outline" onClick={() => setCreando(false)}>
              <X className="size-4 mr-1" /> Cancelar
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">Cargando...</p>
      ) : (
        <div className="border border-[var(--color-border)] rounded-[var(--radius-xl)] overflow-hidden">
          {categorias.length === 0 ? (
            <div className="p-8 text-center text-[var(--color-muted-foreground)] text-sm">No hay categorías todavía.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-muted)] text-[var(--color-muted-foreground)]">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {categorias.map((cat) => (
                  <tr key={cat.id} className="bg-[var(--color-surface)] hover:bg-[var(--color-muted)]/40 transition-colors">
                    <td className="px-4 py-3">
                      {editando === cat.id ? (
                        <Input
                          value={editNombre}
                          onChange={(e) => setEditNombre(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && guardarEdicion(cat.id)}
                          autoFocus
                          className="h-8 text-sm"
                        />
                      ) : (
                        <span className="font-medium">{cat.nombre}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-muted-foreground)] font-mono text-xs">{cat.slug}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {editando === cat.id ? (
                          <>
                            <button onClick={() => guardarEdicion(cat.id)} className="p-1.5 rounded hover:bg-green-100 text-green-600 transition-colors">
                              <Check className="size-4" />
                            </button>
                            <button onClick={() => setEditando(null)} className="p-1.5 rounded hover:bg-[var(--color-muted)] transition-colors">
                              <X className="size-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => { setEditando(cat.id); setEditNombre(cat.nombre); }}
                              className="p-1.5 rounded hover:bg-[var(--color-muted)] transition-colors text-[var(--color-muted-foreground)]"
                            >
                              <Pencil className="size-4" />
                            </button>
                            <button
                              onClick={() => eliminar(cat.id, cat.nombre)}
                              className="p-1.5 rounded hover:bg-red-100 text-red-500 transition-colors"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
