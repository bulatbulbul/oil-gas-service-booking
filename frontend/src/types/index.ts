export type Company = {
    CompanyID: number;
    Name: string;
    logo_url?: string | null;
};

export type Service = {
    ServiceID: number;
    Title: string;
    ImageURL?: string | null;
};

export type CompanyService = {
    CompanyServiceID: number;
    CompanyID: number;
    ServiceID: number;
    Company?: Company;
    Service?: Service;
};

export type Booking = {
    BookingID: number;
    Status: string;
    Description?: string | null;
};

export type User = {
    UserID: number;
    Name: string;
    Email?: string | null;
    Role: string;
};

export type Me = {
    id: number;
    name: string;
    email: string | null;
    role: string;
    avatar_url?: string | null;
};

export type ActiveUser = {
    user_id: number;
    name: string;
    email?: string | null;
    active_bookings: number;
};

export type CompanyServiceResult = {
    CompanyID: number;
    Name: string;
    CompanyServiceID: number;
    ServiceImageURL?: string | null;
    LogoURL?: string | null;
};

export type BookingService = {
    BookingServiceID: number;
    BookingID: number;
    CompanyServiceID: number;
    Notes?: string | null;
    CompanyService?: {
        Company?: { CompanyID: number; Name: string };
        Service?: { ServiceID: number; Title: string };
    };
};

export const BOOKING_STATUSES = ["requested", "active", "approved", "completed", "cancelled"] as const;
export type BookingStatus = typeof BOOKING_STATUSES[number];

export const BOOKING_STATUS_LABELS: Record<string, string> = {
    requested: "Заявка",
    active: "Активно",
    approved: "Подтверждено",
    completed: "Завершено",
    cancelled: "Отменено",
};
