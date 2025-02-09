"use client";
import ExpenseChart from "@/components/Charts";
import Navbar from "@/components/Navbar";
import useExpenseStore from "@/store/expensesStore"

const Stats = () => {
    const {expenses} = useExpenseStore();
    
    console.log(expenses);
    
  return (
    <>
    <div className="mb-32">
    <ExpenseChart expenses={expenses} />
    </div>
    <Navbar />
    </>
  )
}

export default Stats