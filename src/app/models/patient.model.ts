export interface Patient {
  prescriptionno: string;
  queue: string;
  hn: string;
  patientname: string;
  createdDT: Date;
  checkDT: Date | null;
  userCheck: string | null;
  timeConfirm: Date;
  zone: string;
  age: number;
}
