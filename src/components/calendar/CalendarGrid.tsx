
import React from "react";
import { DayEntry, ReportStatus } from "@/types/time-tracker";
import { DayCard } from "./DayCard";
import { DayHeader } from "./DayHeader";

interface CalendarGridProps {
  month: Date;
  entries?: DayEntry[];
  onSelectDay: (date: Date) => void;
  isMobile?: boolean;
  reportStatus: ReportStatus;
  showDayLabels?: boolean; // Add a prop to control showing day labels
  children?: (day: number | null, dayIndex: number) => React.ReactNode;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ 
  month, 
  entries = [], 
  onSelectDay, 
  isMobile = false,
  reportStatus,
  showDayLabels = true, // Default to showing day labels
  children 
}) => {
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Adjust for Monday start
  
  // Create calendar array with proper padding for the first week
  const calendar = [...Array(emptyDays).fill(null), ...days];
  
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // For mobile view, we'll just show all days in sequence
  if (isMobile) {
    return (
      <div className="flex flex-col gap-2">
        {showDayLabels && (
          <div className="grid grid-cols-7 gap-3">
            {dayLabels.map((day) => (
              <DayHeader key={day} day={day} />
            ))}
          </div>
        )}
        
        <div className="flex flex-col gap-4">
          {Array.from({ length: Math.ceil(calendar.length / 7) }).map((_, weekIndex) => (
            <div key={`week-${weekIndex}`} className="grid grid-cols-7 gap-3">
              {calendar.slice(weekIndex * 7, weekIndex * 7 + 7).map((day, dayIndex) => (
                children ? 
                  children(day as number | null, weekIndex * 7 + dayIndex) :
                  <DayCard
                    key={`day-${weekIndex}-${dayIndex}`}
                    day={day}
                    month={month}
                    entries={entries}
                    onSelectDay={onSelectDay}
                    reportStatus={reportStatus}
                  />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Desktop view with wider spacing to prevent overlapping
  return (
    <div className="w-full max-w-full overflow-x-auto">
      {showDayLabels && (
        <div className="grid grid-cols-7 gap-3 mb-3">
          {dayLabels.map((day) => (
            <DayHeader key={day} day={day} />
          ))}
        </div>
      )}
      
      <div className="grid grid-cols-7 gap-3">
        {calendar.map((day, index) => (
          children ? 
            children(day as number | null, index) : 
            <DayCard
              key={`day-${index}`}
              day={day}
              month={month}
              entries={entries}
              onSelectDay={onSelectDay}
              reportStatus={reportStatus}
            />
        ))}
      </div>
    </div>
  );
};

export default CalendarGrid;
