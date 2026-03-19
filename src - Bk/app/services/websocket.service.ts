import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Patient } from '../models/patient.model';

@Injectable({ providedIn: 'root' })
export class WsService {
  private socket?: WebSocket;
  private _stream = new Subject<Patient[]>();
  stream$ = this._stream.asObservable();

  private connected = false;

  /* ======================= */
  /* CONNECT */
  connect() {
    if (this.connected) return;

    this.socket = new WebSocket('ws://localhost:3000');

    this.socket.onopen = () => {
      this.connected = true;
      console.log('WS connected');
    };

    this.socket.onmessage = (msg) => {
      const data = JSON.parse(msg.data);

      if (data.type === 'NEW_PATIENT') {
        this._stream.next(data.data);
      }
    };

    this.socket.onclose = () => {
      this.connected = false;
      console.log('WS closed');
    };
  }

  /* ======================= */
  /* ⭐⭐ ตัวที่คุณขาดอยู่ */
  disconnect() {
    if (!this.socket) return;

    this.socket.close(); // ปิด socket จริง
    this.socket = undefined;
    this.connected = false;
  }

  /* ======================= */

  isConnected() {
    return this.connected;
  }
}
