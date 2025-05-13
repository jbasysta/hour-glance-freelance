
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
import { DayStatusBadge } from "./DayStatusBadge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useIsMobile } from "@/hooks/use-mobile";

interface DayCardProps {
  day: number | null;
  month: Date;
  entries: DayEntry[];
  onSelectDay: (date: Date) => void;
}

export const DayCard: React.FC<DayCardProps> = ({ day, month, entries, onSelectDay }) => {
  const isMobile = useIsMobile();
  
  if (day === null) {
    return (
      <Card className="invisible rounded-md flex flex-col p-2 relative" style={{ width: "110px", height: "150px" }}>
        <CardContent className="p-0"></CardContent>
      </Card>
    );
  }

  const date = new Date(month.getFullYear(), month.getMonth(), day);
  const isToday = new Date().toDateString() === date.toDateString();
  const isWeekend = !isWeekday(date);
  const isFuture = isFutureDate(date);
  const dayEntries = getDayEntries();
  const lessHours = isLessThanExpected();
  const isMissed = shouldMarkAsMissed();
  
  const totalHours = dayEntries.reduce((total, entry) => {
    return entry.status === "worked" ? total + entry.hours : total;
  }, 0);
  
  // Get unique statuses from entries
  const statuses = [...new Set(dayEntries.map(entry => entry.status))];

  function getDayEntries(): DayEntry[] {
    return entries.filter(entry => 
      entry.date.getFullYear() === date.getFullYear() &&
      entry.date.getMonth() === date.getMonth() &&
      entry.date.getDate() === date.getDate()
    );
  }

  function isLessThanExpected(): boolean {
    if (dayEntries.length === 0) return false;
    
    const totalHours = dayEntries.reduce((total, entry) => {
      return entry.status === "worked" ? total + entry.hours : total;
    }, 0);
    
    return isWeekday(date) && totalHours > 0 && totalHours < 8;
  }
  
  function shouldMarkAsMissed(): boolean {
    // Only consider past weekdays
    if (!isPastDate(date) || !isWeekday(date)) return false;
    
    // If no entries or all entries are missed, day should be marked as missed
    return dayEntries.length === 0 || dayEntries.every(entry => entry.status === "missed");
  }

  let cardClasses = "rounded-md flex flex-col p-2 relative";
  
  if (isToday) {
    cardClasses += " ring-2 ring-proxify-blue";
  }
  
  if (isWeekend) {
    cardClasses += " bg-gray-100";
  } else if (isFuture) {
    cardClasses += " bg-gray-50";
  } else {
    cardClasses += " bg-white";
  }

  return (
    <Card className={cardClasses} style={{ width: "110px", height: "150px" }}>
      <CardContent className="p-0 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start">
          <span className="font-medium text-black">{day}</span>
          {(dayEntries.length > 0 || isMissed) && (
            <DayStatusBadge 
              isMissed={isMissed} 
              dayEntries={dayEntries} 
              statuses={statuses} 
            />
          )}
        </div>
        
        {dayEntries.length > 0 && dayEntries.some(e => e.status === "worked") && (
          <div className="mt-2 text-center relative">
            <span className="text-lg font-bold text-black">{totalHours}h</span>
            
            {dayEntries.length > 1 && (
              <div className="flex items-center justify-center mt-1">
                <BriefcaseIcon className="h-4 w-4 mr-1 text-gray-500 opacity-50" />
                <span className="text-xs text-black">{dayEntries.length} projects</span>
              </div>
            )}
            
            {/* Underreported hours indicator in orange */}
            {lessHours && (
              <div className="flex items-center justify-center mt-1">
                <AlertTriangleIcon className="h-4 w-4 mr-1 text-orange-500 opacity-70" />
                <span className="text-xs text-orange-500">Underreported</span>
              </div>
            )}
          </div>
        )}
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="mt-auto w-full h-6 justify-center text-proxify-blue bg-proxify-lavender/10 hover:bg-proxify-blue hover:text-white"
          onClick={() => onSelectDay(date)}
          disabled={isFuture}
          style={{ height: "24px" }}
        >
          {dayEntries.length > 0 ? "Edit" : "Add"}
        </Button>
      </CardContent>
    </Card>
  );
};
