export type DeliveryStatus = 'pending' | 'picked_up' | 'delivered';
export interface Delivery {
    id: string;
    tracking_number: number;
    client_id: string;
    recipient_name: string;
    recipient_address: string;
    recipient_phone: string;
    status: DeliveryStatus;
    notes: string | null;
    created_at: string;
    picked_up_at: string | null;
    delivered_at: string | null;
}
export interface CreateDeliveryPayload {
    client_id: string;
    recipient_name: string;
    recipient_address: string;
    recipient_phone: string;
    notes?: string;
}
export interface CreateMyDeliveryPayload {
    recipient_name: string;
    recipient_address: string;
    recipient_phone: string;
    notes?: string;
}
export interface UpdateDeliveryStatusPayload {
    status: DeliveryStatus;
}
export interface CreateDeliveryResponse {
    trackingNumber: number;
    delivery: Delivery;
}
export interface MonthlyClientDeliveryCount {
    client_id: string;
    total_deliveries: number;
}
