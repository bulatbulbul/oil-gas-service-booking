import { useEffect, useState } from "react";
import { getAllServices, createService, uploadServiceImage } from "../api/services";
import type { Service } from "../types";

export function useServices() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const [uploadingId, setUploadingId] = useState<number | null>(null);

    async function load() {
        try {
            setLoading(true);
            setError(null);
            setServices(await getAllServices());
        } catch {
            setError("Не удалось загрузить услуги");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function handleCreate(title: string) {
        if (!title.trim()) return;
        try {
            setCreating(true);
            await createService(title.trim());
            await load();
        } catch {
            alert("Ошибка создания услуги (нужно быть админом)");
        } finally {
            setCreating(false);
        }
    }

    async function handleImageUpload(id: number, file: File) {
        try {
            setUploadingId(id);
            const { image_url } = await uploadServiceImage(id, file);
            setServices((prev) =>
                prev.map((s) => s.ServiceID === id ? { ...s, ImageURL: image_url } : s)
            );
        } catch {
            alert("Ошибка загрузки фото");
        } finally {
            setUploadingId(null);
        }
    }

    return { services, loading, error, creating, uploadingId, handleCreate, handleImageUpload };
}
