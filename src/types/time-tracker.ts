
export type CheckInStatus = "worked" | "missed" | "day-off" | "suspended-client";

export interface DayEntry {
  date: Date;
  hours: number;
  status: CheckInStatus;
}

export interface MonthSummary {
  expectedHours: number;
  reportedHours: number;
  remainingHours: number;
  contractedHours: number;
  monthlySalary: number;
  missedDays: number;
  missedDaysCost: number;
  hourlyRate: number;
  deviationHours: number;
  deviationCost: number;
  earnedFlexDays: number;
  subtotal: number;
}
