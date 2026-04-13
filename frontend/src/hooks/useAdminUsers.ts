import { useEffect, useState } from "react";
import { getAllUsers, deleteUser } from "../api/users";
import type { User } from "../types";

export function useAdminUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function load() {
        try {
            setLoading(true);
            setUsers(await getAllUsers());
        } catch {
            setError("Не удалось загрузить пользователей");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function handleDelete(id: number) {
        if (!confirm(`Удалить пользователя #${id}?`)) return;
        try {
            await deleteUser(id);
            await load();
        } catch {
            alert("Не удалось удалить пользователя");
        }
    }

    return { users, loading, error, handleDelete };
}
