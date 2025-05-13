
import React from "react";

interface DayHeaderProps {
  name?: string;
  day?: string;
}

export const DayHeader: React.FC<DayHeaderProps> = ({ day, name }) => {
  const displayText = name || day;
  
  return (
    <div className="text-center font-semibold py-2 text-black border-0">
      {displayText}
    </div>
  );
};
