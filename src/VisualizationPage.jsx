// 📁 src/VisualizationPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

// 🎨 Color Palettes
const CHART_COLORS = [
  '#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f',
  '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab'
];

export function VisualizationPage({ data, columns, dark }) {
  const [chartType, setChartType] = useState('bar');
  const [categoryCol, setCategoryCol] = useState('');
  const [valueCol, setValueCol] = useState('');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    if (!data.length) return;

    let labels = [];
    let datasets = [];

    // PIE
    if (chartType === 'pie') {
      if (!categoryCol || !valueCol) return;
      const grouped = {};
      data.forEach(row => {
        const key = row[categoryCol];
        const val = parseFloat(row[valueCol]) || 0;
        grouped[key] = (grouped[key] || 0) + val;
      });
      labels = Object.keys(grouped);
      const pieValues = labels.map(k => grouped[k]);
      datasets = [{
        data: pieValues,
        backgroundColor: labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
        hoverOffset: 8
      }];
    } else if (chartType === 'scatter') {
      if (!xAxis || !yAxis) return;
      const pts = data.map(row => ({ x: row[xAxis], y: parseFloat(row[yAxis]) || 0 }));
      labels = pts.map(pt => pt.x);
      datasets = [{
        label: yAxis,
        data: pts,
        // NEW: per-point colors
        backgroundColor: pts.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
        borderColor: pts.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
        // NEW: smaller radius
        pointRadius: 4,
        pointHoverRadius: 6
      }];
    }

    // BAR & LINE
    else {
      if (!xAxis || !yAxis) return;

      // raw arrays
      const rawLabels = data.map(r => r[xAxis]);
      const rawValues = data.map(r => parseFloat(r[yAxis]) || 0);

      if (chartType === 'line') {
        // Bin to ~20 points
        const targetPoints = 20;
        const step = Math.max(1, Math.ceil(rawLabels.length / targetPoints));
        labels = rawLabels.filter((_, i) => i % step === 0);
        const vals = rawValues.filter((_, i) => i % step === 0);

        // Per-point colors
        const pointColors = vals.map((_, i) =>
          CHART_COLORS[i % CHART_COLORS.length]
        );

        datasets = [{
          label: yAxis,
          data: vals,
          borderColor: dark ? '#fff' : '#333',
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.3,
          pointRadius: 4,              // smaller points
          pointHoverRadius: 6,         // hover slightly larger
          pointBackgroundColor: pointColors,
          pointBorderColor: pointColors
        }];

      } else {
        // BAR logic: first 15 bins
        const maxBars = 15;
        labels = rawLabels.slice(0, maxBars);
        const vals = rawValues.slice(0, maxBars);

        datasets = [{
          label: yAxis,
          data: vals,
          backgroundColor: labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
          borderColor: CHART_COLORS[1],
          borderWidth: 2,
          fill: false
        }];
      }
    }

    setChartData({ labels, datasets });
  }, [data, chartType, xAxis, yAxis, categoryCol, valueCol, dark]);

  // Theme-aware tick color
  const tickColor = dark ? '#fff' : '#111';

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: tickColor, font: { size: 13 } }
      },
      tooltip: {
        titleColor: tickColor,
        bodyColor: tickColor
      }
    },
    scales: {
      x: { ticks: { color: tickColor }, grid: { color: dark ? '#444' : '#ddd' } },
      y: { ticks: { color: tickColor }, grid: { color: dark ? '#444' : '#ddd' } }
    }
  };

  const renderChart = () => {
    if (!chartData.labels.length) {
      return <p className="mt-6 text-center text-gray-500 dark:text-gray-400">Select fields to render a chart.</p>;
    }
    switch (chartType) {
      case 'line':
        return (
          <div className="mt-6 h-96">
            <Line data={chartData} options={commonOptions} />
          </div>
        );
      case 'pie':
        return (
          <div className="flex justify-center mt-6">
            <div className="w-2/3 h-80 relative">
              <Pie data={chartData} options={commonOptions} />
            </div>
          </div>
        );
      case 'scatter':
        return (
          <div className="mt-6 h-96">
            <Scatter data={chartData} options={commonOptions} />
          </div>
        );
      default: // bar
        return (
          <div className="mt-6 h-96">
            <Bar data={chartData} options={commonOptions} />
          </div>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6 bg-white/10 dark:bg-white/5 rounded-2xl shadow-lg backdrop-blur-md">
      <h2 className="text-3xl font-bold text-purple-500 dark:text-purple-300">Data Chart Builder</h2>

      {/* Chart controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Chart Type</label>
          <select
            value={chartType}
            onChange={e => {
              setChartType(e.target.value);
              setXAxis(''); setYAxis(''); setCategoryCol(''); setValueCol('');
            }}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md"
          >
            {['bar', 'line', 'pie', 'scatter'].map(type => (
              <option key={type} value={type}>{type.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {/* Category/Value selectors for pie */}
        {chartType === 'pie' ? (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select
                value={categoryCol}
                onChange={e => setCategoryCol(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md"
              >
                <option value="">Select</option>
                {columns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Value</label>
              <select
                value={valueCol}
                onChange={e => setValueCol(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md"
              >
                <option value="">Select</option>
                {columns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">X-Axis</label>
              <select
                value={xAxis}
                onChange={e => setXAxis(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md"
              >
                <option value="">Select</option>
                {columns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Y-Axis</label>
              <select
                value={yAxis}
                onChange={e => setYAxis(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md"
              >
                <option value="">Select</option>
                {columns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </>
        )}
      </div>

      {/* Chart */}
      {renderChart()}
    </div>
  );
}
