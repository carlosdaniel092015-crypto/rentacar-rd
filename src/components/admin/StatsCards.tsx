import { Car, CalendarCheck, DollarSign, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface StatsCardsProps {
  totalVehiculos: number;
  reservasPendientes: number;
  ingresoesMes: number;
  vehiculosDisponibles: number;
}

export function StatsCards({ totalVehiculos, reservasPendientes, ingresoesMes, vehiculosDisponibles }: StatsCardsProps) {
  const stats = [
    {
      label: "Total vehículos",
      value: totalVehiculos,
      icon: Car,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Reservas pendientes",
      value: reservasPendientes,
      icon: CalendarCheck,
      color: "text-yellow-600 bg-yellow-100",
    },
    {
      label: "Ingresos del mes",
      value: formatCurrency(ingresoesMes),
      icon: DollarSign,
      color: "text-green-600 bg-green-100",
    },
    {
      label: "Disponibles",
      value: vehiculosDisponibles,
      icon: CheckCircle,
      color: "text-emerald-600 bg-emerald-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="flex items-center gap-4 p-5 sm:p-6">
            <div className={`flex size-14 items-center justify-center rounded-full ${stat.color}`}>
              <stat.icon className="size-7" />
            </div>
            <div>
              <p className="text-base sm:text-sm text-[var(--color-muted-foreground)]">{stat.label}</p>
              <p className="text-3xl sm:text-2xl font-bold">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
