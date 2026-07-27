import { Injectable, signal } from '@angular/core';

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  city: string;
  service: string;
  total: number;
  status: string;
  date: string;
}

export interface Stats {
  totalOrders: number;
  pendingIncome: number;
  todayOrders: number;
}

const mockOrders: Order[] = [
  // === HOY / AYER (Julio 22 - Julio 23, 2026) ===
  { id: 'ORD-1029', customerName: 'Andrea Gomez', phone: '+52 55 1234 5678', city: 'Ciudad de Mexico', service: 'Edecanes (3hrs, 2 Edecanes)', total: 3500, status: 'Pendiente', date: '2026-07-23T10:30:00Z' },
  { id: 'ORD-1030', customerName: 'Roberto Chavez', phone: '+52 81 9876 5432', city: 'Monterrey', service: 'Animacion (Show completo)', total: 5000, status: 'Pagado', date: '2026-07-22T11:15:00Z' },
  { id: 'ORD-1031', customerName: 'Laura Silva', phone: '+52 33 4567 8901', city: 'Guadalajara', service: 'Mobiliario (10 mesas, 100 sillas)', total: 2800, status: 'Completado', date: '2026-07-21T16:45:00Z' },
  { id: 'ORD-1032', customerName: 'Carlos Ruiz', phone: '+52 55 1122 3344', city: 'Ciudad de Mexico', service: 'Edecanes (5hrs, 4 Edecanes)', total: 8000, status: 'Pendiente', date: '2026-07-22T14:20:00Z' },
  { id: 'ORD-1033', customerName: 'Maria Lopez', phone: '+52 55 1122 3355', city: 'Ciudad de Mexico', service: 'Animacion (DJ y Luces)', total: 6000, status: 'Pagado', date: '2026-07-23T15:20:00Z' },

  // === ESTA SEMANA (Julio 19 - Julio 21) ===
  { id: 'ORD-1034', customerName: 'Juan Perez', phone: '+52 81 1111 2222', city: 'Monterrey', service: 'Edecanes (4hrs, 3 Edecanes)', total: 5500, status: 'Completado', date: '2026-07-20T09:00:00Z' },
  { id: 'ORD-1035', customerName: 'Diana Torres', phone: '+52 33 2222 3333', city: 'Guadalajara', service: 'Mobiliario (Salas Lounge)', total: 4000, status: 'Pagado', date: '2026-07-19T18:30:00Z' },
  { id: 'ORD-1036', customerName: 'Pedro Sanchez', phone: '+52 55 3333 4444', city: 'Puebla', service: 'Animacion (Zanqueros)', total: 3000, status: 'Pendiente', date: '2026-07-19T12:00:00Z' },

  // === SEMANAS ANTERIORES DE JULIO ===
  { id: 'ORD-1037', customerName: 'Sofia Castro', phone: '+52 55 4444 5555', city: 'Ciudad de Mexico', service: 'Edecanes (Evento Corporativo)', total: 12000, status: 'Completado', date: '2026-07-15T10:00:00Z' },
  { id: 'ORD-1038', customerName: 'Luis Ramirez', phone: '+52 81 5555 6666', city: 'Monterrey', service: 'Mobiliario (Toldos y sillas)', total: 7500, status: 'Pagado', date: '2026-07-12T14:00:00Z' },
  { id: 'ORD-1039', customerName: 'Ana Mendoza', phone: '+52 33 6666 7777', city: 'Guadalajara', service: 'Animacion (Robot LED)', total: 4500, status: 'Pendiente', date: '2026-07-10T20:00:00Z' },
  { id: 'ORD-1040', customerName: 'Jorge Diaz', phone: '+52 55 7777 8888', city: 'Ciudad de Mexico', service: 'Edecanes (Expo 2 dias)', total: 15000, status: 'Completado', date: '2026-07-05T08:00:00Z' },
  { id: 'ORD-1040B', customerName: 'Karen Suarez', phone: '+52 81 9999 1111', city: 'Monterrey', service: 'Animacion (Show Completo)', total: 6500, status: 'Completado', date: '2026-07-08T18:00:00Z' },
  { id: 'ORD-1040C', customerName: 'Raul Flores', phone: '+52 33 2222 5555', city: 'Guadalajara', service: 'Edecanes (2hrs, 1 Edecan)', total: 1500, status: 'Pagado', date: '2026-07-02T13:00:00Z' },
  
  // === JUNIO (Mes Pasado) ===
  { id: 'ORD-1041', customerName: 'Valeria Vargas', phone: '+52 55 8888 9999', city: 'Querétaro', service: 'Edecanes (Inauguracion)', total: 6000, status: 'Completado', date: '2026-06-28T11:00:00Z' },
  { id: 'ORD-1042', customerName: 'Ricardo Leon', phone: '+52 81 9999 0000', city: 'Monterrey', service: 'Mobiliario (Pista iluminada)', total: 9000, status: 'Completado', date: '2026-06-25T16:00:00Z' },
  { id: 'ORD-1043', customerName: 'Elena Rios', phone: '+52 33 0000 1111', city: 'Guadalajara', service: 'Animacion (Show Fuego)', total: 5500, status: 'Completado', date: '2026-06-20T21:00:00Z' },
  { id: 'ORD-1044', customerName: 'Fernando Vega', phone: '+52 55 1212 3434', city: 'Ciudad de Mexico', service: 'Edecanes (Campaña Activacion)', total: 18000, status: 'Completado', date: '2026-06-15T09:00:00Z' },
  { id: 'ORD-1045', customerName: 'Carmen Ortiz', phone: '+52 81 3434 5656', city: 'Monterrey', service: 'Mobiliario (Sillas Tiffany)', total: 3200, status: 'Completado', date: '2026-06-10T12:00:00Z' },
  { id: 'ORD-1046', customerName: 'Hugo Salazar', phone: '+52 33 5656 7878', city: 'Guadalajara', service: 'Animacion (Batucada)', total: 4800, status: 'Completado', date: '2026-06-05T19:00:00Z' },
  { id: 'ORD-1047', customerName: 'Marta Guzman', phone: '+52 55 7878 9090', city: 'Ciudad de Mexico', service: 'Edecanes (Pasarela)', total: 9500, status: 'Completado', date: '2026-06-02T18:00:00Z' },
  { id: 'ORD-1047B', customerName: 'Victor Ramos', phone: '+52 55 2345 6789', city: 'Ciudad de Mexico', service: 'Animacion (Payaso VIP)', total: 4000, status: 'Pagado', date: '2026-06-18T15:30:00Z' },
  { id: 'ORD-1047C', customerName: 'Leticia Ortiz', phone: '+52 81 3456 7890', city: 'Saltillo', service: 'Mobiliario (Carpas Grandes)', total: 15000, status: 'Completado', date: '2026-06-22T08:00:00Z' },
  { id: 'ORD-1047D', customerName: 'Oscar Medina', phone: '+52 33 4567 8901', city: 'Guadalajara', service: 'Edecanes (Volanteo)', total: 2500, status: 'Completado', date: '2026-06-12T10:00:00Z' },

  // === MAYO ===
  { id: 'ORD-1048', customerName: 'Samuel Nava', phone: '+52 55 9090 1212', city: 'Puebla', service: 'Edecanes (Promo centro comercial)', total: 4000, status: 'Completado', date: '2026-05-25T14:00:00Z' },
  { id: 'ORD-1049', customerName: 'Teresa Blanco', phone: '+52 81 1313 2424', city: 'Monterrey', service: 'Mobiliario (Carpas)', total: 11000, status: 'Completado', date: '2026-05-18T10:00:00Z' },
  { id: 'ORD-1050', customerName: 'Omar Fuentes', phone: '+52 33 2424 3535', city: 'Guadalajara', service: 'Animacion (Mimos)', total: 2500, status: 'Completado', date: '2026-05-10T13:00:00Z' },
  { id: 'ORD-1051', customerName: 'Luz Martinez', phone: '+52 55 3535 4646', city: 'Ciudad de Mexico', service: 'Edecanes (Congreso Medico)', total: 22000, status: 'Completado', date: '2026-05-03T07:30:00Z' },
  { id: 'ORD-1052', customerName: 'Esteban Arce', phone: '+52 55 1111 2222', city: 'Ciudad de Mexico', service: 'Animacion (Robot LED)', total: 5000, status: 'Completado', date: '2026-05-15T22:00:00Z' },
  { id: 'ORD-1053', customerName: 'Paula Ruiz', phone: '+52 81 2222 3333', city: 'Monterrey', service: 'Mobiliario (15 mesas)', total: 4200, status: 'Pagado', date: '2026-05-20T09:00:00Z' },
  { id: 'ORD-1054', customerName: 'Diego Castro', phone: '+52 33 3333 4444', city: 'Guadalajara', service: 'Edecanes (4hrs, 2 Edecanes)', total: 5000, status: 'Completado', date: '2026-05-28T16:00:00Z' },

  // === ABRIL ===
  { id: 'ORD-1055', customerName: 'Gabriela Cruz', phone: '+52 55 5555 6666', city: 'Toluca', service: 'Edecanes (Expo Automotriz)', total: 18000, status: 'Completado', date: '2026-04-20T10:00:00Z' },
  { id: 'ORD-1056', customerName: 'Hector Luna', phone: '+52 81 7777 8888', city: 'Monterrey', service: 'Animacion (Zanqueros y Arlequin)', total: 7000, status: 'Completado', date: '2026-04-12T14:30:00Z' },
  { id: 'ORD-1057', customerName: 'Mireya Silva', phone: '+52 33 9999 0000', city: 'Guadalajara', service: 'Mobiliario (Salas VIP)', total: 12500, status: 'Completado', date: '2026-04-05T09:00:00Z' },
  { id: 'ORD-1058', customerName: 'Arturo Pena', phone: '+52 55 1234 9876', city: 'Ciudad de Mexico', service: 'Edecanes (Lanzamiento Marca)', total: 14000, status: 'Completado', date: '2026-04-25T19:00:00Z' },
  { id: 'ORD-1059', customerName: 'Brenda Gomez', phone: '+52 81 2345 8765', city: 'Saltillo', service: 'Animacion (Mago Ilusionista)', total: 8000, status: 'Completado', date: '2026-04-18T20:00:00Z' },
  { id: 'ORD-1060', customerName: 'Tomas Herrera', phone: '+52 33 3456 7654', city: 'Guadalajara', service: 'Edecanes (3hrs, 3 Edecanes)', total: 5500, status: 'Completado', date: '2026-04-02T11:00:00Z' }
];

const mockStats: Stats = {
  totalOrders: 285,
  pendingIncome: 24500,
  todayOrders: 5
};

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  // Using Signals for modern Angular reactive state
  orders = signal<Order[]>(mockOrders);
  stats = signal<Stats>(mockStats);

  constructor() {}

  addOrder(newOrder: Order) {
    this.orders.update(orders => [newOrder, ...orders]);
    this.stats.update(stats => ({
      ...stats,
      totalOrders: stats.totalOrders + 1,
      todayOrders: stats.todayOrders + 1,
    }));
  }
}
