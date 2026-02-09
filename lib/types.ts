export type MachineStatus =
  | "running"
  | "manual"
  | "alarmed"
  | "finished"
  | "error"
  | "warning"
  | "offline";

export interface Machine {
  id: string;
  name: string;
  model: string;
  status: MachineStatus;
  position: { x: number; y: number };
  group: string;
  parameters: MachineParameters;
}

export interface MachineParameters {
  // Machine Status
  machineStatus: string;
  moldControlStatus: string;
  lifeLongOperationHours: number;
  shotCounter: number;

  // Injection
  specificInjectionPressure: number;
  hydraulicPressureSwitchover: number;
  holdingPressurePeak: number;
  materialCushion: number;

  // Temperatures (actual/set)
  barrelTemp1: { actual: number; set: number };
  barrelTemp2: { actual: number; set: number };
  barrelTemp3: { actual: number; set: number };
  barrelTemp4: { actual: number; set: number };
  barrelTemp5: { actual: number; set: number };
  nozzleTemp: { actual: number; set: number };
  moldTemp1: { actual: number; set: number };
  moldTemp2: { actual: number; set: number };
  oilTemp: number;

  // Times
  injectionTime: number;
  plasticisingTime: number;
  coolingTime: number;
  cycleTime: number;
  moldClosingTime: number;
  moldOpeningTime: number;

  // Positions/Speeds
  screwPosition: number;
  torquePeakValue: number;

  // Clamping/Mold
  clampingForce: number;
  moldClosingForce: number;

  // Production
  productionNumber: number;
  moldedPartNumber: string;
  cavityNumber: number;

  // Energy
  totalEnergyMeanValue: number;

  // Water/Manifold
  manifoldFlow1: number;
  manifoldFlow2: number;
  manifoldTemp1: number;
  manifoldTemp2: number;
  manifoldPressure1: number;
  manifoldPressure2: number;
}

export interface ErrorEvent {
  id: string;
  machineId: string;
  machineName: string;
  timestamp: Date;
  type: "pressure" | "temperature" | "mechanical" | "electrical" | "communication";
  severity: "warning" | "error" | "critical";
  message: string;
  resolved: boolean;
  parameter?: string;
  value?: number;
}

export interface ProductionData {
  machineId: string;
  machineName: string;
  date: string;
  planned: number;
  actual: number;
  rejects: number;
  runRate: number;
  lot: string;
}

export interface WaveformDataPoint {
  time: number;
  value: number;
}

export interface WaveformData {
  machineId: string;
  parameter: string;
  unit: string;
  data: WaveformDataPoint[];
}
