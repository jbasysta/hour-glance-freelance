
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
          color: "bg-green-100 text-green-800 hover:bg-green-200",
          icon: <Check className="h-3.5 w-3.5 mr-1" />,
          label: "Approved"
        };
      case "upcoming":
        return {
          color: "bg-blue-100 text-blue-800 hover:bg-blue-200",
          icon: <CalendarArrowDown className="h-3.5 w-3.5 mr-1" />,
          label: "Upcoming"
        };
      case "declined":
        return {
          color: "bg-red-100 text-red-800 hover:bg-red-200",
          icon: <X className="h-3.5 w-3.5 mr-1" />,
          label: "Declined"
        };
      case "pending-approval":
        return {
          color: "bg-amber-100 text-amber-800 hover:bg-amber-200",
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
