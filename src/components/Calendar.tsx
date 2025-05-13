
import React from "react";
import { DayEntry } from "@/types/time-tracker";
import CalendarGrid from "./calendar/CalendarGrid";
import { useIsMobile } from "@/hooks/use-mobile";

interface CalendarProps {
  month: Date;
  entries: DayEntry[];
  onSelectDay: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ month, entries, onSelectDay }) => {
  const isMobile = useIsMobile();
  
  return (
    <CalendarGrid 
      month={month} 
      entries={entries} 
      onSelectDay={onSelectDay} 
      isMobile={isMobile}
    />
  );
};

export default Calendar;
