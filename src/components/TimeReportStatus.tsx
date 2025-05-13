
import React from "react";
import { ReportStatus } from "@/types/time-tracker";
import { Badge } from "@/components/ui/badge";
import { Check, CalendarArrowDown, X, Loader } from "lucide-react";

interface TimeReportStatusProps {
  status: ReportStatus;
}

const TimeReportStatus: React.FC<TimeReportStatusProps> = ({ status }) => {
  const getStatusDetails = () => {
    switch (status) {
      case "approved":
        return {
          color: "bg-proxify-green text-white hover:bg-proxify-green/90",
          icon: <Check className="h-3.5 w-3.5 mr-1" />,
          label: "Approved"
        };
      case "upcoming":
        return {
          color: "bg-proxify-blue text-white hover:bg-proxify-blue/90",
          icon: <CalendarArrowDown className="h-3.5 w-3.5 mr-1" />,
          label: "Upcoming"
        };
      case "declined":
        return {
          color: "bg-red-500 text-white hover:bg-red-600",
          icon: <X className="h-3.5 w-3.5 mr-1" />,
          label: "Declined"
        };
      case "pending-approval":
        return {
          color: "bg-proxify-yellow text-black hover:bg-proxify-yellow/90",
          icon: <Loader className="h-3.5 w-3.5 mr-1 animate-spin" />,
          label: "Pending Approval"
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 hover:bg-gray-200",
          icon: null,
          label: "Unknown"
        };
    }
  };

  const { color, icon, label } = getStatusDetails();

  return (
    <Badge className={`flex items-center ${color}`} variant="outline">
      {icon}
      {label}
    </Badge>
  );
};

export default TimeReportStatus;
