import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client, CreateClientPayload } from '@packtrack/shared';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly baseUrl = `${environment.apiBaseUrl}/clients`;

  constructor(private readonly http: HttpClient) {}

  createClient(payload: CreateClientPayload): Observable<Client> {
    return this.http.post<Client>(this.baseUrl, payload);
  }

  listClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.baseUrl);
  }
}