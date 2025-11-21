// 📁 src/UploadDataPage.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import ExcelJS from "exceljs";
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ClipLoader } from 'react-spinners';
import { Link, useNavigate } from 'react-router-dom';
import { HiDownload, HiDocument } from 'react-icons/hi';


export function UploadDataPage({ setParsedData, setColumnNames, userEmail }) {
  const navigate = useNavigate();
  const [localData, setLocalData] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedCols, setSelectedCols] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);


  const onDrop = useCallback(files => {
    if (files.length) handleFile(files[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false,
  });

  const handleFile = file => {
    setCurrentFile(file);
    setLoading(true);
    const ext = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    reader.onload = e => {
      const content = e.target.result;
      let parsed = [];

      if (ext === 'csv') {
        const parseResult = Papa.parse(content, { 
          header: true,
          dynamicTyping: false,
          skipEmptyLines: true
        });
        parsed = parseResult.data.filter(row => Object.values(row).some(v => v !== '' && v !== null));
      } else if (ext === 'json') {
        parsed = JSON.parse(content);
      } else {
        const wb = XLSX.read(content, { type: 'binary' });
        parsed = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      }

      processData(parsed, file);
    };

    if (['xls', 'xlsx'].includes(ext)) reader.readAsBinaryString(file);
    else reader.readAsText(file);
  };

  const processData = async (parsed, file) => {
    setLoading(false);
    setParsedData(parsed);
    setLocalData(parsed);
    
    // Store to both localStorage and sessionStorage for data passing
    try {
      const dataStr = JSON.stringify(parsed);
      
      // Always store to sessionStorage (survives page navigation within session)
      try {
        sessionStorage.setItem('visualizationData', dataStr);
      } catch (err) {
        console.warn('sessionStorage quota exceeded');
      }
      
      // Store to localStorage only if size is reasonable (< 500KB)
      if (dataStr.length < 500000) {
        localStorage.setItem('lastUploadedData', dataStr);
      } else {
        localStorage.removeItem('lastUploadedData');
      }
    } catch (err) {
      console.warn('Storage quota exceeded, data will be available in current session');
    }

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

    // Auto-save document to database (only if file object exists, not when loading from database)
    if (userEmail && file) {
      // Track upload in stats only for new uploads
      if (window.updateUploadStats) {
        window.updateUploadStats();
      }

      try {
        const ext = file.name.split('.').pop().toLowerCase();
        const formData = new FormData();
        formData.append('email', userEmail);
        formData.append('filename', file.name);
        formData.append('file_type', ext);
        formData.append('row_count', parsed.length);
        formData.append('col_count', cols.length);
        formData.append('file', file);

        const response = await fetch('http://localhost:8000/documents/save', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          // Refresh the documents list after saving
          await fetchSavedDocuments();
        }
      } catch (err) {
        console.error('Error saving document:', err);
      }
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('lastUploadedData');
    if (saved) processData(JSON.parse(saved));
    
    // Fetch user's saved documents
    if (userEmail) fetchSavedDocuments();
  }, [userEmail]);

  const fetchSavedDocuments = async () => {
    try {
      setLoadingDocs(true);
      const res = await fetch(
        `http://localhost:8000/documents/list?email=${encodeURIComponent(userEmail)}`
      );
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleLoadDocument = async (docId) => {
    try {
      setLoading(true);
      console.log('Loading document:', docId);
      
      const res = await fetch(
        `http://localhost:8000/documents/${docId}/download?email=${encodeURIComponent(userEmail)}`
      );
      if (!res.ok) throw new Error('Failed to download document');
      
      const data = await res.json();
      console.log('Downloaded data:', data);
      
      // Convert hex string back to binary
      const hexString = data.file_data;
      const fileData = new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
      
      const doc = documents.find(d => d.id === docId);
      const ext = doc?.file_type || 'csv';
      console.log('File extension:', ext);
      
      let parsed = [];

      if (ext === 'csv') {
        const text = new TextDecoder().decode(fileData);
        console.log('CSV text length:', text.length);
        const parseResult = Papa.parse(text, { 
          header: true,
          dynamicTyping: false,
          skipEmptyLines: true
        });
        parsed = parseResult.data.filter(row => Object.values(row).some(v => v !== '' && v !== null));
        console.log('Parsed CSV rows:', parsed.length);
      } else if (ext === 'json') {
        const text = new TextDecoder().decode(fileData);
        parsed = JSON.parse(text);
        console.log('Parsed JSON rows:', parsed.length);
      } else if (['xls', 'xlsx'].includes(ext)) {
        const workbook = XLSX.read(fileData, { type: 'array' });
        parsed = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        console.log('Parsed XLSX rows:', parsed.length);
      }

      console.log('Final parsed data:', parsed.slice(0, 2));
      processData(parsed); // Don't pass file to avoid re-saving
      setLoading(false);
    } catch (err) {
      console.error('Error loading document:', err);
      setLoading(false);
      alert('Failed to load document: ' + err.message);
    }
  };

  // Pagination
  const pageSize = 10;
  const pageCount = Math.ceil(localData.length / pageSize);
  const currentSlice = localData.slice(page * pageSize, (page + 1) * pageSize);

  return (

    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 rounded-2xl">
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

      {/* Saved Documents Section */}
      {documents.length > 0 && (
        <div className="p-6 bg-white/20 dark:bg-white/5 rounded-2xl border border-purple-300 dark:border-white/20">
          <div className="flex items-center gap-2 mb-4">
            <HiDocument className="w-6 h-6 text-purple-600 dark:text-purple-300" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">📁 Your Saved Documents</h3>
          </div>
          {loadingDocs ? (
            <ClipLoader color="#7f5af0" size={24} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {documents.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => handleLoadDocument(doc.id)}
                  className="p-4 bg-white/50 dark:bg-white/20 rounded-lg hover:bg-white/70 dark:hover:bg-white/30 transition border border-purple-300 dark:border-white/30 text-left backdrop-blur-sm shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{doc.filename}</p>
                      <p className="text-xs text-gray-700 dark:text-gray-400">{doc.row_count} rows × {doc.col_count} cols</p>
                    </div>
                    <HiDownload className="w-5 h-5 text-purple-600 dark:text-purple-400 ml-2 flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}






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






      {/* Column Selector - Only shown when preview is clicked */}
      {showPreview && stats && localData.length > 0 && localData[0] && (
        <div className="p-4 bg-white/20 dark:bg-white/5 rounded-2xl border border-purple-300 dark:border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">Select Columns to Preview</h4>
            <label className="inline-flex items-center px-3 py-1 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition">
              <input
                type="checkbox"
                checked={selectedCols.length === Object.keys(localData[0]).length}
                onChange={() => {
                  const allCols = Object.keys(localData[0]);
                  if (selectedCols.length === allCols.length) {
                    setSelectedCols([]);
                  } else {
                    setSelectedCols(allCols);
                  }
                }}
                className="form-checkbox h-4 w-4"
              />
              <span className="ml-2 text-sm font-semibold">Select All</span>
            </label>
          </div>
          <div className="flex flex-wrap gap-3">
            {Object.keys(localData[0]).map(col => (
              <label key={col} className="inline-flex items-center px-3 py-2 bg-white/50 dark:bg-white/20 rounded-lg border border-purple-300 dark:border-white/30 cursor-pointer hover:bg-white/70 dark:hover:bg-white/30 transition backdrop-blur-sm shadow-md">
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
                <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">{col}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Preview Table */}
      {showPreview && localData.length > 0 && selectedCols.length > 0 && (
        <div className="p-6 bg-white/10 dark:bg-white/5 rounded-2xl shadow-lg">
          <h4 className="font-semibold mb-4 text-lg">👁️ Preview (Page {page + 1} of {pageCount})</h4>
          <div className="overflow-y-auto max-h-96 border border-purple-200 dark:border-purple-700 rounded-lg">
            <table className="w-full text-sm">\n              <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white sticky top-0">
                <tr>
                  {selectedCols.map(col => (
                    <th key={col} className="px-4 py-3 text-left font-semibold">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentSlice.map((row, i) => (
                  <tr
                    key={i}
                    className={`${i % 2 === 0 ? 'bg-white/5' : 'bg-white/10'} border-b border-purple-200 dark:border-purple-700 hover:bg-purple-50/20 dark:hover:bg-purple-900/20 transition`}
                  >
                    {selectedCols.map(col => (
                      <td key={col} className="px-4 py-3 text-gray-900 dark:text-gray-100">{row[col]?.toString() || ''}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 0))}
              disabled={page === 0}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">Page {page + 1} of {pageCount}</span>
            <button
              onClick={() => setPage(p => Math.min(p + 1, pageCount - 1))}
              disabled={page >= pageCount - 1}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next →
            </button>
          </div>
        </div>
      )}


      {/* Numeric Stats Table */}
      {stats && stats.numericStats && Object.keys(stats.numericStats).length > 0 && (
        <div className="p-6 bg-white/10 dark:bg-white/5 rounded-2xl shadow-lg">
          <h4 className="font-semibold mb-4 text-lg">📊 Numeric Columns Summary</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Column Name</th>
                  <th className="px-4 py-3 text-right font-semibold">Min</th>
                  <th className="px-4 py-3 text-right font-semibold">Max</th>
                  <th className="px-4 py-3 text-right font-semibold">Average</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats.numericStats).map(([col, s], idx) => (
                  <tr
                    key={col}
                    className={`${idx % 2 === 0 ? 'bg-white/5' : 'bg-white/10'} border-b border-purple-200 dark:border-purple-700 hover:bg-purple-50/20 dark:hover:bg-purple-900/20 transition`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{col}</td>
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{s.min}</td>
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{s.max}</td>
                    <td className="px-4 py-3 text-right font-semibold text-purple-600 dark:text-purple-400">{s.avg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
    </div>


  );
}
