import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { QueueService } from 'src/app/services/queue.service';
import { Patient } from 'src/app/models/patient.model';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-matching',
  templateUrl: './matching.component.html',
  styleUrls: ['./matching.component.scss'],
  animations: [
    trigger('rowAnimation', [
      transition(':leave', [
        style({ transform: 'translateX(0)', opacity: 1 }),
        animate(
          '250ms ease-out',
          style({ transform: 'translateX(-100%)', opacity: 0 }),
        ),
      ]),
    ]),
  ],
})
export class MatchingComponent implements OnInit {
  patients: Patient[] = [];
  selected?: Patient;
  scanInput = '';
  displayedColumns = ['queue', 'hn', 'patientname', 'timeConfirm', 'zone'];
  running = true;
  matchingSuccess = false;
  @ViewChild('scanBox') scanBox!: ElementRef;

  constructor(private queueService: QueueService) { }

  ngOnInit() {
    this.queueService.patients$.subscribe((data) => {
      console.log('Updated patients list:', data);
      this.patients = data;
    });
  }
  ngAfterViewInit() {
    this.focus();
  }

  focus() {
    setTimeout(() => this.scanBox?.nativeElement.focus(), 0);
  }
  async scanHN() {
    const hn = this.scanInput.trim();
    let match = await this.queueService.processScan(hn);
    if (match) {
      this.selected = match;
      this.matchingSuccess = true;
      // ซ่อน success message หลังจาก 3 วินาที
      // setTimeout(() => {
      //   this.matchingSuccess = false;
      // }, 3000);
    }

    this.scanInput = '';
    this.focusScan();
  }

  focusScan() {
    setTimeout(() => {
      this.scanBox.nativeElement.focus();
    });
  }
  onClickAnywhere() {
    this.focus();
  }

  toggleRealtime() {
    this.queueService.toggleRealtime();
    this.running = this.queueService.isRunning();
  }
  // autoPrint(patient: Patient) {
  //   window.print();
  // }
}
