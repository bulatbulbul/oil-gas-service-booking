import { useEffect, useState } from "react";
import { getBookingById, getBookingServices, createBookingService, updateBookingStatus } from "../api/bookings";
import type { Booking, BookingService } from "../types";

export function useBookingDetails(bookingId: number) {
    const [booking, setBooking] = useState<Booking | null>(null);
    const [services, setServices] = useState<BookingService[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [adding, setAdding] = useState(false);

    async function load() {
        try {
            setLoading(true);
            const [b, s] = await Promise.all([
                getBookingById(bookingId),
                getBookingServices(bookingId),
            ]);
            setBooking(b);
            setServices(s);
        } catch {
            setError("Не удалось загрузить данные бронирования");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!Number.isNaN(bookingId)) load();
    }, [bookingId]);

    async function handleAddService(companyServiceId: number, notes: string) {
        try {
            setAdding(true);
            await createBookingService(bookingId, companyServiceId, notes || undefined);
            await load();
        } catch {
            alert("Ошибка добавления услуги в бронирование");
        } finally {
            setAdding(false);
        }
    }

    async function handleStatusChange(status: string) {
        try {
            await updateBookingStatus(bookingId, status);
            await load();
        } catch {
            alert("Не удалось изменить статус");
        }
    }

    return { booking, services, loading, error, adding, handleAddService, handleStatusChange };
}
