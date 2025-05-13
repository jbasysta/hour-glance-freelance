
import React from "react";

interface DayHeaderProps {
  day: string;
}

export const DayHeader: React.FC<DayHeaderProps> = ({ day }) => {
  return (
    <div key={day} className="text-center font-semibold py-2 text-black">
      {day}
    </div>
  );
};
