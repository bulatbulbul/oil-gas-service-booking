import api from "./client";
import type { ActiveUser, CompanyServiceResult } from "../types";

export async function getUsersWithActiveBookings(): Promise<ActiveUser[]> {
    const res = await api.get("/business/users-with-active-bookings");
    return Array.isArray(res.data) ? res.data : [];
}

export async function getCompaniesByService(query: string): Promise<CompanyServiceResult[]> {
    const res = await api.get(`/business/companies-by-service/${encodeURIComponent(query)}`);
    return Array.isArray(res.data) ? res.data : [];
}
