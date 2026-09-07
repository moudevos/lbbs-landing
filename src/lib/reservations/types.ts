export type ReservationStatus = "pendiente" | "contactado" | "confirmado" | "atendido" | "cancelado" | "no_asistio";

export type ReservationOption = {
  id: string;
  name: string;
};

export type BranchOption = ReservationOption & {
  code: string;
  phone: string | null;
};

export type ServiceOption = ReservationOption & {
  slug: string;
  durationMinutes: number;
  basePrice: number;
  allowCustomPrice: boolean;
  pricesByBranch: Record<string, number>;
  description?: string | null;
};

export type BarberOption = ReservationOption & {
  branchId: string | null;
  nickname?: string | null;
  specialty?: string | null;
  profilePhotoUrl?: string | null;
};

export type ReservationSummary = {
  id: string;
  status: ReservationStatus;
  source: string;
  createdAt: string;
  contactedAt: string | null;
  startsAt: string;
  endsAt: string;
  price: number | null;
  observations: string | null;
  branch: string;
  branchId: string;
  branchPhone: string | null;
  customer: string;
  customerPhone: string;
  service: string;
  serviceId: string | null;
  barber: string | null;
  barberId: string | null;
  whatsappUrl: string;
  whatsappTemplateMissing?: string | null;
  serviceOrderId?: string | null;
};
