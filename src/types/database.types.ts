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
      categorias: {
        Row: {
          id: string;
          slug: string;
          nombre: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          nombre: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categorias"]["Insert"]>;
      };
      vehiculos: {
        Row: {
          id: string;
          nombre: string;
          marca: string;
          modelo: string;
          anio: number;
          categoria: string;
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
          categoria: string;
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
      equipo: {
        Row: {
          id: string;
          email: string;
          nombre: string;
          cargo: string;
          rol: "principal" | "miembro";
          accesos: string[];
          activo: boolean;
          debe_cambiar_password: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          nombre: string;
          cargo: string;
          rol?: "principal" | "miembro";
          accesos?: string[];
          activo?: boolean;
          debe_cambiar_password?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["equipo"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_principal: { Args: { uid?: string }; Returns: boolean };
      has_acceso: { Args: { modulo: string; uid?: string }; Returns: boolean };
      debe_cambiar_password: { Args: { uid?: string }; Returns: boolean };
      mark_password_changed: { Args: Record<string, never>; Returns: undefined };
    };
    Enums: Record<string, never>;
  };
}

export type Categoria = Database["public"]["Tables"]["categorias"]["Row"];
export type Vehiculo = Database["public"]["Tables"]["vehiculos"]["Row"];
export type VehiculoInsert = Database["public"]["Tables"]["vehiculos"]["Insert"];
export type Reserva = Database["public"]["Tables"]["reservas"]["Row"];
export type ReservaInsert = Database["public"]["Tables"]["reservas"]["Insert"];
