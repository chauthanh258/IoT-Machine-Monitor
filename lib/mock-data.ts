import type {
  Machine,
  MachineStatus,
  ErrorEvent,
  ProductionData,
  WaveformData,
} from "./types";

const machineModels = ["UBE HH-450", "UBE em-350", "UBE MMX-280", "UBE UF-500", "Engel e-mac 310"];
const statuses: MachineStatus[] = ["running", "running", "running", "manual", "alarmed", "warning", "offline"];
const groups = ["Line A", "Line B", "Line C", "Assembly"];

function randomInRange(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function generateMachineParameters() {
  return {
    machineStatus: "Auto",
    moldControlStatus: "Normal",
    lifeLongOperationHours: randomInRange(10000, 50000),
    shotCounter: Math.floor(randomInRange(100000, 999999)),
    specificInjectionPressure: randomInRange(800, 1200),
    hydraulicPressureSwitchover: randomInRange(400, 600),
    holdingPressurePeak: randomInRange(300, 500),
    materialCushion: randomInRange(5, 15),
    barrelTemp1: { actual: randomInRange(195, 205), set: 200 },
    barrelTemp2: { actual: randomInRange(205, 215), set: 210 },
    barrelTemp3: { actual: randomInRange(215, 225), set: 220 },
    barrelTemp4: { actual: randomInRange(225, 235), set: 230 },
    barrelTemp5: { actual: randomInRange(235, 245), set: 240 },
    nozzleTemp: { actual: randomInRange(235, 245), set: 240 },
    moldTemp1: { actual: randomInRange(75, 85), set: 80 },
    moldTemp2: { actual: randomInRange(75, 85), set: 80 },
    oilTemp: randomInRange(38, 45),
    injectionTime: randomInRange(0.8, 1.5),
    plasticisingTime: randomInRange(4, 8),
    coolingTime: randomInRange(10, 20),
    cycleTime: randomInRange(25, 40),
    moldClosingTime: randomInRange(1.5, 2.5),
    moldOpeningTime: randomInRange(1.5, 2.5),
    screwPosition: randomInRange(10, 50),
    torquePeakValue: randomInRange(50, 90),
    clampingForce: randomInRange(2000, 4500),
    moldClosingForce: randomInRange(2000, 4500),
    productionNumber: Math.floor(randomInRange(100, 1000)),
    moldedPartNumber: `P${Math.floor(randomInRange(1000, 9999))}`,
    cavityNumber: Math.floor(randomInRange(1, 8)),
    totalEnergyMeanValue: randomInRange(15, 35),
    manifoldFlow1: randomInRange(5, 15),
    manifoldFlow2: randomInRange(5, 15),
    manifoldTemp1: randomInRange(20, 30),
    manifoldTemp2: randomInRange(20, 30),
    manifoldPressure1: randomInRange(3, 6),
    manifoldPressure2: randomInRange(3, 6),
  };
}

export function generateMachines(count: number = 24): Machine[] {
  const machines: Machine[] = [];
  const cols = 6;

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;

    machines.push({
      id: `M${String(i + 1).padStart(3, "0")}`,
      name: `Machine ${i + 1}`,
      model: machineModels[i % machineModels.length],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      position: {
        x: 80 + col * 150,
        y: 80 + row * 120,
      },
      group: groups[Math.floor(i / 6) % groups.length],
      parameters: generateMachineParameters(),
    });
  }

  return machines;
}

export function generateErrorEvents(machines: Machine[]): ErrorEvent[] {
  const errorTypes: ErrorEvent["type"][] = ["pressure", "temperature", "mechanical", "electrical", "communication"];
  const severities: ErrorEvent["severity"][] = ["warning", "error", "critical"];
  const events: ErrorEvent[] = [];

  const messages: Record<ErrorEvent["type"], string[]> = {
    pressure: [
      "Injection pressure exceeded threshold",
      "Hydraulic pressure deviation detected",
      "Holding pressure out of range",
    ],
    temperature: [
      "Barrel zone temperature anomaly",
      "Nozzle temperature deviation",
      "Mold temperature warning",
      "Oil temperature high",
    ],
    mechanical: [
      "Screw position error",
      "Mold closing force deviation",
      "Clamping unit malfunction",
    ],
    electrical: [
      "Servo motor overload",
      "Power supply fluctuation",
      "Sensor communication error",
    ],
    communication: [
      "Network connection lost",
      "Data transmission timeout",
      "Protocol mismatch detected",
    ],
  };

  for (let i = 0; i < 50; i++) {
    const machine = machines[Math.floor(Math.random() * machines.length)];
    const type = errorTypes[Math.floor(Math.random() * errorTypes.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const messageList = messages[type];

    events.push({
      id: `E${String(i + 1).padStart(4, "0")}`,
      machineId: machine.id,
      machineName: machine.name,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      type,
      severity,
      message: messageList[Math.floor(Math.random() * messageList.length)],
      resolved: Math.random() > 0.3,
      parameter: type === "temperature" ? "barrelTemp1" : type === "pressure" ? "specificInjectionPressure" : undefined,
      value: type === "temperature" ? randomInRange(200, 260) : type === "pressure" ? randomInRange(800, 1400) : undefined,
    });
  }

  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function generateProductionData(machines: Machine[]): ProductionData[] {
  const data: ProductionData[] = [];
  const today = new Date();

  for (let day = 0; day < 7; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() - day);
    const dateStr = date.toISOString().split("T")[0];

    for (const machine of machines.slice(0, 12)) {
      const planned = Math.floor(randomInRange(800, 1200));
      const actual = Math.floor(planned * randomInRange(0.85, 1.05));
      const rejects = Math.floor(actual * randomInRange(0.01, 0.05));

      data.push({
        machineId: machine.id,
        machineName: machine.name,
        date: dateStr,
        planned,
        actual,
        rejects,
        runRate: Math.round((actual / planned) * 100),
        lot: `LOT-${dateStr.replace(/-/g, "")}-${machine.id}`,
      });
    }
  }

  return data;
}

export function generateWaveformData(
  machineId: string,
  parameter: string,
  unit: string,
  duration: number = 60
): WaveformData {
  const data: { time: number; value: number }[] = [];
  const baseValue = parameter.includes("Pressure") ? 500 : parameter.includes("Temp") ? 220 : 50;
  const variance = baseValue * 0.1;

  for (let t = 0; t <= duration; t += 0.5) {
    data.push({
      time: t,
      value: baseValue + Math.sin(t * 0.5) * variance * 0.5 + (Math.random() - 0.5) * variance,
    });
  }

  return {
    machineId,
    parameter,
    unit,
    data,
  };
}

export const machines = generateMachines(24);
export const errorEvents = generateErrorEvents(machines);
export const productionData = generateProductionData(machines);
