"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X, Upload, Star } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { vehiculoSchema, type VehiculoFormData } from "@/lib/validations/vehiculo.schema";
import { TRANSMISIONES, COMBUSTIBLES } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { YearPicker } from "@/components/ui/year-picker";
import type { Vehiculo, Categoria } from "@/types/database.types";

interface VehicleFormProps {
  vehiculo?: Vehiculo;
  mode: "create" | "edit";
}

export function VehicleForm({ vehiculo, mode }: VehicleFormProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("categorias").select("*").order("nombre").then(({ data }) => {
      if (data) setCategorias(data);
    });
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VehiculoFormData>({
    resolver: zodResolver(vehiculoSchema),
    defaultValues: vehiculo
      ? {
          nombre: vehiculo.nombre,
          marca: vehiculo.marca,
          modelo: vehiculo.modelo,
          anio: vehiculo.anio,
          categoria: vehiculo.categoria,
          transmision: vehiculo.transmision,
          combustible: vehiculo.combustible,
          pasajeros: vehiculo.pasajeros,
          precio_dia: vehiculo.precio_dia,
          disponible: vehiculo.disponible,
          imagen_url: vehiculo.imagen_url ?? undefined,
          imagenes_urls: vehiculo.imagenes_urls ?? [],
          descripcion: vehiculo.descripcion ?? undefined,
          caracteristicas: vehiculo.caracteristicas,
        }
      : { disponible: true, imagenes_urls: [], caracteristicas: [] },
  });

  const imagenesUrls = watch("imagenes_urls") ?? [];
  const imagenPrincipal = watch("imagen_url");

  const uploadFile = async (file: File): Promise<string | null> => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!allowed.includes(file.type)) {
      toast.error(`${file.name}: solo JPG, PNG, WebP o AVIF.`);
      return null;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`${file.name}: supera 5MB.`);
      return null;
    }
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `vehiculos/${crypto.randomUUID()}.${ext}`;
    const { data, error } = await supabase.storage.from("vehiculos").upload(path, file);
    if (error) { toast.error(`Error subiendo ${file.name}.`); return null; }
    const { data: urlData } = supabase.storage.from("vehiculos").getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const handleMultiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);

    const urls: string[] = [];
    for (const file of files) {
      const url = await uploadFile(file);
      if (url) urls.push(url);
    }

    if (urls.length) {
      const current = watch("imagenes_urls") ?? [];
      const allUrls = [...current, ...urls];
      setValue("imagenes_urls", allUrls);
      // Si no hay imagen principal, usar la primera subida
      if (!watch("imagen_url") && allUrls.length > 0) {
        setValue("imagen_url", allUrls[0]);
      }
      toast.success(`${urls.length} imagen${urls.length > 1 ? "es" : ""} subida${urls.length > 1 ? "s" : ""}.`);
    }

    e.target.value = "";
    setUploading(false);
  };

  const removeImage = (url: string) => {
    const updated = imagenesUrls.filter((u) => u !== url);
    setValue("imagenes_urls", updated);
    if (imagenPrincipal === url) {
      setValue("imagen_url", updated[0] ?? undefined);
    }
  };

  const setPrincipal = (url: string) => {
    setValue("imagen_url", url);
    toast.success("Imagen principal actualizada.");
  };

  const onSubmit = async (data: VehiculoFormData) => {
    const supabase = createClient();
    if (mode === "create") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("vehiculos") as any).insert(data);
      if (error) { toast.error("Error creando vehículo."); return; }
      toast.success("Vehículo creado exitosamente.");
    } else if (vehiculo) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("vehiculos") as any).update(data).eq("id", vehiculo.id);
      if (error) { toast.error("Error actualizando vehículo."); return; }
      toast.success("Vehículo actualizado.");
    }
    router.push("/admin/vehiculos");
    router.refresh();
  };

  const anioValue = watch("anio");
  const categoriaValue = watch("categoria");
  const transmisionValue = watch("transmision");
  const combustibleValue = watch("combustible");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Nombre del vehículo</Label>
          <Input className="mt-1" placeholder="ej. Toyota RAV4 2023" {...register("nombre")} />
          {errors.nombre && <p className="text-xs text-[var(--color-destructive)] mt-1">{errors.nombre.message}</p>}
        </div>
        <div>
          <Label>Marca</Label>
          <Input className="mt-1" placeholder="ej. Toyota" {...register("marca")} />
          {errors.marca && <p className="text-xs text-[var(--color-destructive)] mt-1">{errors.marca.message}</p>}
        </div>
        <div>
          <Label>Modelo</Label>
          <Input className="mt-1" placeholder="ej. RAV4" {...register("modelo")} />
          {errors.modelo && <p className="text-xs text-[var(--color-destructive)] mt-1">{errors.modelo.message}</p>}
        </div>

        {/* Año con year picker */}
        <div className="relative">
          <Label>Año</Label>
          <button
            type="button"
            onClick={() => setShowYearPicker((v) => !v)}
            className="mt-1 flex h-10 w-full items-center justify-between rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            <span className={anioValue ? "text-[var(--color-foreground)]" : "text-[var(--color-muted-foreground)]"}>
              {anioValue ?? "Seleccionar año"}
            </span>
            <span className="text-[var(--color-muted-foreground)]">▾</span>
          </button>
          {showYearPicker && (
            <div className="absolute z-50 mt-1 shadow-lg">
              <YearPicker
                value={anioValue}
                onChange={(y) => { setValue("anio", y); setShowYearPicker(false); }}
                min={1990}
                max={new Date().getFullYear() + 1}
              />
            </div>
          )}
          {errors.anio && <p className="text-xs text-[var(--color-destructive)] mt-1">{errors.anio.message}</p>}
        </div>

        <div>
          <Label>Categoría</Label>
          <Select value={categoriaValue} onValueChange={(v) => setValue("categoria", v)}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
            <SelectContent>
              {categorias.map((c) => <SelectItem key={c.id} value={c.slug}>{c.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.categoria && <p className="text-xs text-[var(--color-destructive)] mt-1">{errors.categoria.message}</p>}
        </div>

        <div>
          <Label>Transmisión</Label>
          <Select value={transmisionValue} onValueChange={(v) => setValue("transmision", v as VehiculoFormData["transmision"])}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
            <SelectContent>
              {TRANSMISIONES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Combustible</Label>
          <Select value={combustibleValue} onValueChange={(v) => setValue("combustible", v as VehiculoFormData["combustible"])}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
            <SelectContent>
              {COMBUSTIBLES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Filas de asientos</Label>
          <Input className="mt-1" type="number" min={1} max={20} placeholder="ej. 5" {...register("pasajeros", { valueAsNumber: true })} />
          {errors.pasajeros && <p className="text-xs text-[var(--color-destructive)] mt-1">{errors.pasajeros.message}</p>}
        </div>

        <div>
          <Label>Precio por día (RD$)</Label>
          <Input className="mt-1" type="number" min={0} step={100} {...register("precio_dia", { valueAsNumber: true })} />
          {errors.precio_dia && <p className="text-xs text-[var(--color-destructive)] mt-1">{errors.precio_dia.message}</p>}
        </div>
      </div>

      {/* Upload múltiple de imágenes */}
      <div className="space-y-3">
        <Label>Imágenes del vehículo</Label>
        <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 cursor-pointer transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
          <Upload className="size-7 text-[var(--color-muted-foreground)]" />
          <span className="text-sm font-medium text-[var(--color-foreground)]">
            {uploading ? "Subiendo..." : "Haz clic o arrastra imágenes aquí"}
          </span>
          <span className="text-xs text-[var(--color-muted-foreground)]">
            JPG, PNG, WebP, AVIF · Máx 5MB por imagen · Múltiples a la vez
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleMultiUpload}
            disabled={uploading}
          />
        </label>

        {/* Grid de previews */}
        {imagenesUrls.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {imagenesUrls.map((url) => (
              <div key={url} className="relative group aspect-square rounded-[var(--radius-lg)] overflow-hidden border-2 border-[var(--color-border)] bg-[var(--color-muted)]"
                style={{ borderColor: imagenPrincipal === url ? "var(--color-primary)" : undefined }}>
                <Image src={url} alt="Imagen vehículo" fill className="object-cover" sizes="120px" />

                {/* Badge principal */}
                {imagenPrincipal === url && (
                  <div className="absolute top-1 left-1 bg-[var(--color-primary)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <Star className="size-2.5" /> Principal
                  </div>
                )}

                {/* Controles al hacer hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                  {imagenPrincipal !== url && (
                    <button
                      type="button"
                      onClick={() => setPrincipal(url)}
                      className="text-[10px] bg-white text-black font-semibold px-2 py-1 rounded w-full text-center hover:bg-yellow-100 transition-colors"
                    >
                      ⭐ Principal
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="text-[10px] bg-red-500 text-white font-semibold px-2 py-1 rounded w-full text-center hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                  >
                    <X className="size-3" /> Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {imagenesUrls.length === 0 && (
          <p className="text-xs text-[var(--color-muted-foreground)]">
            La primera imagen que subas se usará como imagen principal. Puedes cambiarla después.
          </p>
        )}
      </div>

      <div>
        <Label>Descripción</Label>
        <Textarea className="mt-1" rows={4} placeholder="Describe el vehículo..." {...register("descripcion")} />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="disponible" {...register("disponible")} className="size-4 accent-[var(--color-primary)]" />
        <Label htmlFor="disponible">Disponible para reservar</Label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" variant="accent" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : mode === "create" ? "Crear vehículo" : "Guardar cambios"}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
