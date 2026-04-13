import api from "./client";
import type { Me } from "../types";

export async function login(email: string, password: string): Promise<{ token: string; role: string }> {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
}

export async function register(name: string, email: string, password: string): Promise<{ token: string; role: string }> {
    const res = await api.post("/auth/register", { name, email, password });
    return res.data;
}

export async function getMe(): Promise<Me> {
    const res = await api.get("/auth/me");
    return res.data;
}

export async function uploadAvatar(file: File): Promise<{ avatar_url: string }> {
    const form = new FormData();
    form.append("file", file);
    const res = await api.post("/upload/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
}
