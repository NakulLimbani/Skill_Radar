// sensai-frontend/src/app/components/dashboard/RadarChart.tsx
"use client";

import React from 'react';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

// Register the necessary components for Chart.js
ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

// Define the props interface for type safety
interface RadarChartProps {
    data: { skill: string; score: number }[];
    onSkillClick: (skillName: string) => void;
}

const RadarChart = ({ data, onSkillClick }: RadarChartProps) => {

    // Transform the incoming data into the format Chart.js expects
    const chartData = {
        labels: data.map(item => item.skill),
        datasets: [{
            label: 'Skill Score',
            data: data.map(item => item.score),
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(54, 162, 235, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
        }],
    };

    // Configure the chart options
    const options = {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            r: {
                angleLines: {
                    display: true,
                },
                suggestedMin: 0,
                suggestedMax: 10,
                ticks: {
                    stepSize: 2
                }
            },
        },
        onClick: (event: any, elements: any) => {
            console.log("Chart clicked!");
            if (elements.length > 0) {
                const clickedElementIndex = elements[0].index;
                const skillName = chartData.labels[clickedElementIndex];
                if (skillName) {
                    onSkillClick(skillName);
                }
            }
        },
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <Radar data={chartData} options={options} />
        </div>
    );
};

export default RadarChart;