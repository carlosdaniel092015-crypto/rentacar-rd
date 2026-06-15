export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      vehiculos: {
        Row: {
          id: string;
          nombre: string;
          marca: string;
          modelo: string;
          anio: number;
          categoria: "economico" | "sedan" | "suv" | "pickup" | "van" | "lujo" | "deportivo";
          transmision: "manual" | "automatica";
          combustible: "gasolina" | "diesel" | "hibrido" | "electrico";
          pasajeros: number;
          precio_dia: number;
          disponible: boolean;
          imagen_url: string | null;
          imagenes_urls: string[];
          descripcion: string | null;
          caracteristicas: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          marca: string;
          modelo: string;
          anio: number;
          categoria: "economico" | "sedan" | "suv" | "pickup" | "van" | "lujo" | "deportivo";
          transmision: "manual" | "automatica";
          combustible: "gasolina" | "diesel" | "hibrido" | "electrico";
          pasajeros: number;
          precio_dia: number;
          disponible?: boolean;
          imagen_url?: string | null;
          imagenes_urls?: string[];
          descripcion?: string | null;
          caracteristicas?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["vehiculos"]["Insert"]>;
      };
      reservas: {
        Row: {
          id: string;
          vehiculo_id: string;
          nombre_cliente: string;
          email_cliente: string;
          telefono_cliente: string;
          cedula_cliente: string;
          fecha_inicio: string;
          fecha_fin: string;
          dias: number;
          precio_dia: number;
          total: number;
          estado: "pendiente" | "confirmada" | "en_curso" | "completada" | "cancelada";
          notas: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vehiculo_id: string;
          nombre_cliente: string;
          email_cliente: string;
          telefono_cliente: string;
          cedula_cliente: string;
          fecha_inicio: string;
          fecha_fin: string;
          precio_dia: number;
          estado?: "pendiente" | "confirmada" | "en_curso" | "completada" | "cancelada";
          notas?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reservas"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Vehiculo = Database["public"]["Tables"]["vehiculos"]["Row"];
export type VehiculoInsert = Database["public"]["Tables"]["vehiculos"]["Insert"];
export type Reserva = Database["public"]["Tables"]["reservas"]["Row"];
export type ReservaInsert = Database["public"]["Tables"]["reservas"]["Insert"];
