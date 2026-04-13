import api from "./client";
import type { Service } from "../types";

export async function getAllServices(): Promise<Service[]> {
    const res = await api.get("/services");
    return Array.isArray(res.data) ? res.data : [];
}

export async function createService(title: string): Promise<Service> {
    const res = await api.post("/services", { title });
    return res.data;
}

export async function updateService(id: number, title: string): Promise<void> {
    await api.put(`/services/${id}`, { title });
}

export async function uploadServiceImage(id: number, file: File): Promise<{ image_url: string }> {
    const form = new FormData();
    form.append("file", file);
    const res = await api.post(`/services/${id}/image`, form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
}
