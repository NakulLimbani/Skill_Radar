"use client";

import React from "react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RadarChartProps {
  data: { skill: string; score: number }[];
  onSkillClick: (skillName: string) => void;
}

const RadarChart = ({ data, onSkillClick }: RadarChartProps) => {
  const chartData = {
    labels: data.map((d) => d.skill),
    datasets: [
      {
        label: "Skill Score",
        data: data.map((d) => d.score),
        backgroundColor: "rgba(56, 189, 248, 0.12)", // sky-400 @ 12%
        borderColor: "#38bdf8", // sky-400
        borderWidth: 2,
        pointBackgroundColor: "#38bdf8",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#38bdf8",
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false as const,
    plugins: {
      legend: {
        labels: { color: "#cfcfcf" },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.label}: ${ctx.formattedValue}/10`,
        },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 10,
        ticks: { stepSize: 2, color: "#bbb", backdropColor: "transparent" },
        grid: { color: "#2a2a2a" },
        angleLines: { color: "#2a2a2a" },
        pointLabels: { color: "#e5e5e5" },
      },
    },
    // chart.js onClick gives elements from active points (via getElementsAtEventForMode)
    onClick: (_evt: any, elements: any[]) => {
      if (elements?.length) {
        const idx = elements[0].index;
        const label = chartData.labels[idx];
        if (label) onSkillClick(String(label));
      }
    },
  };

  return (
    <div className="w-full max-w-3xl h-[520px]">
      <Radar data={chartData as any} options={options as any} />
    </div>
  );
};

export default RadarChart;
