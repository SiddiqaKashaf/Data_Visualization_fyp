// 📁 src/VisualizationPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';
import { DataInsights } from './DataInsights';
import { ExportTools } from './ExportTools';
import { DataFilters } from './DataFilters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels
);

const CHART_COLORS = [
  '#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f',
  '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab'
];

const detectColumnTypes = (data) => {
  const types = {};
  if (!data || data.length === 0) return types;
  Object.keys(data[0]).forEach(col => {
    const values = data.map(row => row[col]);
    const numericValues = values.filter(v => !isNaN(parseFloat(v)) && v !== '' && v !== null);
    types[col] = numericValues.length / values.length > 0.8 ? 'numerical' : 'categorical';
  });
  return types;
};

const getChartSuggestions = (colTypes, xCol, yCol) => {
  if (!xCol || !yCol) return ['bar', 'line'];
  const xType = colTypes[xCol];
  const yType = colTypes[yCol];
  if (xType === 'numerical' && yType === 'numerical') return ['scatter', 'line', 'bar'];
  if ((xType === 'categorical' && yType === 'numerical') || (xType === 'numerical' && yType === 'categorical')) return ['bar', 'line', 'pie'];
  return ['bar', 'line'];
};

export function VisualizationPage({ data, columns, dark }) {
  const [loadedData, setLoadedData] = useState(data || []);
  const [loadedColumns, setLoadedColumns] = useState(columns || []);

  useEffect(() => {
    if (!data || data.length === 0) {
      let stored = sessionStorage.getItem('visualizationData');
      if (!stored) stored = localStorage.getItem('visualizationData');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setLoadedData(parsed);
          if (parsed.length > 0 && typeof parsed[0] === 'object') {
            const cols = Object.keys(parsed[0]);
            setLoadedColumns(cols);
          }
        } catch (err) {
          console.error('Error parsing stored data:', err);
        }
      }
    } else {
      setLoadedData(data);
      setLoadedColumns(columns || []);
    }
  }, [data, columns]);

  const columnTypes = useMemo(() => detectColumnTypes(loadedData), [loadedData]);
  const categoricalCols = useMemo(() => Object.keys(columnTypes).filter(c => columnTypes[c] === 'categorical'), [columnTypes]);
  const numericalCols = useMemo(() => Object.keys(columnTypes).filter(c => columnTypes[c] === 'numerical'), [columnTypes]);

  const [chartType, setChartType] = useState('bar');
  const [categoryCol, setCategoryCol] = useState('');
  const [valueCol, setValueCol] = useState('');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [filteredData, setFilteredData] = useState(loadedData);
  const [chartError, setChartError] = useState('');

  const suggestedCharts = useMemo(() => {
    return getChartSuggestions(columnTypes, xAxis || categoryCol, yAxis || valueCol);
  }, [columnTypes, xAxis, categoryCol, yAxis, valueCol]);

  useEffect(() => {
    setFilteredData(loadedData);
  }, [loadedData]);

  useEffect(() => {
    if (!loadedData.length) {
      setChartError('');
      return;
    }

    try {
      setChartError('');
      let labels = [];
      let datasets = [];

      if (chartType === 'pie') {
        if (!categoryCol || !valueCol) {
          setChartError('Please select both Category and Values');
          return;
        }
        const grouped = {};
        filteredData.forEach(row => {
          const key = row[categoryCol]?.toString() || 'Unknown';
          const val = parseFloat(row[valueCol]) || 0;
          grouped[key] = (grouped[key] || 0) + val;
        });
        labels = Object.keys(grouped);
        if (labels.length > 5) {
          setChartError('Pie chart works best with 5 or fewer categories. Consider using a Bar chart instead.');
          return;
        }
        const pieValues = labels.map(k => grouped[k]);
        datasets = [{
          data: pieValues,
          backgroundColor: labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
          borderColor: '#fff',
          borderWidth: 2,
          hoverOffset: 10
        }];
      } else if (chartType === 'scatter') {
        if (!xAxis || !yAxis) {
          setChartError('Please select both X-Axis and Y-Axis');
          return;
        }
        const pts = filteredData.map(row => ({
          x: parseFloat(row[xAxis]) || 0,
          y: parseFloat(row[yAxis]) || 0
        }));
        labels = pts.map((_, i) => i);
        
        // Create colorful gradient based on Y values
        const yValues = pts.map(p => p.y);
        const minY = Math.min(...yValues);
        const maxY = Math.max(...yValues);
        const range = maxY - minY || 1;
        
        const scatterColors = pts.map(point => {
          const normalized = (point.y - minY) / range;
          const colorIndex = Math.floor(normalized * (CHART_COLORS.length - 1));
          return CHART_COLORS[colorIndex] + 'cc';
        });
        
        datasets = [{
          label: `${xAxis} vs ${yAxis}`,
          data: pts,
          backgroundColor: scatterColors,
          borderColor: scatterColors.map(c => c.slice(0, -2)),
          pointRadius: 4,
          pointHoverRadius: 8,
          pointBorderWidth: 2,
          // borderWidth: 1
        }];
      } else {
        if (!xAxis || !yAxis) {
          setChartError('Please select both X-Axis and Y-Axis');
          return;
        }
        const rawLabels = filteredData.map(r => r[xAxis]?.toString() || 'Unknown');
        const rawValues = filteredData.map(r => parseFloat(r[yAxis]) || 0);
        if (chartType === 'line') {
          const targetPoints = 20;
          const step = Math.max(1, Math.ceil(rawLabels.length / targetPoints));
          labels = rawLabels.filter((_, i) => i % step === 0);
          const vals = rawValues.filter((_, i) => i % step === 0);
          datasets = [{
            label: yAxis,
            data: vals,
            borderColor: CHART_COLORS[0],
            backgroundColor: CHART_COLORS[0] + '20',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: CHART_COLORS[0],
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          }];
        } else {
          // If X-axis is categorical, group by categories
          if (columnTypes[xAxis] === 'categorical') {
            const grouped = {};
            filteredData.forEach(row => {
              const key = row[xAxis]?.toString() || 'Unknown';
              const val = parseFloat(row[yAxis]) || 0;
              grouped[key] = (grouped[key] || 0) + val;
            });
            labels = Object.keys(grouped);
            const vals = Object.values(grouped);
            datasets = [{
              label: yAxis,
              data: vals,
              backgroundColor: vals.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
              borderRadius: 8,
              borderSkipped: false,
              hoverBackgroundColor: CHART_COLORS[0]
            }];
          } else {
            // For numerical X-axis, limit to max 20 bars
            const maxBars = 20;
            const step = Math.max(1, Math.ceil(rawLabels.length / maxBars));
            labels = rawLabels.filter((_, i) => i % step === 0);
            const vals = rawValues.filter((_, i) => i % step === 0);
            datasets = [{
              label: yAxis,
              data: vals,
              backgroundColor: vals.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
              borderRadius: 8,
              borderSkipped: false,
              hoverBackgroundColor: CHART_COLORS[0]
            }];
          }
        }
      }
      setChartData({ labels, datasets });
    } catch (err) {
      console.error('Chart error:', err);
      setChartError('Error creating chart: ' + err.message);
    }
  }, [chartType, categoryCol, valueCol, xAxis, yAxis, filteredData]);

  const renderChart = () => {
    if (chartError) {
      return (
        <div className="flex items-center justify-center h-96 bg-red-50/20 dark:bg-red-900/20 rounded-lg border border-red-300 dark:border-red-700">
          <p className="text-red-600 dark:text-red-400 font-semibold">⚠️ {chartError}</p>
        </div>
      );
    }
    if (!chartData.labels || chartData.labels.length === 0) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-50/20 dark:bg-gray-900/20 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">Select fields to render a chart.</p>
        </div>
      );
    }
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        datalabels: {
          display: true,
          color: dark ? '#fff' : '#000',
          font: { weight: 'bold', size: 11 },
          formatter: (value) => {
            if (typeof value === 'number') {
              return value.toFixed(2);
            }
            return value;
          },
          anchor: 'end',
          align: 'top',
          offset: 5
        },
        legend: {
          position: 'right',
          labels: {
            padding: 20,
            font: { size: 12, weight: 'bold' },
            usePointStyle: true,
            color: dark ? '#fff' : '#333'
          },
          align: 'center'
        },
        tooltip: {
          backgroundColor: dark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
          titleColor: dark ? '#fff' : '#333',
          bodyColor: dark ? '#fff' : '#333',
          borderColor: CHART_COLORS[0],
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: function(context) {
              const value = context.parsed.y || context.parsed;
              return `${yAxis || valueCol}: ${typeof value === 'number' ? value.toFixed(2) : value}`;
            },
            title: function(context) {
              return `${xAxis || categoryCol}: ${context[0].label}`;
            }
          }
        }
      },
      scales: {
        x: { display: true, ticks: { color: dark ? '#aaa' : '#666', font: { size: 11 } }, grid: { color: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' } },
        y: { display: true, ticks: { color: dark ? '#aaa' : '#666', font: { size: 11 } }, grid: { color: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' } }
      }
    };
    switch (chartType) {
      case 'line': {
        const lineOptions = {
          ...commonOptions,
          plugins: {
            ...commonOptions.plugins,
            datalabels: {
              ...commonOptions.plugins.datalabels,
              display: true
            }
          }
        };
        return <Line data={chartData} options={lineOptions} />;
      }
      case 'pie': {
        const pieOptions = {
          ...commonOptions,
          plugins: {
            ...commonOptions.plugins,
            datalabels: {
              ...commonOptions.plugins.datalabels,
              formatter: (value, ctx) => {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${percentage}%`;
              },
              color: '#fff',
              font: { weight: 'bold', size: 12 }
            }
          }
        };
        return <Pie data={chartData} options={pieOptions} />;
      }
      case 'scatter': {
        const scatterOptions = {
          ...commonOptions,
          plugins: {
            ...commonOptions.plugins,
            datalabels: { display: false }
          }
        };
        return <Scatter data={chartData} options={scatterOptions} />;
      }
      default: {
        const barOptions = {
          ...commonOptions,
          plugins: {
            ...commonOptions.plugins,
            datalabels: {
              ...commonOptions.plugins.datalabels,
              align: 'top',
              anchor: 'end'
            }
          }
        };
        return <Bar data={chartData} options={barOptions} />;
      }
    }
  };

  if (!loadedData.length) {
    return (
      <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 rounded-2xl">
        <div className="max-w-7xl mx-auto space-y-6 p-6">
          <div className="text-center py-20">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No data loaded. Please upload a file first.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 rounded-2xl">
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">📊 Advanced Data Visualization</h2>
        </div>
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="p-6 bg-white/20 dark:bg-white/10 rounded-2xl border border-purple-300 dark:border-white/20 backdrop-blur-sm">
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">📈 Chart Type</label>
              <select value={chartType} onChange={(e) => { const t = e.target.value; setChartType(t); if (t === 'pie') { setCategoryCol(categoricalCols[0] || ''); setValueCol(numericalCols[0] || ''); } else if (t === 'scatter') { setXAxis(numericalCols[0] || ''); setYAxis(numericalCols[1] || numericalCols[0] || ''); } }} className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 transition">
                <option value="">Select Chart Type</option>
                {suggestedCharts.includes('bar') && <option value="bar">📊 Bar Chart</option>}
                {suggestedCharts.includes('line') && <option value="line">📈 Line Chart</option>}
                {suggestedCharts.includes('pie') && <option value="pie">🥧 Pie Chart</option>}
                {suggestedCharts.includes('scatter') && <option value="scatter">🔵 Scatter Plot</option>}
              </select>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Suggested: {suggestedCharts.join(', ')}</p>
            </div>
            {chartType === 'pie' ? (
              <>
                <div className="p-6 bg-white/20 dark:bg-white/10 rounded-2xl border border-purple-300 dark:border-white/20 backdrop-blur-sm">
                  <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">📁 Category</label>
                  <select value={categoryCol} onChange={(e) => setCategoryCol(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 transition">
                    <option value="">Select Category Column</option>
                    {categoricalCols.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Categorical columns only</p>
                </div>
                <div className="p-6 bg-white/20 dark:bg-white/10 rounded-2xl border border-purple-300 dark:border-white/20 backdrop-blur-sm">
                  <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">💰 Values</label>
                  <select value={valueCol} onChange={(e) => setValueCol(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 transition">
                    <option value="">Select Value Column</option>
                    {numericalCols.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Numerical columns only</p>
                </div>
              </>
            ) : (
              <>
                <div className="p-6 bg-white/20 dark:bg-white/10 rounded-2xl border border-purple-300 dark:border-white/20 backdrop-blur-sm">
                  <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">↔️ X-Axis</label>
                  <select value={xAxis} onChange={(e) => setXAxis(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 transition">
                    <option value="">Select X-Axis</option>
                    {chartType === 'scatter' ? numericalCols.map(c => <option key={c} value={c}>{c}</option>) : loadedColumns.map(c => <option key={c} value={c}>{c} {columnTypes[c] === 'numerical' ? '(Num)' : '(Cat)'}</option>)}
                  </select>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{chartType === 'scatter' ? 'Numerical only' : 'Any column'}</p>
                </div>
                <div className="p-6 bg-white/20 dark:bg-white/10 rounded-2xl border border-purple-300 dark:border-white/20 backdrop-blur-sm">
                  <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">↕️ Y-Axis</label>
                  <select value={yAxis} onChange={(e) => setYAxis(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 transition">
                    <option value="">Select Y-Axis</option>
                    {numericalCols.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Numerical columns only</p>
                </div>
              </>
            )}
          </div>
          <div className="lg:col-span-3 p-6 bg-white/10 dark:bg-white/5 rounded-2xl shadow-lg backdrop-blur-md border border-white/20">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-inner h-96">
              {renderChart()}
            </div>
          </div>
        </div>
        <DataFilters data={loadedData} columns={loadedColumns} onFilterChange={setFilteredData} />
        <ExportTools data={filteredData} columns={loadedColumns} chartType={chartType} chartData={chartData} />
        <div className="mt-10 pt-6 border-t border-purple-200 dark:border-purple-700">
          <DataInsights data={filteredData} columns={loadedColumns} />
        </div>
      </div>
    </div>
  );
}
