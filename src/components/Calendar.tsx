
import React from "react";
import { DayEntry } from "@/types/time-tracker";
import CalendarGrid from "./calendar/CalendarGrid";

interface CalendarProps {
  month: Date;
  entries: DayEntry[];
  onSelectDay: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ month, entries, onSelectDay }) => {
  return <CalendarGrid month={month} entries={entries} onSelectDay={onSelectDay} />;
};

export default Calendar;
