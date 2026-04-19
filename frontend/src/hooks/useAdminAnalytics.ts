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
        Promise.allSettled([
            getUsersWithActiveBookings(),
            getSummary(),
            getPopularServices(10),
            getPopularCompanies(10),
            getBookingsByDate(),
        ]).then(([users, sum, popular, companies, byDate]) => {
            if (users.status === "fulfilled")     setActiveUsers(users.value);
            if (sum.status === "fulfilled")       setSummary(sum.value);
            if (popular.status === "fulfilled")   setPopularServices(popular.value);
            if (companies.status === "fulfilled") setPopularCompanies(companies.value);
            if (byDate.status === "fulfilled")    setBookingsByDate(byDate.value);

            const anyFailed = [users, sum, popular, companies, byDate].some(r => r.status === "rejected");
            if (anyFailed) setError("Некоторые данные не удалось загрузить");
        }).finally(() => setLoading(false));
    }, []);

    return { activeUsers, summary, popularServices, popularCompanies, bookingsByDate, loading, error };
}
