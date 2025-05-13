import React from "react";
import { DayEntry, CheckInStatus } from "@/types/time-tracker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDayOfMonth, isWeekday, isFutureDate, isPastDate } from "@/utils/date-utils";
import { 
  AlertTriangleIcon, 
  BriefcaseIcon, 
  InfoIcon,
  CheckIcon,
  XIcon,
  ClockIcon,
  CalendarIcon
} from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

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
      case "worked": return "bg-proxify-green text-white";
      case "missed": return "bg-red-500 text-white";
      case "day-off": return "bg-gray-300 text-gray-800";
      case "suspended-client": return "bg-proxify-yellow text-black";
      default: return "bg-gray-200 text-gray-800";
    }
  };

  const getStatusIcon = (status: CheckInStatus) => {
    switch (status) {
      case "worked": return <CheckIcon className="h-3.5 w-3.5 text-white" />;
      case "missed": return <XIcon className="h-3.5 w-3.5 text-white" />;
      case "day-off": return <CalendarIcon className="h-3.5 w-3.5 text-gray-600" />;
      case "suspended-client": return <ClockIcon className="h-3.5 w-3.5 text-black" />;
      default: return <InfoIcon className="h-3.5 w-3.5 text-gray-600" />;
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
      classes += " ring-2 ring-proxify-blue";
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
  
  // Check if day should be marked as missed
  const shouldMarkAsMissed = (day: number | null): boolean => {
    if (day === null) return false;
    
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    
    // Only consider past weekdays
    if (!isPastDate(date) || !isWeekday(date)) return false;
    
    const dayEntries = getEntriesForDay(day);
    
    // If no entries or all entries are missed, day should be marked as missed
    return dayEntries.length === 0 || dayEntries.every(entry => entry.status === "missed");
  };

  return (
    <div className="grid grid-cols-7 gap-1">
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
        <div key={day} className="text-center font-medium py-2 text-proxify-blue">
          {day}
        </div>
      ))}
      
      {calendar.map((day, index) => {
        const dayEntries = getEntriesForDay(day);
        const date = day ? new Date(month.getFullYear(), month.getMonth(), day) : null;
        const lessHours = isLessThanExpected(dayEntries, date);
        const isFuture = date ? isFutureDate(date) : false;
        const isMissed = shouldMarkAsMissed(day);
        
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
                <span className="font-medium text-black">{day}</span>
                {(dayEntries.length > 0 || isMissed) && (
                  <HoverCard openDelay={100} closeDelay={200}>
                    <HoverCardTrigger asChild>
                      <div className="cursor-help">
                        {isMissed && dayEntries.length === 0 ? (
                          <Badge className="bg-red-500 text-white opacity-90">
                            <XIcon className="h-3.5 w-3.5" />
                          </Badge>
                        ) : dayEntries.length > 0 && statuses.length === 1 ? (
                          <Badge className={`${getStatusColor(statuses[0])} opacity-90`}>
                            {getStatusIcon(statuses[0])}
                          </Badge>
                        ) : (
                          <Badge className="bg-proxify-blue text-white opacity-90">
                            <BriefcaseIcon className="h-3.5 w-3.5" />
                          </Badge>
                        )}
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80 p-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Day Status</h4>
                        {dayEntries.length === 0 && isMissed ? (
                          <p className="text-sm">Missed workday</p>
                        ) : (
                          <div className="space-y-3">
                            {dayEntries.map((entry, i) => (
                              <div key={i} className="border-b border-gray-100 pb-2 last:border-0 last:pb-0 flex flex-col">
                                <div className="flex justify-between items-start">
                                  <span className="font-medium text-sm">{entry.projectName}</span>
                                  <Badge className={getStatusColor(entry.status)} variant="outline">
                                    {entry.status}
                                  </Badge>
                                </div>
                                {entry.status === "worked" && (
                                  <div className="text-sm">Hours: {entry.hours}</div>
                                )}
                                {entry.notes && (
                                  <div className="text-xs mt-1 text-gray-500">
                                    Goals: {entry.notes}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                )}
              </div>
              
              {dayEntries.length > 0 && dayEntries.some(e => e.status === "worked") && (
                <div className="mt-2 text-center relative">
                  <span className="text-lg font-bold text-black">{totalHours}h</span>
                  
                  {dayEntries.length > 1 && (
                    <div className="flex items-center justify-center mt-1">
                      <BriefcaseIcon className="h-4 w-4 mr-1 text-gray-500" />
                      <span className="text-xs text-black">{dayEntries.length} projects</span>
                    </div>
                  )}
                  
                  {/* Add indicator for less than expected hours */}
                  {lessHours && (
                    <div className="flex items-center justify-center mt-1">
                      <AlertTriangleIcon className="h-4 w-4 mr-1 text-proxify-yellow" />
                      <span className="text-xs text-black">Underreported</span>
                    </div>
                  )}
                </div>
              )}
              
              {day && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-auto w-full justify-center text-proxify-blue bg-proxify-lavender/10 hover:bg-proxify-blue hover:text-white"
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
