"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface VehiculoActionsProps {
  vehiculoId: string;
  disponible: boolean;
}

export function VehiculoActions({ vehiculoId, disponible }: VehiculoActionsProps) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleDisponibilidad = async () => {
    setLoading(true);
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("vehiculos") as any)
      .update({ disponible: !disponible })
      .eq("id", vehiculoId);

    if (error) {
      toast.error("Error al actualizar disponibilidad.");
    } else {
      toast.success(`Vehículo marcado como ${!disponible ? "disponible" : "no disponible"}.`);
      router.refresh();
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("vehiculos").delete().eq("id", vehiculoId);

    if (error) {
      if (error.code === "23503") {
        toast.error("No se puede eliminar: tiene reservas asociadas.");
      } else {
        toast.error("Error al eliminar vehículo.");
      }
    } else {
      toast.success("Vehículo eliminado.");
      router.refresh();
    }
    setLoading(false);
    setConfirmDelete(false);
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDisponibilidad}
          disabled={loading}
          title={disponible ? "Marcar no disponible" : "Marcar disponible"}
        >
          {disponible ? (
            <ToggleRight className="size-4 text-[var(--color-success)]" />
          ) : (
            <ToggleLeft className="size-4 text-[var(--color-muted-foreground)]" />
          )}
        </Button>
        <Button variant="ghost" size="icon" asChild title="Editar">
          <Link href={`/admin/vehiculos/${vehiculoId}/editar`}>
            <Pencil className="size-4" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setConfirmDelete(true)}
          className="text-[var(--color-destructive)] hover:text-[var(--color-destructive)]"
          title="Eliminar"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar vehículo?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Si el vehículo tiene reservas asociadas, no podrá eliminarse.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? "Eliminando..." : "Sí, eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
