
export type CheckInStatus = "worked" | "missed" | "day-off" | "suspended-client";
export type ReportStatus = "approved" | "upcoming" | "declined" | "pending-approval";

export interface Project {
  id: string;
  name: string;
}

export interface DayEntry {
  date: Date;
  hours: number;
  status: CheckInStatus;
  projectId: string;
  projectName: string;
}

export interface TimeReport {
  month: number;
  year: number;
  reportStatus: ReportStatus;
  submittedAt?: Date;
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
