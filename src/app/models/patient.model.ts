export interface Drug {
  code: string;
  name: string;
  qty: number;
}

export interface Patient {
  id: string;
  hn: string;
  fullname: string;
  age: number;
  queueNo: string;
  drugs: Drug[];
  stamped?: boolean;
  time?: string;
  status?: string;
  ward?: string;
}
