"use client";
import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import useExpenseStore from "@/store/expensesStore";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ExpenseChart = () => {
  const { expenses } = useExpenseStore();

  // Aggregate amounts by category
  const aggregated = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    expenses.forEach((expense) => {
      const cat = expense.category || "Other";
      categoryMap[cat] = (categoryMap[cat] || 0) + expense.amount;
    });
    return {
      categories: Object.keys(categoryMap),
      amounts: Object.values(categoryMap),
    };
  }, [expenses]);

  const data = {
    labels: aggregated.categories,
    datasets: [
      {
        label: "Expenses",
        data: aggregated.amounts,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Expense Breakdown by Category",
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default ExpenseChart;
