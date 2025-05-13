
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { CheckInStatus, DayEntry } from "@/types/time-tracker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isWeekday, isFutureDate } from "@/utils/date-utils";

interface TimeEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  onSave: (entry: DayEntry) => void;
  existingEntry?: DayEntry;
  projects: { id: string; name: string }[];
}

const TimeEntryForm: React.FC<TimeEntryFormProps> = ({
  open,
  onOpenChange,
  date,
  onSave,
  existingEntry,
  projects,
}) => {
  const [hours, setHours] = useState<number>(existingEntry?.hours || 8);
  const [status, setStatus] = useState<CheckInStatus>(
    existingEntry?.status || (date ? (isWeekday(date) ? "worked" : "day-off") : "worked")
  );
  const [projectId, setProjectId] = useState<string>(existingEntry?.projectId || (projects[0]?.id || ""));
  
  const isFuture = date ? isFutureDate(date) : false;

  useEffect(() => {
    if (existingEntry) {
      setHours(existingEntry.hours);
      setStatus(existingEntry.status);
      setProjectId(existingEntry.projectId);
    } else if (date) {
      setHours(8);
      setStatus(isWeekday(date) ? "worked" : "day-off");
      setProjectId(projects[0]?.id || "");
    }
  }, [existingEntry, date, projects]);

  const handleSave = () => {
    if (!date) return;
    
    const selectedProject = projects.find(p => p.id === projectId) || projects[0];
    
    onSave({
      date: new Date(date),
      hours: status === "worked" ? hours : 0,
      status,
      projectId: selectedProject.id,
      projectName: selectedProject.name
    });
    
    onOpenChange(false);
  };

  if (!date) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Time Entry for {format(date, "MMMM d, yyyy")}</DialogTitle>
        </DialogHeader>
        
        {isFuture ? (
          <div className="py-6 text-center text-amber-600">
            You cannot edit future dates.
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select 
                value={projectId} 
                onValueChange={setProjectId}
                disabled={isFuture}
              >
                <SelectTrigger id="project">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <RadioGroup 
                id="status" 
                value={status} 
                onValueChange={(value) => setStatus(value as CheckInStatus)}
                className="flex flex-col space-y-1"
                disabled={isFuture}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="worked" id="worked" />
                  <Label htmlFor="worked">Worked</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="missed" id="missed" />
                  <Label htmlFor="missed">Missed</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="day-off" id="day-off" />
                  <Label htmlFor="day-off">Day Off</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="suspended-client" id="suspended-client" />
                  <Label htmlFor="suspended-client">Suspended Client</Label>
                </div>
              </RadioGroup>
            </div>

            {status === "worked" && (
              <div className="space-y-2">
                <Label htmlFor="hours">Hours Worked</Label>
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={hours}
                  onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
                  disabled={isFuture}
                />
              </div>
            )}
          </div>
        )}
        
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSave} 
            disabled={isFuture}
          >
            Save Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TimeEntryForm;
