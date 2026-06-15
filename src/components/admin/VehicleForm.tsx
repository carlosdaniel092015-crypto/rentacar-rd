"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { vehiculoSchema, type VehiculoFormData } from "@/lib/validations/vehiculo.schema";
import { CATEGORIAS, TRANSMISIONES, COMBUSTIBLES } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Vehiculo } from "@/types/database.types";

interface VehicleFormProps {
  vehiculo?: Vehiculo;
  mode: "create" | "edit";
}

export function VehicleForm({ vehiculo, mode }: VehicleFormProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

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
          descripcion: vehiculo.descripcion ?? undefined,
          caracteristicas: vehiculo.caracteristicas,
        }
      : { disponible: true, imagenes_urls: [], caracteristicas: [] },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!allowed.includes(file.type)) {
      toast.error("Solo se permiten imágenes JPG, PNG, WebP o AVIF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no puede superar 5MB.");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `vehiculos/${crypto.randomUUID()}.${ext}`;
    const { data, error } = await supabase.storage.from("vehiculos").upload(path, file);

    if (error) {
      toast.error("Error subiendo imagen.");
    } else {
      const { data: urlData } = supabase.storage.from("vehiculos").getPublicUrl(data.path);
      setValue("imagen_url", urlData.publicUrl);
      toast.success("Imagen subida correctamente.");
    }
    setUploading(false);
  };

  const onSubmit = async (data: VehiculoFormData) => {
    const supabase = createClient();

    if (mode === "create") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("vehiculos") as any).insert(data);
      if (error) {
        toast.error("Error creando vehículo.");
        return;
      }
      toast.success("Vehículo creado exitosamente.");
    } else if (vehiculo) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("vehiculos") as any).update(data).eq("id", vehiculo.id);
      if (error) {
        toast.error("Error actualizando vehículo.");
        return;
      }
      toast.success("Vehículo actualizado.");
    }

    router.push("/admin/vehiculos");
    router.refresh();
  };

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
        <div>
          <Label>Año</Label>
          <Input className="mt-1" type="number" min={1990} max={new Date().getFullYear() + 1} {...register("anio", { valueAsNumber: true })} />
          {errors.anio && <p className="text-xs text-[var(--color-destructive)] mt-1">{errors.anio.message}</p>}
        </div>
        <div>
          <Label>Categoría</Label>
          <Select value={categoriaValue} onValueChange={(v) => setValue("categoria", v as VehiculoFormData["categoria"])}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
            <SelectContent>
              {CATEGORIAS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
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
          <Label>Pasajeros</Label>
          <Input className="mt-1" type="number" min={1} max={20} {...register("pasajeros", { valueAsNumber: true })} />
        </div>
        <div>
          <Label>Precio por día (RD$)</Label>
          <Input className="mt-1" type="number" min={0} step={100} {...register("precio_dia", { valueAsNumber: true })} />
          {errors.precio_dia && <p className="text-xs text-[var(--color-destructive)] mt-1">{errors.precio_dia.message}</p>}
        </div>
      </div>

      <div>
        <Label>Imagen principal</Label>
        <Input type="file" accept="image/*" className="mt-1" onChange={handleImageUpload} disabled={uploading} />
        {uploading && <p className="text-xs text-[var(--color-muted-foreground)] mt-1">Subiendo imagen...</p>}
        {watch("imagen_url") && (
          <p className="text-xs text-[var(--color-success)] mt-1">✓ Imagen cargada</p>
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
