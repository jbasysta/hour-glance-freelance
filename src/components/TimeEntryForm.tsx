
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { CheckInStatus, DayEntry, ReportStatus } from "@/types/time-tracker";
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
import { Textarea } from "@/components/ui/textarea";
import { isWeekday, isFutureDate } from "@/utils/date-utils";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TimeEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  onSave: (entry: DayEntry) => void;
  existingEntry?: DayEntry;
  projects: { id: string; name: string }[];
  reportStatus: ReportStatus;
}

const TimeEntryForm: React.FC<TimeEntryFormProps> = ({
  open,
  onOpenChange,
  date,
  onSave,
  existingEntry,
  projects,
  reportStatus,
}) => {
  const [hours, setHours] = useState<number>(existingEntry?.hours || 8);
  const [status, setStatus] = useState<CheckInStatus>(
    existingEntry?.status || (date ? (isWeekday(date) ? "worked" : "day-off") : "worked")
  );
  const [projectId, setProjectId] = useState<string>(existingEntry?.projectId || (projects[0]?.id || ""));
  const [notes, setNotes] = useState<string>(existingEntry?.notes || "");
  
  const isFuture = date ? isFutureDate(date) : false;
  const isLocked = reportStatus !== "declined" && reportStatus !== "upcoming";

  useEffect(() => {
    if (existingEntry) {
      setHours(existingEntry.hours);
      setStatus(existingEntry.status);
      setProjectId(existingEntry.projectId);
      setNotes(existingEntry.notes || "");
    } else if (date) {
      setHours(8);
      setStatus(isWeekday(date) ? "worked" : "day-off");
      setProjectId(projects[0]?.id || "");
      setNotes("");
    }
  }, [existingEntry, date, projects]);

  const handleSave = () => {
    if (!date || isLocked) return;
    
    const selectedProject = projects.find(p => p.id === projectId) || projects[0];
    
    onSave({
      date: new Date(date),
      hours: status === "worked" ? hours : 0,
      status,
      projectId: selectedProject.id,
      projectName: selectedProject.name,
      notes: notes.trim() !== "" ? notes : undefined
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
        ) : isLocked ? (
          <Alert className="mb-4 bg-amber-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You cannot edit entries for {reportStatus} time reports.
            </AlertDescription>
          </Alert>
        ) : null}
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <Select 
              value={projectId} 
              onValueChange={setProjectId}
              disabled={isFuture || isLocked}
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
              disabled={isFuture || isLocked}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="worked" id="worked" />
                <Label htmlFor="worked">Worked</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="day-off" id="day-off" />
                <Label htmlFor="day-off">Time-off</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="suspended-client" id="suspended-client" />
                <Label htmlFor="suspended-client">Suspended</Label>
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
                disabled={isFuture || isLocked}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="notes">Check-in Goals</Label>
            <Textarea
              id="notes"
              placeholder="What did you accomplish today?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isFuture || isLocked}
              className="min-h-[100px]"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSave} 
            disabled={isFuture || isLocked}
          >
            Save Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TimeEntryForm;
