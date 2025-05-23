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
import { toast } from "@/components/ui/sonner";
import { ArrowLeft, ArrowRight, PartyPopper, RefreshCcw } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import JSConfetti from 'js-confetti';
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";

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
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [cleanConfirmDialogOpen, setCleanConfirmDialogOpen] = useState(false);
  const { toast: useToastfn } = useToast();

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

  // Add predefined report statuses for March and April
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    
    // Check if March report exists, if not, add it
    const marchReport = timeReports.find(
      r => r.month === 2 && r.year === currentYear
    );
    
    if (!marchReport) {
      setTimeReports(prev => [...prev, {
        month: 2, // March (0-indexed)
        year: currentYear,
        reportStatus: "declined",
        submittedAt: new Date(currentYear, 2, 31)
      }]);
    }
    
    // Check if April report exists, if not, add it
    const aprilReport = timeReports.find(
      r => r.month === 3 && r.year === currentYear
    );
    
    if (!aprilReport) {
      setTimeReports(prev => [...prev, {
        month: 3, // April (0-indexed)
        year: currentYear,
        reportStatus: "pending-approval",
        submittedAt: new Date(currentYear, 3, 30)
      }]);
    }
  }, [timeReports]);

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

    useToastfn({
      title: "Time Entry Saved",
      description: `Your time entry for ${format(entry.date, 'MMMM d, yyyy')} has been saved.`,
      className: "bg-[#F2FCE2] text-[#1A1F2C] border-green-200"
    });
  };

  const handleConfirmSubmit = () => {
    setConfirmDialogOpen(false);
    submitTimeReport();
  };

  const submitTimeReport = () => {
    // Create a new time report for the current month
    const newReport: TimeReport = {
      month: currentMonth.getMonth(),
      year: currentMonth.getFullYear(),
      reportStatus: "pending-approval",
      submittedAt: new Date()
    };
    
    setTimeReports(prev => {
      // Check if report for this month already exists
      const existingReportIndex = prev.findIndex(
        r => r.month === currentMonth.getMonth() && r.year === currentMonth.getFullYear()
      );
      
      if (existingReportIndex >= 0) {
        // Update existing report
        const newReports = [...prev];
        newReports[existingReportIndex] = newReport;
        return newReports;
      } else {
        // Add new report
        return [...prev, newReport];
      }
    });
    
    setSuccessDialogOpen(true);

    // Create confetti effect
    const jsConfetti = new JSConfetti();
    jsConfetti.addConfetti({
      confettiColors: [
        '#7C3AED', // proxify purple
        '#F2FCE2', // light green
        '#22c55e', // success green
        '#60a5fa', // proxify blue
      ],
      confettiNumber: 300,
    });
  };

  // Reset data to initial state
  const cleanData = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    // Create initial time reports based on specifications
    const initialReports: TimeReport[] = [];
    
    // 1. January and before - approved
    for (let month = 0; month <= 0; month++) {
      initialReports.push({
        month,
        year: currentYear,
        reportStatus: "approved",
        submittedAt: new Date(currentYear, month, 28)
      });
    }
    
    // 2. February - declined
    initialReports.push({
      month: 1,
      year: currentYear,
      reportStatus: "declined",
      submittedAt: new Date(currentYear, 1, 28)
    });
    
    // 3. March - approved
    initialReports.push({
      month: 2,
      year: currentYear,
      reportStatus: "approved",
      submittedAt: new Date(currentYear, 2, 28)
    });
    
    // 4. April - pending approval
    initialReports.push({
      month: 3,
      year: currentYear,
      reportStatus: "pending-approval",
      submittedAt: new Date(currentYear, 3, 28)
    });
    
    // Clear all entries
    setEntries([]);
    
    // Set the time reports
    setTimeReports(initialReports);
    
    // Save to localStorage
    localStorage.setItem('timeEntries', JSON.stringify([]));
    localStorage.setItem('timeReports', JSON.stringify(initialReports));
    
    // Show success toast
    toast.success("Time tracking data has been reset to default state", {
      position: "top-center",
      duration: 3000
    });
    
    setCleanConfirmDialogOpen(false);
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

  // Get the total number of projects for current month
  const uniqueProjects = [...new Set(entries
    .filter(entry => 
      entry.date.getMonth() === currentMonth.getMonth() && 
      entry.date.getFullYear() === currentMonth.getFullYear()
    )
    .map(entry => entry.projectId))];
  const projectCount = uniqueProjects.length || 1;

  // Calculate expected hours based on project selection
  const expectedHours = selectedProject === "all" 
    ? calculateExpectedHours(
        currentMonth.getFullYear(), 
        currentMonth.getMonth(),
        8  // 8 hours per day when all projects selected
      )
    : calculateExpectedHours(
        currentMonth.getFullYear(), 
        currentMonth.getMonth(),
        2  // 2 hours per day for specific project
      );
  
  const reportedHours = calculateReportedHours(currentMonthEntries);
  
  const remainingHours = Math.max(0, expectedHours - reportedHours);
  
  // Calculate monthly salary based on project selection
  const monthlySalary = selectedProject === "all" 
    ? 3500 
    : 3500 / projectCount;
  
  const summary = calculateMonthSummary(
    currentMonth.getFullYear(), 
    currentMonth.getMonth(), 
    currentMonthEntries,
    expectedHours,  // Pass the calculated expected hours to the summary function
    monthlySalary   // Pass the calculated monthly salary
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Time Tracker</h1>
        <Button 
          variant="subtle" 
          size="sm" 
          className="flex items-center" 
          onClick={() => setCleanConfirmDialogOpen(true)}
        >
          <RefreshCcw className="h-4 w-4 mr-1" />
          Clean
        </Button>
      </div>

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
                reportStatus={reportStatus}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Month Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium text-left">Contracted Hours:</TableCell>
                    <TableCell className="text-right">{expectedHours}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-left">Reported Hours:</TableCell>
                    <TableCell className="text-right">{reportedHours.toFixed(1)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-left">Remaining Hours:</TableCell>
                    <TableCell className="text-right">{remainingHours.toFixed(1)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-left">Earned Flex Days:</TableCell>
                    <TableCell className="text-right">{(2 * (reportedHours / expectedHours)).toFixed(1)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
              <Separator className="my-4" />
              
              <Button 
                className="w-full" 
                onClick={() => {
                  if (reportedHours < expectedHours) {
                    setConfirmDialogOpen(true);
                  } else {
                    submitTimeReport();
                  }
                }}
                disabled={reportStatus !== "upcoming"}
              >
                Submit Time Report
              </Button>
              
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
        reportStatus={reportStatus}
      />

      {/* Confirmation dialog for submitting with less hours */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit with incomplete hours?</AlertDialogTitle>
            <AlertDialogDescription>
              You have reported only {reportedHours.toFixed(1)} of {expectedHours} contracted hours. 
              Submitting now means you may lose earnings for the {remainingHours.toFixed(1)} remaining hours.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit}>
              Submit Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success dialog */}
      <AlertDialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <PartyPopper className="mr-2 h-5 w-5 text-green-500" />
              Success!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your time report for {formatMonthYear(currentMonth)} has been submitted and is pending approval.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clean data confirmation dialog */}
      <AlertDialog open={cleanConfirmDialogOpen} onOpenChange={setCleanConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Data</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all time tracking data to the initial state. All your current entries will be deleted.
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={cleanData}>
              Reset Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TimeTracker;
