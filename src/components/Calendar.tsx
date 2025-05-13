
import React from "react";
import { DayEntry, ReportStatus } from "@/types/time-tracker";
import CalendarGrid from "./calendar/CalendarGrid";
import { DayHeader } from "./calendar/DayHeader";
import { DayCard } from "./calendar/DayCard";

interface CalendarProps {
  month: Date;
  entries: DayEntry[];
  onSelectDay: (date: Date) => void;
  reportStatus: ReportStatus;
}

const Calendar: React.FC<CalendarProps> = ({ month, entries, onSelectDay, reportStatus }) => {
  // Calendar header with day names - updated to start from Monday
  const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="calendar">
      {/* Calendar header row with day names */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdayLabels.map((dayName, i) => (
          <DayHeader key={i} name={dayName} />
        ))}
      </div>

      {/* Calendar grid with days */}
      <CalendarGrid 
        month={month} 
        entries={entries}
        onSelectDay={onSelectDay}
        reportStatus={reportStatus}
        showDayLabels={false} // Turn off day labels in the grid since we're showing them above
      >
        {(day, dayIndex) => (
          <DayCard 
            key={dayIndex} 
            day={day} 
            month={month} 
            entries={entries} 
            onSelectDay={onSelectDay}
            reportStatus={reportStatus}
          />
        )}
      </CalendarGrid>
    </div>
  );
};

export default Calendar;
