
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
          color: "bg-proxify-green text-white",
          icon: <Check className="h-3.5 w-3.5 mr-1" />,
          label: "Approved"
        };
      case "upcoming":
        return {
          color: "bg-proxify-blue text-white",
          icon: <CalendarArrowDown className="h-3.5 w-3.5 mr-1" />,
          label: "Upcoming"
        };
      case "declined":
        return {
          color: "bg-red-500 text-white",
          icon: <X className="h-3.5 w-3.5 mr-1" />,
          label: "Declined"
        };
      case "pending-approval":
        return {
          color: "bg-proxify-yellow text-black",
          icon: <Loader className="h-3.5 w-3.5 mr-1" />,
          label: "Pending Approval"
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          icon: null,
          label: "Unknown"
        };
    }
  };

  const { color, icon, label } = getStatusDetails();

  return (
    <Badge className={`flex items-center ${color}`}>
      {icon}
      {label}
    </Badge>
  );
};

export default TimeReportStatus;
