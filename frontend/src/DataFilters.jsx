import React, { useState, useMemo, useEffect } from 'react';
import { HiAdjustments, HiX } from 'react-icons/hi';

export function DataFilters({ data, columns, onFilterChange }) {
  const [filters, setFilters] = useState({});
  const [filterType, setFilterType] = useState({});
  const [searchText, setSearchText] = useState('');

  const filteredData = useMemo(() => {
    let result = data;

    // Apply column filters
    Object.entries(filters).forEach(([col, value]) => {
      if (!value) return;

      const type = filterType[col];
      if (type === 'range') {
        const [min, max] = value;
        result = result.filter(row => {
          const val = parseFloat(row[col]);
          return !isNaN(val) && val >= min && val <= max;
        });
      } else if (type === 'exact') {
        result = result.filter(row => row[col] === value);
      } else if (type === 'contains') {
        result = result.filter(row =>
          String(row[col]).toLowerCase().includes(value.toLowerCase())
        );
      }
    });

    // Apply global search
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(row =>
        columns.some(col =>
          String(row[col]).toLowerCase().includes(searchLower)
        )
      );
    }

    return result;
  }, [filters, filterType, searchText, data, columns]);

  // Notify parent of filtered data changes
  useEffect(() => {
    onFilterChange(filteredData);
  }, [filteredData, onFilterChange]);

  const getColumnStats = (col) => {
    const values = data.map(r => r[col]);
    const numericVals = values.map(v => parseFloat(v)).filter(v => !isNaN(v));

    if (numericVals.length > 0) {
      return {
        isNumeric: true,
        min: Math.min(...numericVals),
        max: Math.max(...numericVals)
      };
    }
    return { isNumeric: false };
  };

  const addFilter = (col) => {
    const stats = getColumnStats(col);
    if (stats.isNumeric) {
      setFilterType(prev => ({ ...prev, [col]: 'range' }));
      setFilters(prev => ({ ...prev, [col]: [stats.min, stats.max] }));
    } else {
      setFilterType(prev => ({ ...prev, [col]: 'exact' }));
      setFilters(prev => ({ ...prev, [col]: '' }));
    }
  };

  const removeFilter = (col) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[col];
      return newFilters;
    });
    setFilterType(prev => {
      const newTypes = { ...prev };
      delete newTypes[col];
      return newTypes;
    });
  };

  const getUniqueValues = (col) => {
    return [...new Set(data.map(r => r[col]))].slice(0, 20);
  };

  return (
    <div className="space-y-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200 dark:border-purple-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HiAdjustments className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h3 className="text-xl font-bold text-purple-600 dark:text-purple-300">Filters & Search</h3>
        </div>
        <span className="text-sm bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full">
          {filteredData.length} / {data.length} rows
        </span>
      </div>

      {/* Global Search */}
      <div>
        <input
          type="text"
          placeholder="🔍 Search across all columns..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full px-4 py-2 bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg border border-purple-300 dark:border-purple-600 focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Active Filters */}
      {Object.keys(filters).length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-purple-700 dark:text-purple-300">Active Filters:</h4>
          <div className="space-y-2">
            {Object.entries(filters).map(([col, value]) => {
              const stats = getColumnStats(col);
              return (
                <div key={col} className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">{col}</span>
                    <button
                      onClick={() => removeFilter(col)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <HiX className="w-4 h-4" />
                    </button>
                  </div>

                  {stats.isNumeric && filterType[col] === 'range' ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={value[0]}
                          onChange={(e) =>
                            setFilters(prev => ({
                              ...prev,
                              [col]: [parseFloat(e.target.value), value[1]]
                            }))
                          }
                          placeholder="Min"
                          className="flex-1 px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600"
                        />
                        <input
                          type="number"
                          value={value[1]}
                          onChange={(e) =>
                            setFilters(prev => ({
                              ...prev,
                              [col]: [value[0], parseFloat(e.target.value)]
                            }))
                          }
                          placeholder="Max"
                          className="flex-1 px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600"
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        Range: {stats.min.toFixed(2)} - {stats.max.toFixed(2)}
                      </div>
                    </div>
                  ) : (
                    <select
                      value={value}
                      onChange={(e) =>
                        setFilters(prev => ({ ...prev, [col]: e.target.value }))
                      }
                      className="w-full px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600"
                    >
                      <option value="">Select value...</option>
                      {getUniqueValues(col).map(val => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </select>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add New Filter */}
      {Object.keys(filters).length < columns.length && (
        <div>
          <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">Add Filter:</p>
          <select
            onChange={(e) => {
              if (e.target.value) {
                addFilter(e.target.value);
                e.target.value = '';
              }
            }}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg border border-purple-300 dark:border-purple-600"
            defaultValue=""
          >
            <option value="">Select column to filter...</option>
            {columns.filter(col => !Object.keys(filters).includes(col)).map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
