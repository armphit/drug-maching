import { QueueService } from 'src/app/services/queue.service';
import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-patient-loading',
  standalone: true,
  imports: [MatProgressSpinnerModule, MatCardModule],
  template: `
    <div class="fullscreen">
      <mat-card class="box">
        <div class="content">
          <div class="spinner-wrapper">
            <mat-progress-spinner
              class="medical-spinner"
              mode="indeterminate"
              diameter="85"
              strokeWidth="6"
            >
            </mat-progress-spinner>
          </div>

          <div class="info">
            <p class="patient-name">
              {{ patient?.fullname || 'ชื่อ-นามสกุล' }}
            </p>
            <p class="patient-hn">
              HN: {{ patient?.hn || '00000000' }} Queue No:
              {{ patient?.queueNo||patient?.phar_queue||patient?.queue || '00000000' }}
            </p>

            <div class="status-container">
              <span class="status-text">กำลังดำเนินการ</span>
              <span class="loading-dots"></span>
            </div>
          </div>
        </div>
      </mat-card>
    </div>
  `,
  styles: [
    `
      /* 1. พื้นหลัง: ใช้ Gradient สีเทาฟ้าอ่อนๆ ดูสะอาดตาเหมือนคลินิก */
      .fullscreen {
        width: 100vw;
        height: 100vh;
        // background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
        display: flex;
        justify-content: center;
        align-items: center;
      }

      /* 2. การ์ด: ปรับเงาให้ฟุ้ง นุ่มนวล (Soft Shadow) และเพิ่มขอบมน */
      .box {
        padding: 40px 80px;
        border-radius: 24px !important; /* โค้งมนมากขึ้น */
        background-color: #ffffff;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06) !important;
        border: 1px solid rgba(255, 255, 255, 0.6);
      }

      .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 28px; /* เพิ่มระยะห่างให้ดูไม่อึดอัด */
      }

      /* 3. Spinner: แต่งสีและเส้น */
      .spinner-wrapper {
        padding: 8px;
        border-radius: 50%;
        background: #f8fafc; /* สีพื้นรองหลัง Spinner อ่อนๆ */
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
      }

      /* ⭐ ใช้ ::ng-deep ทะลุเข้าไปเปลี่ยนสีเส้น Spinner และทำให้ปลายเส้นมน (round) */
      ::ng-deep .medical-spinner circle {
        stroke: #0284c7 !important; /* สีฟ้าการแพทย์ (ปรับเป็นสีประจำโรงพยาบาลได้) */
        stroke-linecap: round !important; /* ทำให้เส้นดู Smooth ไม่แข็งกระด้าง */
      }

      /* 4. ข้อความ (Typography) */
      .info {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .patient-name {
        margin: 1;
        font-size: 40px;
        font-weight: 700;
        color: #1e293b; /* สีเทาเข้ม (Soft Black) สบายตากว่าสีดำสนิท #000 */
      }

      .patient-hn {
        margin: 0;
        font-size: 35px;
        font-weight: 700;
        color: #64748b; /* สีเทาอ่อน ลดความสนใจลงมา ให้ชื่อเด่นกว่า */
      }

      /* 5. สถานะ และ Animation ให้ดูทันสมัย */
      .status-container {
        margin-top: 12px;
        display: flex;
        justify-content: center;
        color: #0284c7; /* สีเดียวกับ Spinner */
        font-weight: 500;
        font-size: 26px;
      }

      /* ทำให้ตัวหนังสือจาง-เข้ม สลับกันเบาๆ */
      .status-text {
        font-size: 30px;
        font-weight: 700;
        animation: pulseText 8s infinite ease-in-out;
      }

      /* ทำให้จุด ... ขยับได้เหมือนกำลังโหลดข้อมูลจริงๆ */
      .loading-dots::after {
        content: '.';
        animation: dots 1.5s steps(4, end) infinite;
        display: inline-block;
        width: 16px;
        text-align: left;
        font-size: 30px;
        font-weight: 700;
      }

      @keyframes pulseText {
        0% {
          opacity: 0.6;
        }
        50% {
          opacity: 1;
        }
        100% {
          opacity: 0.6;
        }
      }

      @keyframes dots {
        0% {
          content: '';
        }
        25% {
          content: '.';
        }
        50% {
          content: '..';
        }
        75%,
        100% {
          content: '...';
        }
      }
    `,
  ],
})
export class LoadingOverlayPortalComponent {
  @Input() patient: any;
}
