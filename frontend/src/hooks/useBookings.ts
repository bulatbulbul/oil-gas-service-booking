import { useEffect, useState } from "react";
import { getAllBookings, updateBookingStatus } from "../api/bookings";
import type { Booking } from "../types";

export function useBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function load() {
        try {
            setLoading(true);
            setError(null);
            setBookings(await getAllBookings());
        } catch {
            setError("Не удалось загрузить бронирования");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function handleStatusChange(id: number, status: string) {
        try {
            await updateBookingStatus(id, status);
            await load();
        } catch {
            alert("Не удалось изменить статус");
        }
    }

    return { bookings, loading, error, handleStatusChange };
}
