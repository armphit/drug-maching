import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Patient } from '../models/patient.model';
@Injectable({ providedIn: 'root' })
export class PatientApiService {
  base = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getPatients() {
    return this.http.get<Patient[]>(`${this.base}/patients`);
  }

  remove(hn: string) {
    return this.http.delete(`${this.base}/patients/${hn}`);
  }
}
