
import React from "react";
import { MonthSummary } from "@/types/time-tracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";

interface PaymentSummaryProps {
  summary: MonthSummary;
  month: Date;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({ summary, month }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  // Calculate the hourly rate based on monthly compensation divided by contracted hours
  const calculatedHourlyRate = summary.expectedHours > 0 ? 
    summary.monthlySalary / summary.expectedHours : 
    summary.hourlyRate;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Time report for {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium text-left">Contracted hours</TableCell>
              <TableCell className="text-right">{summary.expectedHours}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium text-left">Total hours</TableCell>
              <TableCell className="text-right">{summary.reportedHours.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium text-left">Monthly compensation</TableCell>
              <TableCell className="text-right">{formatCurrency(summary.monthlySalary)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium text-left">
                Working time deviation ({summary.deviationHours} hours @ {formatCurrency(calculatedHourlyRate)} /hour)
              </TableCell>
              <TableCell className="text-right">{formatCurrency(summary.deviationCost)}</TableCell>
            </TableRow>
            {/* Removed the "Earned paid flex days" row */}
            <TableRow className="border-t-2">
              <TableCell className="font-medium text-lg text-left">Subtotal</TableCell>
              <TableCell className="text-right font-bold text-lg">
                {formatCurrency(summary.subtotal)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PaymentSummary;
