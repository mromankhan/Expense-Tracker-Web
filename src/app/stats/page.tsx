import ExpenseChart from "@/components/Charts";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Stats = () => {
  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-28">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-5 pt-8 pb-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>
            <p className="text-sm text-gray-500 mt-1">Your spending breakdown</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-5 mt-6">
          <Card className="border border-gray-100 shadow-sm rounded-2xl">
            <CardHeader className="pb-2 pt-5 px-6">
              <CardTitle className="text-base font-semibold text-gray-900">Expense Overview</CardTitle>
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
}

export default Stats;
