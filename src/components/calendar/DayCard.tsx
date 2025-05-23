import React from "react";
import { DayEntry, CheckInStatus, ReportStatus } from "@/types/time-tracker";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DayCardProps {
  day: number | null;
  month: Date;
  entries: DayEntry[];
  onSelectDay: (date: Date) => void;
  reportStatus: ReportStatus;
}

export const DayCard: React.FC<DayCardProps> = ({ day, month, entries, onSelectDay, reportStatus }) => {
  const isMobile = useIsMobile();
  
  if (day === null) {
    return (
      <Card className="invisible rounded-md flex flex-col p-2 relative h-[130px]">
        <CardContent className="p-0"></CardContent>
      </Card>
    );
  }

  const date = new Date(month.getFullYear(), month.getMonth(), day);
  const isToday = new Date().toDateString() === date.toDateString();
  const isWeekend = !isWeekday(date);
  const isFuture = isFutureDate(date);
  const dayEntries = getDayEntries();
  
  // Calculate totalHours first since it's used in multiple places
  const totalHours = dayEntries.reduce((total, entry) => {
    return entry.status === "worked" ? total + entry.hours : total;
  }, 0);
  
  // Now we can safely use totalHours in these functions
  const lessHours = isLessThanExpected();
  const isMissed = shouldMarkAsMissed();
  const isLocked = reportStatus !== "declined" && reportStatus !== "upcoming";
  const isLessThan8Hours = totalHours > 0 && totalHours < 8 && isWeekday(date);
  
  // Get unique statuses from entries
  const statuses = [...new Set(dayEntries.map(entry => entry.status))];
  const hasNonWorkedStatuses = dayEntries.some(entry => 
    entry.status === "missed" || entry.status === "day-off" || entry.status === "suspended-client"
  );

  function getDayEntries(): DayEntry[] {
    return entries.filter(entry => 
      entry.date.getFullYear() === date.getFullYear() &&
      entry.date.getMonth() === date.getMonth() &&
      entry.date.getDate() === date.getDate()
    );
  }

  function isLessThanExpected(): boolean {
    if (dayEntries.length === 0) return false;
    
    // Calculate expected hours: 2 hours per project per day (weekday only)
    const uniqueProjects = [...new Set(dayEntries.map(entry => entry.projectId))];
    const expectedHours = isWeekday(date) ? uniqueProjects.length * 2 : 0;
    
    // Use the already calculated totalHours value instead of recalculating it
    return isWeekday(date) && totalHours > 0 && expectedHours > 0 && totalHours < expectedHours;
  }
  
  function shouldMarkAsMissed(): boolean {
    // Only consider past weekdays
    if (!isPastDate(date) || !isWeekday(date)) return false;
    
    // If no entries or all entries are missed, day should be marked as missed
    return dayEntries.length === 0 || dayEntries.every(entry => entry.status === "missed");
  }

  let cardClasses = "rounded-md flex flex-col p-2 relative";
  
  // Set a fixed height for all cards to prevent sizing issues
  cardClasses += " h-[130px]";
  
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

  // Add a locked class for non-editable days
  if (isLocked && !isFuture) {
    cardClasses += " bg-gray-50";
  }

  // Determine if we should show hours (only on past or current weekdays)
  const shouldShowHours = isWeekday(date) && !isFuture;

  return (
    <Card className={cardClasses}>
      <CardContent className="p-0 flex flex-col h-full justify-between border-0">
        <div className="flex justify-between items-start border-0">
          <span className="font-medium text-black border-0">{day}</span>
          {(dayEntries.length > 0 || isMissed) && (
            <DayStatusBadge 
              isMissed={isMissed} 
              dayEntries={dayEntries} 
              statuses={statuses} 
            />
          )}
        </div>
        
        {shouldShowHours && (
          <div className="mt-1 text-center border-0">
            <div className="flex items-center justify-center border-0">
              {/* Add the warning icon before the hours if less than 8 hours */}
              {isLessThan8Hours && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="mr-1 cursor-help border-0">
                        <AlertTriangleIcon className="h-4 w-4 text-amber-500" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs border-0">Reporting less than 8 hours for this day</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <span className="text-lg font-bold text-black border-0">{totalHours}h</span>
            </div>
            
            {/* Underreported hours indicator in orange */}
            {lessHours && (
              <div className="flex items-center justify-center mt-1 border-0">
                <AlertTriangleIcon className="h-3 w-3 mr-1 text-orange-500 opacity-70" />
                <span className="text-xs text-orange-500 border-0">Underreported</span>
              </div>
            )}
          </div>
        )}
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="border-0">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-auto w-full h-6 justify-center text-proxify-blue bg-proxify-lavender/10 hover:bg-proxify-blue hover:text-white border-0"
                  onClick={() => onSelectDay(date)}
                  disabled={isFuture || isLocked}
                  style={{ height: "24px" }}
                >
                  {dayEntries.length > 0 ? "Edit" : "Add"}
                </Button>
              </div>
            </TooltipTrigger>
            {(isFuture || isLocked) && (
              <TooltipContent>
                {isFuture ? "Cannot edit future dates" : `Time report is ${reportStatus}`}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};
