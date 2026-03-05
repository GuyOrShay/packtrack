export interface Client {
  id: string;
  company_name: string;
  contact_email: string | null;
  created_at: string;
}

export interface CreateClientPayload {
  company_name: string;
  username: string;
}
