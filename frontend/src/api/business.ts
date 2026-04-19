import api from "./client";
import type { ActiveUser, CompanyServiceResult } from "../types";

export async function getUsersWithActiveBookings(): Promise<ActiveUser[]> {
    const res = await api.get("/business/users-with-active-bookings");
    return Array.isArray(res.data) ? res.data : [];
}

export async function getCompaniesByService(serviceId: number): Promise<CompanyServiceResult[]> {
    const res = await api.get(`/business/companies-by-service/${serviceId}`);
    return Array.isArray(res.data) ? res.data : [];
}

export type Summary = {
    total_bookings: number;
    active_bookings: number;
    total_companies: number;
    available_services: number;
};

export type PopularCompany = {
    company_id: number;
    name: string;
    logo_url?: string | null;
    booking_count: number;
};

export type PopularService = {
    service_id: number;
    title: string;
    company_count: number;
    booking_count: number;
};

export type BookingByDate = {
    date: string;
    count: number;
};

export async function getSummary(): Promise<Summary> {
    const res = await api.get("/business/summary");
    return res.data;
}

export async function getPopularCompanies(limit = 10): Promise<PopularCompany[]> {
    const res = await api.get("/business/popular-companies", { params: { limit } });
    return Array.isArray(res.data) ? res.data : [];
}

export async function getPopularServices(limit = 10): Promise<PopularService[]> {
    const res = await api.get("/business/popular-services", { params: { limit } });
    return Array.isArray(res.data) ? res.data : [];
}

export async function getBookingsByDate(from?: string, to?: string): Promise<BookingByDate[]> {
    const res = await api.get("/business/bookings-by-date", { params: { from, to } });
    return Array.isArray(res.data) ? res.data : [];
}
