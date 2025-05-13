
import React from "react";
import { DayEntry, CheckInStatus } from "@/types/time-tracker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDayOfMonth, isWeekday } from "@/utils/date-utils";

interface CalendarProps {
  month: Date;
  entries: DayEntry[];
  onSelectDay: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ month, entries, onSelectDay }) => {
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Adjust for Monday start
  
  // Create calendar array with proper padding for the first week
  const calendar = [...Array(emptyDays).fill(null), ...days];
  
  const getEntryForDay = (day: number | null): DayEntry | undefined => {
    if (day === null) return undefined;
    
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    return entries.find(entry => 
      entry.date.getFullYear() === date.getFullYear() &&
      entry.date.getMonth() === date.getMonth() &&
      entry.date.getDate() === date.getDate()
    );
  };
  
  const getStatusColor = (status: CheckInStatus): string => {
    switch (status) {
      case "worked": return "bg-green-500";
      case "missed": return "bg-red-500";
      case "day-off": return "bg-gray-300";
      case "suspended-client": return "bg-yellow-500";
      default: return "bg-gray-200";
    }
  };

  const getDayClass = (day: number | null): string => {
    if (day === null) return "invisible";
    
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    const isToday = new Date().toDateString() === date.toDateString();
    const isWeekend = !isWeekday(date);
    
    let classes = "aspect-square rounded-md flex flex-col p-2 relative";
    
    if (isToday) {
      classes += " ring-2 ring-primary";
    }
    
    if (isWeekend) {
      classes += " bg-gray-100";
    } else {
      classes += " bg-white";
    }
    
    return classes;
  };

  return (
    <div className="grid grid-cols-7 gap-1">
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
        <div key={day} className="text-center font-medium py-2">
          {day}
        </div>
      ))}
      
      {calendar.map((day, index) => {
        const entry = getEntryForDay(day);
        const date = day ? new Date(month.getFullYear(), month.getMonth(), day) : null;
        
        return (
          <Card 
            key={`day-${index}`} 
            className={getDayClass(day)}
          >
            <CardContent className="p-0 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <span className="font-medium">{day}</span>
                {entry && (
                  <Badge className={getStatusColor(entry.status)}>
                    {entry.status}
                  </Badge>
                )}
              </div>
              
              {entry && entry.status === "worked" && (
                <div className="mt-2 text-center">
                  <span className="text-lg font-bold">{entry.hours}h</span>
                </div>
              )}
              
              {day && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-auto w-full justify-center"
                  onClick={() => date && onSelectDay(date)}
                >
                  {entry ? "Edit" : "Add"}
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default Calendar;
