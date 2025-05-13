
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center max-w-3xl p-6">
        <h1 className="text-4xl font-bold mb-4">Freelance Time Tracker</h1>
        <p className="text-xl text-gray-600 mb-8">
          Track your working hours, manage daily check-ins, and generate monthly time reports.
        </p>
        
        <div className="space-y-4">
          <Button asChild size="lg" className="w-full max-w-sm">
            <Link to="/time-tracker">
              Open Time Tracker
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
