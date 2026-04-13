import { useEffect, useState } from "react";
import { getBookingsByUser } from "../api/bookings";
import type { Booking } from "../types";

export function useAdminUserBookings(userId: number) {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (Number.isNaN(userId)) return;
        getBookingsByUser(userId)
            .then(setBookings)
            .catch(() => setError("Не удалось загрузить бронирования"))
            .finally(() => setLoading(false));
    }, [userId]);

    return { bookings, loading, error };
}
