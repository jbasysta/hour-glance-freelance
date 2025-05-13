
import { DayEntry } from "@/types/time-tracker";

// Check if date is a weekday (Monday-Friday)
export const isWeekday = (date: Date): boolean => {
  const day = date.getDay();
  return day >= 1 && day <= 5; // 0 is Sunday, 6 is Saturday
};

// Get all days in a month
export const getDaysInMonth = (year: number, month: number): Date[] => {
  const days: Date[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }
  
  return days;
};

// Get weekdays in a month
export const getWeekdaysInMonth = (year: number, month: number): Date[] => {
  return getDaysInMonth(year, month).filter(isWeekday);
};

// Calculate expected hours in a month (8 hours per weekday)
export const calculateExpectedHours = (year: number, month: number): number => {
  return getWeekdaysInMonth(year, month).length * 8;
};

// Calculate reported hours from entries
export const calculateReportedHours = (entries: DayEntry[]): number => {
  return entries.reduce((total, entry) => {
    return entry.status === "worked" ? total + entry.hours : total;
  }, 0);
};

// Format date as YYYY-MM-DD
export const formatDateYYYYMMDD = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Format date as day of month
export const formatDayOfMonth = (date: Date): string => {
  return date.getDate().toString();
};

// Format month and year
export const formatMonthYear = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

// Calculate month summary
export const calculateMonthSummary = (
  year: number, 
  month: number, 
  entries: DayEntry[],
  contractedHours = 176,
  monthlySalary = 3500,
  hourlyRate = 19.89
): MonthSummary => {
  const expectedHours = calculateExpectedHours(year, month);
  const reportedHours = calculateReportedHours(entries);
  const remainingHours = Math.max(0, expectedHours - reportedHours);
  
  const weekdaysInMonth = getWeekdaysInMonth(year, month);
  const missedDays = weekdaysInMonth.filter(date => {
    const entry = entries.find(e => formatDateYYYYMMDD(e.date) === formatDateYYYYMMDD(date));
    return entry?.status === "missed";
  }).length;
  
  const dailyRate = monthlySalary / weekdaysInMonth.length;
  const missedDaysCost = -(missedDays * dailyRate);
  
  const deviationHours = reportedHours - contractedHours;
  const deviationCost = -(deviationHours < 0 ? Math.abs(deviationHours) * hourlyRate : 0);
  
  const earnedFlexDays = Math.floor((reportedHours - expectedHours) / 8);
  
  const subtotal = missedDaysCost + deviationCost > 0 ? 
    monthlySalary + missedDaysCost + deviationCost : 
    monthlySalary + missedDaysCost + deviationCost;

  return {
    expectedHours,
    reportedHours,
    remainingHours,
    contractedHours,
    monthlySalary,
    missedDays,
    missedDaysCost,
    hourlyRate,
    deviationHours,
    deviationCost,
    earnedFlexDays: Math.max(0, earnedFlexDays),
    subtotal
  };
};
