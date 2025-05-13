
import React from "react";
import { DayEntry, CheckInStatus } from "@/types/time-tracker";
import { Badge } from "@/components/ui/badge";
import { 
  BriefcaseIcon, 
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

  const getStatusIcon = (status: CheckInStatus) => {
    switch (status) {
      case "worked": return <CheckIcon className="h-3.5 w-3.5 text-white opacity-50" />;
      case "missed": return <XIcon className="h-3.5 w-3.5 text-white opacity-50" />;
      case "day-off": return <CalendarIcon className="h-3.5 w-3.5 text-gray-600 opacity-50" />;
      case "suspended-client": return <ClockIcon className="h-3.5 w-3.5 text-black opacity-50" />;
      default: return <BriefcaseIcon className="h-3.5 w-3.5 text-gray-600 opacity-50" />;
    }
  };

  return (
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div className="cursor-help">
          {isMissed && dayEntries.length === 0 ? (
            <Badge className="bg-red-500 text-white opacity-90">
              <XIcon className="h-3.5 w-3.5 opacity-50" />
            </Badge>
          ) : dayEntries.length > 0 && statuses.length === 1 ? (
            <Badge className={`${getStatusColor(statuses[0])} opacity-90`}>
              {getStatusIcon(statuses[0])}
            </Badge>
          ) : (
            <Badge className="bg-proxify-blue text-white opacity-90">
              <BriefcaseIcon className="h-3.5 w-3.5 opacity-50" />
            </Badge>
          )}
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
  );
};
