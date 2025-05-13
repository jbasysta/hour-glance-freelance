import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { DayEntry, TimeReport, Project, ReportStatus } from "@/types/time-tracker";
import { 
  calculateMonthSummary, 
  formatMonthYear,
  calculateExpectedHours,
  calculateReportedHours,
  autopopulatePreviousMonths
} from "@/utils/date-utils";
import Calendar from "@/components/Calendar";
import TimeEntryForm from "@/components/TimeEntryForm";
import PaymentSummary from "@/components/PaymentSummary";
import TimeReportStatus from "@/components/TimeReportStatus";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

// Sample projects
const SAMPLE_PROJECTS: Project[] = [
  { id: "p1", name: "Main Project" },
  { id: "p2", name: "Side Project" },
  { id: "p3", name: "Client X" },
  { id: "p4", name: "Training" }
];

const TimeTracker = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [entries, setEntries] = useState<DayEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [projects] = useState<Project[]>(SAMPLE_PROJECTS);
  const [timeReports, setTimeReports] = useState<TimeReport[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const { toast } = useToast();

  // Load entries from localStorage on component mount
  useEffect(() => {
    const storedEntries = localStorage.getItem('timeEntries');
    const storedReports = localStorage.getItem('timeReports');
    
    if (storedEntries) {
      try {
        const parsedEntries = JSON.parse(storedEntries).map((entry: any) => ({
          ...entry,
          date: new Date(entry.date)
        }));
        setEntries(parsedEntries);
      } catch (error) {
        console.error('Error parsing stored entries:', error);
      }
    }
    
    if (storedReports) {
      try {
        const parsedReports = JSON.parse(storedReports);
        setTimeReports(parsedReports);
      } catch (error) {
        console.error('Error parsing stored reports:', error);
      }
    }
  }, []);

  // Auto-populate previous months on initial load
  useEffect(() => {
    if (entries.length > 0 && projects.length > 0) {
      const populatedEntries = autopopulatePreviousMonths(entries, projects);
      if (populatedEntries.length !== entries.length) {
        setEntries(populatedEntries);
      }
    }
  }, [entries, projects]);

  // Save entries to localStorage when they change
  useEffect(() => {
    localStorage.setItem('timeEntries', JSON.stringify(entries));
  }, [entries]);

  // Save time reports to localStorage when they change
  useEffect(() => {
    localStorage.setItem('timeReports', JSON.stringify(timeReports));
  }, [timeReports]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const handleDaySelect = (date: Date) => {
    setSelectedDate(date);
    setDialogOpen(true);
  };

  const handleSaveEntry = (entry: DayEntry) => {
    setEntries(prevEntries => {
      // Find if an entry already exists for this date and project
      const existingEntryIndex = prevEntries.findIndex(
        e => e.date.toDateString() === entry.date.toDateString() && 
             e.projectId === entry.projectId
      );

      if (existingEntryIndex >= 0) {
        // Replace existing entry
        const newEntries = [...prevEntries];
        newEntries[existingEntryIndex] = entry;
        return newEntries;
      } else {
        // Add new entry
        return [...prevEntries, entry];
      }
    });

    toast({
      title: "Time Entry Saved",
      description: `Your time entry for ${format(entry.date, 'MMMM d, yyyy')} has been saved.`,
      className: "bg-[#F2FCE2] text-[#1A1F2C] border-green-200"
    });
  };

  const submitTimeReport = () => {
    // Create a new time report for the current month
    const newReport: TimeReport = {
      month: currentMonth.getMonth(),
      year: currentMonth.getFullYear(),
      reportStatus: "pending-approval",
      submittedAt: new Date()
    };
    
    setTimeReports(prev => [...prev, newReport]);
    
    toast({
      title: "Time Report Submitted",
      description: `Your time report for ${formatMonthYear(currentMonth)} has been submitted and is pending approval.`,
      className: "bg-[#F2FCE2] text-[#1A1F2C] border-green-200"
    });
  };

  // Filter entries for the current month and selected project
  const currentMonthEntries = entries.filter(entry => {
    const isCurrentMonth = entry.date.getMonth() === currentMonth.getMonth() && 
                           entry.date.getFullYear() === currentMonth.getFullYear();
    
    // If "all" is selected, show all projects
    if (selectedProject === "all") {
      return isCurrentMonth;
    }
    
    // Otherwise filter by project
    return isCurrentMonth && entry.projectId === selectedProject;
  });

  // Calculate summary data
  const expectedHours = calculateExpectedHours(
    currentMonth.getFullYear(), 
    currentMonth.getMonth()
  );
  
  const reportedHours = calculateReportedHours(currentMonthEntries);
  
  const remainingHours = Math.max(0, expectedHours - reportedHours);
  
  const summary = calculateMonthSummary(
    currentMonth.getFullYear(), 
    currentMonth.getMonth(), 
    currentMonthEntries
  );

  // Find the existing time report for the current month
  const currentMonthReport = timeReports.find(
    r => r.month === currentMonth.getMonth() && r.year === currentMonth.getFullYear()
  );

  // Get report status for the current month
  const reportStatus: ReportStatus = currentMonthReport?.reportStatus || "upcoming";

  // Find the existing entries for the selected date
  const existingEntries = selectedDate 
    ? entries.filter(e => e.date.toDateString() === selectedDate.toDateString()) 
    : [];
  
  // If there are multiple entries for the same date but different projects,
  // we'll edit the first one or create a new one
  const existingEntry = existingEntries[0];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Time Tracker</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-4">
                <CardTitle>{formatMonthYear(currentMonth)}</CardTitle>
                <TimeReportStatus status={reportStatus} />
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => navigateMonth('prev')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => navigateMonth('next')}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Calendar 
                month={currentMonth} 
                entries={currentMonthEntries} 
                onSelectDay={handleDaySelect} 
              />
              
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={() => {
                    setSelectedDate(new Date());
                    setDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Time Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Month Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt>Expected Hours:</dt>
                  <dd className="font-medium">{expectedHours}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Reported Hours:</dt>
                  <dd className="font-medium">{reportedHours.toFixed(1)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Remaining Hours:</dt>
                  <dd className="font-medium">{remainingHours.toFixed(1)}</dd>
                </div>
              </dl>
              
              <Separator className="my-4" />
              
              <Button 
                className="w-full" 
                onClick={submitTimeReport}
                disabled={reportedHours < expectedHours || reportStatus !== "upcoming"}
              >
                Submit Time Report
              </Button>
              
              {reportedHours < expectedHours && reportStatus === "upcoming" && (
                <p className="text-xs text-muted-foreground mt-2">
                  You need to report {remainingHours.toFixed(1)} more hours before submitting.
                </p>
              )}
              
              {reportStatus !== "upcoming" && (
                <p className="text-xs text-muted-foreground mt-2">
                  This report has already been submitted.
                </p>
              )}
            </CardContent>
          </Card>

          <PaymentSummary 
            summary={summary}
            month={currentMonth}
          />
        </div>
      </div>

      <TimeEntryForm 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        date={selectedDate}
        onSave={handleSaveEntry}
        existingEntry={existingEntry}
        projects={projects}
      />
    </div>
  );
};

export default TimeTracker;
