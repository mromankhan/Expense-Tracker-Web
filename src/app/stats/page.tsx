import ExpenseChart from "@/components/Charts";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";

const Stats = () => {
  return (
    <>
      <div className="min-h-screen bg-background pb-28">
        {/* Gradient Header */}
        <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 px-5 pt-8 pb-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-white/20 rounded-xl flex items-center justify-center">
                <BarChart2 size={20} className="text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary-foreground">Statistics</h1>
                <p className="text-sm text-primary-foreground/70">Your spending breakdown</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-5 mt-6">
          <Card className="border border-border shadow-sm rounded-2xl bg-card">
            <CardHeader className="pb-2 pt-5 px-6">
              <CardTitle className="text-base font-semibold text-foreground">
                Expense Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-6">
              <ExpenseChart />
            </CardContent>
          </Card>
        </div>
      </div>
      <Navbar />
    </>
  );
};

export default Stats;
