import api from "./client";
import type { Booking, BookingService } from "../types";

export async function getMyBookings(): Promise<Booking[]> {
    const res = await api.get("/bookings/me");
    return Array.isArray(res.data) ? res.data : [];
}

export async function getAllBookings(): Promise<Booking[]> {
    const res = await api.get("/bookings");
    return Array.isArray(res.data) ? res.data : [];
}

export async function getBookingById(id: number): Promise<Booking> {
    const res = await api.get(`/bookings/${id}`);
    return res.data;
}

export async function getBookingsByUser(userId: number): Promise<Booking[]> {
    const res = await api.get("/bookings", { params: { user_id: userId } });
    return Array.isArray(res.data) ? res.data : [];
}

export async function createBooking(description: string, status: string): Promise<Booking> {
    const res = await api.post("/bookings", { description, status });
    return res.data;
}

export async function updateBookingStatus(id: number, status: string): Promise<Booking> {
    const res = await api.put(`/bookings/${id}`, { Status: status });
    return res.data;
}

export async function deleteMyBooking(id: number): Promise<void> {
    await api.delete(`/bookings/${id}/me`);
}

export async function createBookingService(bookingId: number, companyServiceId: number, notes?: string): Promise<void> {
    await api.post("/booking-services", {
        booking_id: bookingId,
        company_service_id: companyServiceId,
        ...(notes ? { notes } : {}),
    });
}

export async function getBookingServices(bookingId: number): Promise<BookingService[]> {
    const res = await api.get(`/bookings/${bookingId}/services`);
    return Array.isArray(res.data) ? res.data : [];
}
