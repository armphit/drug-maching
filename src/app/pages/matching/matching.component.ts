import { Component, OnInit } from '@angular/core';
import { QueueService } from 'src/app/services/queue.service';
import { Patient } from 'src/app/models/patient.model';
import { PatientApiService } from 'src/app/services/patient-api.service';

@Component({
  selector: 'app-matching',
  templateUrl: './matching.component.html',
  styleUrls: ['./matching.component.scss'],
})
export class MatchingComponent implements OnInit {
  patients: Patient[] = [];
  selected?: Patient;
  displayedColumns = ['queue', 'hn', 'patientname', 'timeConfirm', 'zone'];
  private zoneFilter?: string;
  private currentQueue: Patient[] = [];

  constructor(private queueService: QueueService, private api: PatientApiService) { }

  ngOnInit() {
    this.loadComputerName();

    this.queueService.patients$.subscribe((data) => {
      this.currentQueue = data;
      this.applyZoneFilter();
    });
  }

  private applyZoneFilter() {
    const queue = Array.isArray(this.currentQueue) ? this.currentQueue : [];
    if (!this.zoneFilter) {
      this.patients = queue;
      return;
    }
    this.patients = queue.filter((p) => p.zone === this.zoneFilter);
    if (this.selected && this.selected.zone !== this.zoneFilter) {
      this.selected = undefined;
    }
  }
  comName: any = null
  async loadComputerName() {
    try {
      this.comName = await this.api.getComputerName().toPromise();
      if (typeof this.comName === 'string') {
        const parts = this.comName.split('-');
        if (parts.length > 1) {
          this.zoneFilter = parts[1];
        }
      }
      this.applyZoneFilter();
    } catch (error) {
      console.error('Error fetching computer name:', error);
    }
  }

  refreshQueue() {
    this.queueService.loadQueue();
  }

  selectRow(patient: Patient) {
    this.selected = patient;
  }

  async printRoute() {
    if (!this.selected || !this.zoneFilter) return;
    await this.queueService.removePatient(this.selected, this.zoneFilter);
  }
}

