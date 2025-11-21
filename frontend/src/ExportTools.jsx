import React, { useState } from 'react';
import { HiDownload, HiSparkles } from 'react-icons/hi';
import { ClipLoader } from 'react-spinners';

export function ExportTools({ data, columns, chartType, chartData }) {
  const [exporting, setExporting] = useState(false);

  const exportToCSV = () => {
    if (!data.length) {
      alert('No data to export');
      return;
    }

    const headers = columns.join(',');
    const rows = data.map(row =>
      columns.map(col => {
        const val = row[col];
        // Escape quotes and wrap in quotes if contains comma
        return typeof val === 'string' && val.includes(',')
          ? `"${val.replace(/"/g, '""')}"`
          : val;
      }).join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    downloadFile(blob, 'data.csv');
  };

  const exportToJSON = () => {
    if (!data.length) {
      alert('No data to export');
      return;
    }

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    downloadFile(blob, 'data.json');
  };

  const exportChartAsImage = () => {
    // This would require canvas export - for now show instructions
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      alert('No chart rendered to export');
      return;
    }

    canvas.toBlob(blob => {
      downloadFile(blob, `chart-${chartType}.png`);
    });
  };

  const downloadFile = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-700">
      <div className="flex items-center gap-2 mb-4">
        <HiDownload className="w-6 h-6 text-green-600 dark:text-green-400" />
        <h3 className="text-xl font-bold text-green-600 dark:text-green-300">Export Tools</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={exportToCSV}
          disabled={exporting || !data.length}
          className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-300 dark:border-green-700 hover:shadow-lg transition disabled:opacity-50 flex flex-col items-center gap-2"
        >
          {exporting ? <ClipLoader size={20} /> : <HiDownload className="w-6 h-6 text-green-600" />}
          <span className="font-semibold">Export to CSV</span>
          <span className="text-xs text-gray-500">Compatible with Excel & Sheets</span>
        </button>

        <button
          onClick={exportToJSON}
          disabled={exporting || !data.length}
          className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-300 dark:border-green-700 hover:shadow-lg transition disabled:opacity-50 flex flex-col items-center gap-2"
        >
          {exporting ? <ClipLoader size={20} /> : <HiDownload className="w-6 h-6 text-blue-600" />}
          <span className="font-semibold">Export to JSON</span>
          <span className="text-xs text-gray-500">Structured data format</span>
        </button>

        <button
          onClick={exportChartAsImage}
          disabled={exporting || !chartData?.labels?.length}
          className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-300 dark:border-green-700 hover:shadow-lg transition disabled:opacity-50 flex flex-col items-center gap-2"
        >
          {exporting ? <ClipLoader size={20} /> : <HiSparkles className="w-6 h-6 text-purple-600" />}
          <span className="font-semibold">Export Chart</span>
          <span className="text-xs text-gray-500">Save as PNG image</span>
        </button>
      </div>
    </div>
  );
}
