"use client";
import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import useExpenseStore from "@/store/expensesStore"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ExpenseChart = () => {

  const { expenses } = useExpenseStore();
  const categories = expenses.map((expense) => expense.category);
  const amounts = expenses.map((expense) => expense.amount);

  const data = {
    labels: categories,
    datasets: [
      {
        label: "Expenses",
        data: amounts,
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