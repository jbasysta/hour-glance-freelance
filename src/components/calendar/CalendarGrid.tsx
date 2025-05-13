import React from "react";
import { DayEntry } from "@/types/time-tracker";
import { DayCard } from "./DayCard";
import { DayHeader } from "./DayHeader";

interface CalendarGridProps {
  month: Date;
  entries: DayEntry[];
  onSelectDay: (date: Date) => void;
  isMobile?: boolean;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ month, entries, onSelectDay, isMobile = false }) => {
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
        <div className="grid grid-cols-7 gap-1">
          {dayLabels.map((day) => (
            <DayHeader key={day} day={day} />
          ))}
        </div>
        
        <div className="flex flex-col gap-2">
          {Array.from({ length: Math.ceil(calendar.length / 7) }).map((_, weekIndex) => (
            <div key={`week-${weekIndex}`} className="grid grid-cols-7 gap-1">
              {calendar.slice(weekIndex * 7, weekIndex * 7 + 7).map((day, dayIndex) => (
                <DayCard
                  key={`day-${weekIndex}-${dayIndex}`}
                  day={day}
                  month={month}
                  entries={entries}
                  onSelectDay={onSelectDay}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Desktop view remains the same
  return (
    <div className="grid grid-cols-7 gap-1">
      {dayLabels.map((day) => (
        <DayHeader key={day} day={day} />
      ))}
      
      {calendar.map((day, index) => (
        <DayCard
          key={`day-${index}`}
          day={day}
          month={month}
          entries={entries}
          onSelectDay={onSelectDay}
        />
      ))}
    </div>
  );
};

export default CalendarGrid;
