import React from 'react';

export default function ChartTypeSelector({ selectedChart, setSelectedChart }) {
  const chartOptions = ['Bar', 'Pie', 'Line', 'Scatter'];

  return (
    <div className="p-4 bg-white/10 dark:bg-white/5 rounded-2xl shadow-lg mt-6">
      <h4 className="font-semibold mb-2">📊 Choose a Chart Type</h4>
      <div className="flex flex-wrap gap-3">
        {chartOptions.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedChart(type)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedChart === type
                ? 'bg-purple-600 text-white'
                : 'bg-white/20 dark:bg-white/10 text-purple-500'
            }`}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
}
