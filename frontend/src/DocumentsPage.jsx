import React, { useState, useEffect } from 'react';
import {
  HiTrash,
  HiDownload,
  HiPencil,
  HiPlus,
  HiCalendar,
  HiDocument
} from 'react-icons/hi';
import { ClipLoader } from 'react-spinners';

export function DocumentsPage({ userEmail }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renaming, setRenaming] = useState(null);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:8000/documents/list?email=${encodeURIComponent(userEmail)}`
      );
      if (!res.ok) throw new Error('Failed to fetch documents');
      const data = await res.json();
      setDocuments(data.documents || []);
      setError('');
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    try {
      const res = await fetch(`http://localhost:8000/documents/${docId}?email=${encodeURIComponent(userEmail)}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete');
      setDocuments(docs => docs.filter(d => d.id !== docId));
    } catch (err) {
      alert('Error deleting document');
    }
  };

  const handleRename = async (docId) => {
    if (!newName.trim()) return;
    
    try {
      const res = await fetch(`http://localhost:8000/documents/${docId}/rename?new_name=${encodeURIComponent(newName)}&email=${encodeURIComponent(userEmail)}`, {
        method: 'PUT'
      });
      if (!res.ok) throw new Error('Failed to rename');
      setDocuments(docs =>
        docs.map(d => d.id === docId ? { ...d, filename: newName } : d)
      );
      setRenaming(null);
      setNewName('');
    } catch (err) {
      alert('Error renaming document');
    }
  };

  const handleDownload = async (docId, filename) => {
    try {
      const res = await fetch(
        `http://localhost:8000/documents/${docId}/download?email=${encodeURIComponent(userEmail)}`
      );
      if (!res.ok) throw new Error('Failed to download');
      const data = await res.json();
      
      // Convert hex back to binary and create blob
      const binaryString = atob(data.file_data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/octet-stream' });
      
      // Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error downloading document');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <HiDocument className="w-8 h-8 text-purple-500" />
          <h1 className="text-3xl font-bold text-purple-500 dark:text-purple-300">
            My Documents
          </h1>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 rounded-lg text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <ClipLoader color="#7f5af0" size={48} />
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12 bg-white/10 dark:bg-white/5 rounded-2xl">
          <HiDocument className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            No documents yet. Upload your first file to get started!
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white/10 dark:bg-white/5 rounded-2xl overflow-hidden">
            <thead className="bg-purple-600 dark:bg-purple-700">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Filename</th>
                <th className="px-6 py-4 text-left font-semibold">Type</th>
                <th className="px-6 py-4 text-center font-semibold">Rows</th>
                <th className="px-6 py-4 text-center font-semibold">Columns</th>
                <th className="px-6 py-4 text-left font-semibold flex items-center gap-1">
                  <HiCalendar className="w-4 h-4" /> Created
                </th>
                <th className="px-6 py-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {documents.map(doc => (
                <tr key={doc.id} className="hover:bg-white/20 dark:hover:bg-white/10 transition">
                  <td className="px-6 py-4">
                    {renaming === doc.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newName}
                          onChange={e => setNewName(e.target.value)}
                          className="flex-1 px-2 py-1 bg-white dark:bg-gray-800 text-black dark:text-white rounded border border-gray-300 dark:border-gray-600"
                          autoFocus
                        />
                        <button
                          onClick={() => handleRename(doc.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setRenaming(null)}
                          className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span className="font-medium">{doc.filename}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-semibold">
                      {doc.file_type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-semibold">{doc.row_count}</td>
                  <td className="px-6 py-4 text-center font-semibold">{doc.col_count}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(doc.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => {
                          setRenaming(doc.id);
                          setNewName(doc.filename);
                        }}
                        title="Rename"
                        className="p-2 text-blue-500 hover:bg-blue-500/20 rounded-lg transition"
                      >
                        <HiPencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDownload(doc.id, doc.filename)}
                        title="Download"
                        className="p-2 text-green-500 hover:bg-green-500/20 rounded-lg transition"
                      >
                        <HiDownload className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        title="Delete"
                        className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition"
                      >
                        <HiTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Stats */}
      {documents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="p-4 bg-white/20 dark:bg-white/10 rounded-2xl">
            <div className="text-2xl font-bold text-purple-500">{documents.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Documents</div>
          </div>
          <div className="p-4 bg-white/20 dark:bg-white/10 rounded-2xl">
            <div className="text-2xl font-bold text-purple-500">
              {documents.reduce((sum, d) => sum + d.row_count, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Rows</div>
          </div>
          <div className="p-4 bg-white/20 dark:bg-white/10 rounded-2xl">
            <div className="text-2xl font-bold text-purple-500">
              {documents.reduce((sum, d) => sum + d.col_count, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Columns</div>
          </div>
        </div>
      )}
    </div>
  );
}
