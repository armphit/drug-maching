import { LoadingOverlayService } from './loading-overlay.service';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Patient } from '../models/patient.model';
import { PatientApiService } from './patient-api.service';
import { WsService } from './websocket.service';
import { MatSnackBar } from '@angular/material/snack-bar';
@Injectable({ providedIn: 'root' })
export class QueueService implements OnDestroy {
  private _patients = new BehaviorSubject<Patient[]>([]);
  patients$ = this._patients.asObservable();

  private running = false;
  private wsSub?: Subscription; // ⭐ เก็บ subscription กันซ้ำ

  constructor(
    private api: PatientApiService,
    private ws: WsService,
    private loading: LoadingOverlayService,
    private snack: MatSnackBar,
  ) {
    this.loadInitial();
  }

  /* ===============================
     โหลดข้อมูลครั้งแรก (REST)
  =============================== */
  private loadInitial() {
    this.api.getPatients().subscribe((p) => {
      this._patients.next(p);
    });
  }

  // async processScan(hn: string): Promise<Patient | null> {
  //   const patient = this._patients.value.find((p) => p.hn === hn);
  //   if (!patient){

  //     return null;
  //   } else {

  //   this.loading.show(patient);

  //   await new Promise((resolve) => setTimeout(resolve, 5000));

  //   await this.removePatient(hn);

  //   this.loading.hide();

  //   return patient;
  //   } // ⭐ สำคัญมาก
  // }
  async processScan(hn: string): Promise<Patient | null> {
    const patient = this._patients.value.find((p) => p.hn === hn);

    /* ========================= */
    /* ❌ ไม่พบ */
    /* ========================= */
    if (!patient) {
      this.snack.open(`ไม่พบข้อมูล HN ${hn}`, 'ปิด', {
        duration: 5000,
        horizontalPosition: 'center', // ขวา
        verticalPosition: 'top', // บน
        panelClass: ['snack-error'],
      });

      return null;
    }

    /* ========================= */
    /* ✅ พบ */
    /* ========================= */

    this.loading.show(patient);

    await new Promise((r) => setTimeout(r, 2000));

    await this.removePatient(hn);

    this.loading.hide();

    return patient;
  }

  /* ===============================
     ▶ START REALTIME (WebSocket)
  =============================== */
  startRealtime() {
    if (this.running) return; // ⭐ กันกดซ้ำ

    this.running = true;

    this.ws.connect();

    this.wsSub = this.ws.stream$.subscribe((newPatients) => {
      const current = this._patients.value;

      // ⭐ merge + กันซ้ำ hn
      const merged = [...current, ...newPatients].filter(
        (p, i, arr) => arr.findIndex((x) => x.hn === p.hn) === i,
      );

      this._patients.next(merged);
    });
  }

  /* ===============================
     ⏹ STOP REALTIME
  =============================== */
  stopRealtime() {
    if (!this.running) return;

    this.running = false;

    // ⭐ สำคัญมาก (กัน memory leak)
    this.wsSub?.unsubscribe();
    this.wsSub = undefined;

    this.ws.disconnect();
  }

  /* ===============================
     🔁 TOGGLE
  =============================== */
  toggleRealtime() {
    this.running ? this.stopRealtime() : this.startRealtime();
  }

  /* ===============================
     STATUS
  =============================== */
  isRunning(): boolean {
    return this.running;
  }

  /* ===============================
     ลบผู้ป่วย
  =============================== */
  removePatient(hn: string) {
    this.api.remove(hn).subscribe(() => {
      const next = this._patients.value.filter((p) => p.hn !== hn);

      this._patients.next(next);
    });
  }

  /* ===============================
     CLEANUP
  =============================== */
  ngOnDestroy() {
    this.stopRealtime();
  }
}
