// 📁 src/UploadDataPage.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { ClipLoader } from 'react-spinners';
import { Link } from 'react-router-dom';
import ChartTypeSelector from './ChartTypeSelector'; // ✅


export function UploadDataPage({ setParsedData, setColumnNames }) {
  const [localData, setLocalData] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedCols, setSelectedCols] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);


  const onDrop = useCallback(files => {
    if (files.length) handleFile(files[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: '.csv, .json, .xls, .xlsx',
    multiple: false,
  });

  const handleFile = file => {
    setLoading(true);
    const ext = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    reader.onload = e => {
      const content = e.target.result;
      let parsed = [];

      if (ext === 'csv') {
        parsed = Papa.parse(content, { header: true }).data;
      } else if (ext === 'json') {
        parsed = JSON.parse(content);
      } else {
        const wb = XLSX.read(content, { type: 'binary' });
        parsed = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      }

      processData(parsed);
    };

    if (['xls', 'xlsx'].includes(ext)) reader.readAsBinaryString(file);
    else reader.readAsText(file);
  };

  const processData = parsed => {
    setLoading(false);
    setParsedData(parsed);
    setLocalData(parsed);
    localStorage.setItem('lastUploadedData', JSON.stringify(parsed));

    if (!parsed.length || typeof parsed[0] !== 'object') return;

    const cols = Object.keys(parsed[0]);
    setColumnNames(cols);
    setSelectedCols(cols.slice(0, 5));
    setPage(0);

    // numeric stats
    const numericStats = {};
    cols.forEach(col => {
      const vals = parsed.map(r => parseFloat(r[col])).filter(v => !isNaN(v));
      if (vals.length) {
        const sum = vals.reduce((a, b) => a + b, 0);
        numericStats[col] = {
          min: Math.min(...vals).toFixed(2),
          max: Math.max(...vals).toFixed(2),
          avg: (sum / vals.length).toFixed(2),
        };
      }
    });
    setStats({
      rowCount: parsed.length,
      colCount: cols.length,
      numericStats,
    });
  };

  useEffect(() => {
    const saved = localStorage.getItem('lastUploadedData');
    if (saved) processData(JSON.parse(saved));
  }, []);

  // Pagination
  const pageSize = 10;
  const pageCount = Math.ceil(localData.length / pageSize);
  const currentSlice = localData.slice(page * pageSize, (page + 1) * pageSize);

  return (

    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {/* Drag & Drop */}

      <div className="grid md:grid-cols-3 gap-4">
        {/* Drag & Drop area (2 columns wide) */}
        <div
          {...getRootProps()}
          className={`md:col-span-2 border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${isDragActive
              ? 'border-purple-400 bg-purple-50/20'
              : 'border-gray-300 bg-white/10 dark:border-gray-600 dark:bg-white/5'
            }`}
        >
          <input {...getInputProps()} />
          {loading ? (
            <ClipLoader color="#7f5af0" size={48} />
          ) : (
            <>
              <p>{isDragActive ? 'Drop file here…' : 'Drag & drop a file, or click to select'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">.csv, .json, .xls, .xlsx</p>
            </>
          )}
        </div>

        {/* Button Column (1 column wide, 2 stacked buttons) */}
        {localData.length > 0 && selectedCols.length > 0 && (
          <div className="flex flex-col justify-start gap-4">
            <Link
              to="/visualize"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-semibold rounded-full shadow-lg hover:from-purple-700 hover:to-indigo-600 transition text-center"
            >
              🚀 Visualize My Data
            </Link>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-6 py-3 bg-purple-700 text-white font-semibold rounded-full shadow-lg hover:bg-purple-800 transition"
            >
              👁️ {showPreview ? 'Hide' : 'Preview'} Selected Data
            </button>
          </div>
        )}
      </div>






      {/* Stats */}
      {/* Stats – Now with polished cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rows Card */}
          <div className="p-6 bg-white/20 dark:bg-white/10 rounded-2xl shadow-lg flex flex-col items-center">
            <div className="text-4xl font-bold text-purple-500 mb-2">{stats.rowCount}</div>
            <div className="uppercase text-sm tracking-wide">Total Rows</div>
          </div>

          {/* Columns Card */}
          <div className="p-6 bg-white/20 dark:bg-white/10 rounded-2xl shadow-lg flex flex-col items-center">
            <div className="text-4xl font-bold text-purple-500 mb-2">{stats.colCount}</div>
            <div className="uppercase text-sm tracking-wide">Total Columns</div>
          </div>
        </div>
      )}






      {/* Column Selector */}
      {stats && (
        <div className="p-4 bg-white/10 dark:bg-white/5 rounded-2xl shadow">
          <h4 className="font-semibold mb-2">Select Columns to Preview</h4>
          <div className="flex flex-wrap gap-3">
            {stats &&
              Object.keys(localData[0]).map(col => (
                <label key={col} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedCols.includes(col)}
                    onChange={() =>
                      setSelectedCols(cols =>
                        cols.includes(col)
                          ? cols.filter(c => c !== col)
                          : [...cols, col]
                      )
                    }
                    className="form-checkbox h-4 w-4 text-purple-600"
                  />
                  <span className="ml-2">{col}</span>
                </label>
              ))}
          </div>
        </div>
      )}

      {/* Preview Table */}
      {showPreview && localData.length > 0 && selectedCols.length > 0 && (

        <div className="p-4 bg-white/10 dark:bg-white/5 rounded-2xl shadow">
          <h4 className="font-semibold mb-2">
            Preview (Page {page + 1} of {pageCount})
          </h4>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-purple-100 dark:bg-purple-900">
                <tr>
                  {selectedCols.map(col => (
                    <th key={col} className="px-3 py-2">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentSlice.map((row, i) => (
                  <tr key={i} className="even:bg-gray-100 dark:even:bg-gray-800">
                    {selectedCols.map(col => (
                      <td key={col} className="px-3 py-1">{row[col]?.toString() || ''}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex justify-between">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 0))}
              disabled={page === 0}
              className="px-4 py-1 bg-purple-600 text-white rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(p + 1, pageCount - 1))}
              disabled={page >= pageCount - 1}
              className="px-4 py-1 bg-purple-600 text-white rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>


        </div>



      )}


             {/* Numeric Stats Card */}
      {stats && stats.numericStats && (
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          {/* Min Card */}
          <div className="p-6 bg-white/20 dark:bg-white/10 rounded-2xl shadow-lg">
            <div className="uppercase text-sm tracking-wide mb-4">Numeric Columns Summary </div>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(stats.numericStats).map(([col, s]) => (
                <div
                  key={col}
                  className="p-4 bg-white/30 dark:bg-white/5 rounded-lg flex flex-col"
                >
                  <div className="font-semibold mb-1">{col}</div>
                  <div className=" text-gray-700 dark:text-gray-400 space-y-0.5">
                    <div>Min: <span className="font-medium">{s.min}</span></div>
                    <div>Max: <span className="font-medium">{s.max}</span></div>
                    <div>Avg: <span className="font-medium">{s.avg}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>


  );
}
