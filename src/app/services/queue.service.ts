import { LoadingOverlayService } from './loading-overlay.service';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription, firstValueFrom } from 'rxjs';
import { Patient } from '../models/patient.model';
import { PatientApiService } from './patient-api.service';
import { WsService } from './websocket.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../components/confirmation-dialog/confirmation-dialog.component';
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
    private dialog: MatDialog,
  ) {
    this.loadQueue();
  }

  /* ===============================
     โหลดข้อมูลคิวจาก API
  =============================== */
  loadQueue() {
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
  // async processScan(hn: string): Promise<Patient | null> {
  //   const patient = this._patients.value.find((p) => p.hn === hn);

  //   /* ========================= */
  //   /* ❌ ไม่พบ */
  //   /* ========================= */
  //   if (!patient) {
  //     this.snack.open(`ไม่พบข้อมูล HN ${hn}`, 'ปิด', {
  //       duration: 5000,
  //       horizontalPosition: 'center', // ขวา
  //       verticalPosition: 'top', // บน
  //       panelClass: ['snack-error'],
  //     });

  //     return null;
  //   }

  //   /* ========================= */
  //   /* ✅ พบ */
  //   /* ========================= */

  //   this.loading.show(patient);

  //   await new Promise((r) => setTimeout(r, 500));

  //   await this.removePatient(patient);

  //   this.loading.hide();

  //   return patient;
  // }

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

  private showErrorDialog(message: string) {
    // this.dialog.open(ConfirmationDialogComponent, {
    //   data: {
    //     title: 'เกิดข้อผิดพลาด',
    //     message: 'ผู้ป่วยมีรายการแพ้ยา',
    //     confirmText: 'ตกลง',
    //   },
    //   width: '320px',
    //   disableClose: true,
    // });
    this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',          // เดิม 420 → x2
      maxWidth: '95vw',
      panelClass: 'app-dialog-lg',
      disableClose: true,
      data: {
        title: 'เกิดข้อผิดพลาด',
        confirmText: 'ตกลง',
      }
    });
  }

  /* ===============================
     ลบผู้ป่วย
  =============================== */
  async removePatient(patient: Patient, zone: string): Promise<boolean> {
    this.loading.show(patient);

    try {
      const val: any = await firstValueFrom(this.api.remove(patient, zone));
      this.loading.hide();


      this.snack.open('พิมพ์ใบนำทางเรียบร้อย', 'ปิด', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['snack-success'],
      });

      return true;
    } catch (err: any) {
      this.loading.hide();
      console.error('Remove patient failed', err);
      this.showErrorDialog('ไม่สามารถลบข้อมูลได้ กรุณาลองใหม่');
      return false;
    }
  }

  /* ===============================
     CLEANUP
  =============================== */
  ngOnDestroy() {
    this.stopRealtime();
  }
}
