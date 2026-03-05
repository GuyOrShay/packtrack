import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Client, CreateClientPayload } from '@packtrack/shared';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ClientsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(payload: CreateClientPayload): Promise<Client> {
    const username = payload.username.trim().toLowerCase();
    const domain = (process.env.AUTH_USERNAME_EMAIL_DOMAIN ?? 'packtrack.local').trim().toLowerCase();
    const contactEmail = `${username}@${domain}`;

    const { data, error } = await this.supabaseService.client
      .from('clients')
      .insert({
        company_name: payload.company_name,
        contact_email: contactEmail,
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new InternalServerErrorException(error?.message ?? 'Failed to create client.');
    }

    return data as Client;
  }

  async list(): Promise<Client[]> {
    const { data, error } = await this.supabaseService.client
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []) as Client[];
  }
}
