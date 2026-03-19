import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Patient } from '../models/patient.model';
@Injectable({ providedIn: 'root' })
export class PatientApiService {
  base = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  getPatients() {
    return this.http.get<Patient[]>(`${this.base}/patients`);
  }

  remove(patient: Patient) {
    return this.http.post(`${this.base}/update_patients/`, patient);
  }
}
