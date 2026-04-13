import api from "./client";
import type { User } from "../types";

export async function getAllUsers(): Promise<User[]> {
    const res = await api.get("/users");
    return Array.isArray(res.data) ? res.data : [];
}

export async function deleteUser(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
}
