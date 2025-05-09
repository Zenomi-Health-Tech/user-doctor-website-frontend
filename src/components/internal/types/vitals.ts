export interface ECGDataPoint {
    e: number;  // ECG value
    t: number;  // timestamp
  }
  
  export interface Vitals {
    t: number;    // timestamp
    hr: number;   // heart rate
    skt: number;  // skin temperature
    hrv: number;  // heart rate variability
    spo2: number; // oxygen saturation
    rr: number;   // respiratory rate
    sp: number;
    dp: number;
  }
  
  export interface WebSocketData {
    b: number;
    pid: number;
    mac: string;
    cid: string;
    clid: number;
    test_id: string;
    sNo: number;
    start_time: number;
    end_time: number;
    duration: number;
    status: number;
    vitals: Vitals;
    ecg_clean: ECGDataPoint[];
  } 