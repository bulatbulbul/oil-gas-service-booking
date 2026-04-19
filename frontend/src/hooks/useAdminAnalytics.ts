import { useEffect, useState } from "react";
import {
    getUsersWithActiveBookings,
    getSummary, getPopularServices, getPopularCompanies, getBookingsByDate,
} from "../api/business";
import type { ActiveUser, Summary, PopularService, PopularCompany, BookingByDate } from "../api/business";

export type { Summary, PopularService, PopularCompany, BookingByDate };

export function useAdminAnalytics() {
    const [activeUsers, setActiveUsers]           = useState<ActiveUser[]>([]);
    const [summary, setSummary]                   = useState<Summary | null>(null);
    const [popularServices, setPopularServices]   = useState<PopularService[]>([]);
    const [popularCompanies, setPopularCompanies] = useState<PopularCompany[]>([]);
    const [bookingsByDate, setBookingsByDate]     = useState<BookingByDate[]>([]);
    const [loading, setLoading]                   = useState(true);
    const [error, setError]                       = useState<string | null>(null);

    useEffect(() => {
        Promise.all([
            getUsersWithActiveBookings(),
            getSummary(),
            getPopularServices(10),
            getPopularCompanies(10),
            getBookingsByDate(),
        ])
            .then(([users, sum, popular, companies, byDate]) => {
                setActiveUsers(users);
                setSummary(sum);
                setPopularServices(popular);
                setPopularCompanies(companies);
                setBookingsByDate(byDate);
            })
            .catch(() => setError("Не удалось загрузить данные"))
            .finally(() => setLoading(false));
    }, []);

    return { activeUsers, summary, popularServices, popularCompanies, bookingsByDate, loading, error };
}
