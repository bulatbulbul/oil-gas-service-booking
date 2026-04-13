import api from "./client";

export type ServiceRequest = {
    request_id: number;
    user_id: number;
    service_name: string;
    comment: string | null;
    status: "pending" | "reviewed";
    created_at: string;
    user?: { Name: string; Email?: string | null };
};

export async function createServiceRequest(serviceName: string, comment?: string): Promise<ServiceRequest> {
    const res = await api.post("/service-requests", {
        service_name: serviceName,
        comment: comment || null,
    });
    return res.data;
}

export async function getAllServiceRequests(): Promise<ServiceRequest[]> {
    const res = await api.get("/service-requests");
    return Array.isArray(res.data) ? res.data : [];
}

export async function updateServiceRequestStatus(id: number, status: "pending" | "reviewed"): Promise<void> {
    await api.put(`/service-requests/${id}/status`, { status });
}
