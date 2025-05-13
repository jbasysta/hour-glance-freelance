import { DayEntry, TimeReport } from "@/types/time-tracker";
import { MonthSummary } from "@/types/time-tracker";

// Check if date is a weekday (Monday-Friday)
export const isWeekday = (date: Date | null): boolean => {
  if (!date) return false; // Handle null date case
  const day = date.getDay();
  return day >= 1 && day <= 5; // 0 is Sunday, 6 is Saturday
};

// Check if date is in the future
export const isFutureDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
};

// Check if date is in the past
export const isPastDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate < today;
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

// Get previous months until a specified date
export const getPreviousMonths = (currentDate: Date, count: number = 6): { month: number; year: number }[] => {
  const result = [];
  const date = new Date(currentDate);
  
  for (let i = 0; i < count; i++) {
    date.setMonth(date.getMonth() - 1);
    result.push({
      month: date.getMonth(),
      year: date.getFullYear()
    });
  }
  
  return result;
};

// Auto-populate entries for previous months if they don't exist
export const autopopulatePreviousMonths = (
  entries: DayEntry[], 
  projects: { id: string; name: string }[]
): DayEntry[] => {
  if (projects.length === 0) return entries;
  
  const defaultProject = projects[0];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get the last 3 months
  const previousMonths = getPreviousMonths(today, 3);
  let newEntries = [...entries];
  
  // For each previous month, check weekdays and create default entries if none exist
  previousMonths.forEach(({ month, year }) => {
    const weekdays = getWeekdaysInMonth(year, month);
    
    weekdays.forEach(date => {
      // Skip future dates and weekends
      if (date >= today || !isWeekday(date)) return;
      
      // Check if entry already exists for this date
      const existingEntry = newEntries.find(e => 
        e.date.getFullYear() === date.getFullYear() &&
        e.date.getMonth() === date.getMonth() &&
        e.date.getDate() === date.getDate()
      );
      
      // If no entry exists, create a default one
      if (!existingEntry) {
        newEntries.push({
          date: new Date(date),
          hours: 8,
          status: "worked",
          projectId: defaultProject.id,
          projectName: defaultProject.name
        });
      }
    });
  });
  
  return newEntries;
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
  
  // New formula for earned flex days
  const earnedFlexDays = Math.max(0, 2 * (reportedHours / expectedHours));
  
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
    earnedFlexDays: parseFloat(earnedFlexDays.toFixed(1)),
    subtotal
  };
};
