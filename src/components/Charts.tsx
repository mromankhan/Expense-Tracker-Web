"use client";
import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import useExpenseStore from "@/store/expensesStore";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CATEGORY_COLORS: Record<string, { bg: string; border: string }> = {
  Food: { bg: "rgba(234, 88, 12, 0.75)", border: "rgba(234, 88, 12, 1)" },
  Transport: { bg: "rgba(37, 99, 235, 0.75)", border: "rgba(37, 99, 235, 1)" },
  Bills: { bg: "rgba(220, 38, 38, 0.75)", border: "rgba(220, 38, 38, 1)" },
  Education: { bg: "rgba(22, 163, 74, 0.75)", border: "rgba(22, 163, 74, 1)" },
  Investments: { bg: "rgba(147, 51, 234, 0.75)", border: "rgba(147, 51, 234, 1)" },
  Luxuries: { bg: "rgba(219, 39, 119, 0.75)", border: "rgba(219, 39, 119, 1)" },
  Other: { bg: "rgba(107, 114, 128, 0.75)", border: "rgba(107, 114, 128, 1)" },
};

const DEFAULT_COLOR = { bg: "rgba(147, 51, 234, 0.75)", border: "rgba(147, 51, 234, 1)" };

const ExpenseChart = () => {
  const { expenses } = useExpenseStore();

  const aggregated = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      const cat = e.category || "Other";
      map[cat] = (map[cat] || 0) + e.amount;
    });
    return { categories: Object.keys(map), amounts: Object.values(map) };
  }, [expenses]);

  if (aggregated.categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-muted-foreground">No data to display yet.</p>
        <p className="text-xs text-muted-foreground mt-1">Add some expenses to see your chart.</p>
      </div>
    );
  }

  const bgColors = aggregated.categories.map(
    (cat) => (CATEGORY_COLORS[cat] ?? DEFAULT_COLOR).bg
  );
  const borderColors = aggregated.categories.map(
    (cat) => (CATEGORY_COLORS[cat] ?? DEFAULT_COLOR).border
  );

  const data = {
    labels: aggregated.categories,
    datasets: [
      {
        label: "Amount Spent",
        data: aggregated.amounts,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { y: number } }) => ` ${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
      y: {
        grid: { color: "rgba(0,0,0,0.05)" },
        ticks: { font: { size: 11 } },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default ExpenseChart;
