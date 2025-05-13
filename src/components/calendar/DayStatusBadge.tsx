
import React from "react";
import { DayEntry, CheckInStatus } from "@/types/time-tracker";
import { Badge } from "@/components/ui/badge";
import { 
  BriefcaseIcon, 
  CheckIcon,
  XIcon,
  CalendarMinusIcon,
  ClockIcon,
  ClockAlert
} from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface DayStatusBadgeProps {
  isMissed: boolean;
  dayEntries: DayEntry[];
  statuses: CheckInStatus[];
}

export const DayStatusBadge: React.FC<DayStatusBadgeProps> = ({ 
  isMissed, dayEntries, statuses 
}) => {
  const getStatusColor = (status: CheckInStatus): string => {
    switch (status) {
      case "worked": return "bg-proxify-green text-white";
      case "missed": return "bg-red-500 text-white";
      case "day-off": return "bg-gray-300 text-gray-800";
      case "suspended-client": return "bg-proxify-yellow text-black";
      default: return "bg-gray-200 text-gray-800";
    }
  };

  // Updated function with the priority order logic and new labels
  const getDayStatusDetails = () => {
    // If no entries and isMissed flag is true, show Missed icon
    if (dayEntries.length === 0 && isMissed) {
      return {
        color: "bg-red-500 text-white",
        icon: <XIcon className="h-3.5 w-3.5 opacity-50" />,
        label: "Missed"
      };
    }
    
    // Priority 1: If at least one project is "worked" - label is worked
    if (dayEntries.some(entry => entry.status === "worked")) {
      return {
        color: "bg-proxify-green text-white",
        icon: <CheckIcon className="h-3.5 w-3.5 text-white opacity-50" />,
        label: "Worked"
      };
    }
    
    // Priority 2: If all projects are missed - label is missed
    if (dayEntries.length > 0 && dayEntries.every(entry => entry.status === "missed")) {
      return {
        color: "bg-red-500 text-white", 
        icon: <XIcon className="h-3.5 w-3.5 text-white opacity-50" />,
        label: "Missed"
      };
    }
    
    // Priority 3: If all projects are day-off - day off label
    if (dayEntries.length > 0 && dayEntries.every(entry => entry.status === "day-off")) {
      return {
        color: "bg-gray-300 text-gray-800",
        icon: <CalendarMinusIcon className="h-3.5 w-3.5 text-gray-600 opacity-50" />,
        label: "Time-off"
      };
    }
    
    // Priority 4: If all projects are suspended - suspended label
    if (dayEntries.length > 0 && dayEntries.every(entry => entry.status === "suspended-client")) {
      return {
        color: "bg-proxify-yellow text-black",
        icon: <ClockAlert className="h-3.5 w-3.5 text-black opacity-50" />,
        label: "Suspended"
      };
    }
    
    // Default case (mixed status or other)
    return {
      color: "bg-proxify-blue text-white",
      icon: <BriefcaseIcon className="h-3.5 w-3.5 opacity-50" />,
      label: "Mixed"
    };
  };

  const { color, icon } = getDayStatusDetails();

  return (
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div className="cursor-help">
          <Badge className={`${color} opacity-90`}>
            {icon}
          </Badge>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-4">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Day Status</h4>
          {dayEntries.length === 0 && isMissed ? (
            <p className="text-sm">
              <span className="font-medium">Missed workday</span>
            </p>
          ) : (
            <div className="space-y-3">
              {dayEntries.map((entry, i) => (
                <div key={i} className="border-b border-gray-100 pb-2 last:border-0 last:pb-0 flex flex-col">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm">{entry.projectName}</span>
                    <Badge className={getStatusColor(entry.status)} variant="outline">
                      {entry.status === "worked" ? "Worked" : 
                       entry.status === "day-off" ? "Time-off" : 
                       entry.status === "suspended-client" ? "Suspended" : 
                       entry.status}
                    </Badge>
                  </div>
                  {entry.status === "worked" ? (
                    <div className="text-sm">Hours: {entry.hours}</div>
                  ) : (
                    <div className="text-sm">Hours: 0</div>
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
  );
};
