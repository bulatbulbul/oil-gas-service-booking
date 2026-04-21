import api from "./client";

export type ServiceRequestResponse = {
    response_id: number;
    request_id: number;
    company_id: number;
    created_at: string;
    company?: { CompanyID: number; Name: string };
};

export type ServiceRequest = {
    request_id: number;
    user_id: number;
    service_name: string;
    comment: string | null;
    status: "pending" | "reviewed";
    created_at: string;
    user?: { Name: string; Email?: string | null };
    responses?: ServiceRequestResponse[];
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

export async function notifyCompanies(id: number): Promise<{ notified: number }> {
    const res = await api.post(`/service-requests/${id}/notify-companies`);
    return res.data;
}

export async function respondToServiceRequest(id: number, companyId: number): Promise<void> {
    await api.post(`/service-requests/${id}/respond`, { company_id: companyId });
}
