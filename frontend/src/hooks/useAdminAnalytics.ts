import { useEffect, useState } from "react";
import { getUsersWithActiveBookings } from "../api/business";
import type { ActiveUser } from "../types";

export function useAdminAnalytics() {
    const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getUsersWithActiveBookings()
            .then(setActiveUsers)
            .catch(() => setError("Не удалось загрузить данные"))
            .finally(() => setLoading(false));
    }, []);

    return { activeUsers, loading, error };
}
