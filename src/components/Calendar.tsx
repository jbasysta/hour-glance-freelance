
import React from "react";
import { DayEntry, CheckInStatus } from "@/types/time-tracker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDayOfMonth, isWeekday, isFutureDate } from "@/utils/date-utils";
import { AlertTriangleIcon, BriefcaseIcon } from "lucide-react";

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
  
  const getEntriesForDay = (day: number | null): DayEntry[] => {
    if (day === null) return [];
    
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    return entries.filter(entry => 
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
    const isFuture = isFutureDate(date);
    
    let classes = "aspect-square rounded-md flex flex-col p-2 relative";
    
    if (isToday) {
      classes += " ring-2 ring-primary";
    }
    
    if (isWeekend) {
      classes += " bg-gray-100";
    } else if (isFuture) {
      classes += " bg-gray-50";
    } else {
      classes += " bg-white";
    }
    
    return classes;
  };

  // Check if hours are less than expected
  const isLessThanExpected = (dayEntries: DayEntry[], date: Date | null): boolean => {
    if (dayEntries.length === 0 || !date) return false;
    
    const totalHours = dayEntries.reduce((total, entry) => {
      return entry.status === "worked" ? total + entry.hours : total;
    }, 0);
    
    return isWeekday(date) && totalHours > 0 && totalHours < 8;
  };

  return (
    <div className="grid grid-cols-7 gap-1">
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
        <div key={day} className="text-center font-medium py-2">
          {day}
        </div>
      ))}
      
      {calendar.map((day, index) => {
        const dayEntries = getEntriesForDay(day);
        const date = day ? new Date(month.getFullYear(), month.getMonth(), day) : null;
        const lessHours = isLessThanExpected(dayEntries, date);
        const isFuture = date ? isFutureDate(date) : false;
        
        const totalHours = dayEntries.reduce((total, entry) => {
          return entry.status === "worked" ? total + entry.hours : total;
        }, 0);
        
        // Get unique statuses from entries
        const statuses = [...new Set(dayEntries.map(entry => entry.status))];
        
        return (
          <Card 
            key={`day-${index}`} 
            className={getDayClass(day)}
          >
            <CardContent className="p-0 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <span className="font-medium">{day}</span>
                {dayEntries.length > 0 && statuses.length === 1 && (
                  <Badge className={getStatusColor(statuses[0])}>
                    {statuses[0]}
                  </Badge>
                )}
                {dayEntries.length > 0 && statuses.length > 1 && (
                  <Badge className="bg-blue-500">multiple</Badge>
                )}
              </div>
              
              {dayEntries.length > 0 && dayEntries.some(e => e.status === "worked") && (
                <div className="mt-2 text-center relative">
                  <span className="text-lg font-bold">{totalHours}h</span>
                  
                  {dayEntries.length > 1 && (
                    <div className="flex items-center justify-center mt-1 text-blue-600">
                      <BriefcaseIcon className="h-4 w-4 mr-1" />
                      <span className="text-xs">{dayEntries.length} projects</span>
                    </div>
                  )}
                  
                  {/* Add indicator for less than expected hours */}
                  {lessHours && (
                    <div className="flex items-center justify-center mt-1 text-amber-600">
                      <AlertTriangleIcon className="h-4 w-4 mr-1" />
                      <span className="text-xs">Underreported</span>
                    </div>
                  )}
                </div>
              )}
              
              {day && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-auto w-full justify-center"
                  onClick={() => date && onSelectDay(date)}
                  disabled={isFuture}
                >
                  {dayEntries.length > 0 ? "Edit" : "Add"}
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
