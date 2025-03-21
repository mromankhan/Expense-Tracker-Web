import ExpenseChart from "@/components/Charts";
import Navbar from "@/components/Navbar";

const Stats = () => {
  return (
    <>
      <div className="mb-32">
        <ExpenseChart />
      </div>
      <Navbar />
    </>
  )
}

export default Stats