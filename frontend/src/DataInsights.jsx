import React, { useMemo } from 'react';
import { HiLightBulb, HiExclamationCircle, HiSparkles } from 'react-icons/hi';

export function DataInsights({ data, columns }) {
  const insights = useMemo(() => {
    if (!data.length || !columns.length) return null;

    const analysis = {
      missingValues: {},
      outliers: {},
      dataTypes: {},
      recommendations: [],
      correlations: []
    };

    columns.forEach(col => {
      // Missing values detection
      const nonNullCount = data.filter(row => row[col] != null && row[col] !== '').length;
      const missingPercent = ((data.length - nonNullCount) / data.length * 100).toFixed(2);
      if (missingPercent > 0) {
        analysis.missingValues[col] = missingPercent;
      }

      // Data type detection
      const values = data.map(row => row[col]);
      const numericCount = values.filter(v => !isNaN(parseFloat(v))).length;
      if (numericCount / values.length > 0.8) {
        analysis.dataTypes[col] = 'Numeric';

        // Outlier detection (IQR method)
        const nums = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
        if (nums.length > 0) {
          nums.sort((a, b) => a - b);
          const q1 = nums[Math.floor(nums.length * 0.25)];
          const q3 = nums[Math.floor(nums.length * 0.75)];
          const iqr = q3 - q1;
          const lowerBound = q1 - 1.5 * iqr;
          const upperBound = q3 + 1.5 * iqr;
          const outlierCount = nums.filter(v => v < lowerBound || v > upperBound).length;
          if (outlierCount > 0) {
            analysis.outliers[col] = outlierCount;
          }
        }
      } else {
        analysis.dataTypes[col] = 'Categorical';
      }
    });

    // Generate recommendations
    Object.entries(analysis.missingValues).forEach(([col, percent]) => {
      if (percent > 10) {
        analysis.recommendations.push({
          type: 'warning',
          message: `Column "${col}" has ${percent}% missing values. Consider data cleaning or imputation.`
        });
      }
    });

    Object.entries(analysis.outliers).forEach(([col, count]) => {
      if (count > 0) {
        analysis.recommendations.push({
          type: 'info',
          message: `Column "${col}" has ${count} potential outliers detected.`
        });
      }
    });

    if (data.length < 100) {
      analysis.recommendations.push({
        type: 'info',
        message: 'Your dataset is relatively small. Consider uploading more data for better analysis.'
      });
    }

    return analysis;
  }, [data, columns]);

  if (!insights || !data.length) return null;

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-700">
      <div className="flex items-center gap-2 mb-4">
        <HiSparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h3 className="text-xl font-bold text-blue-600 dark:text-blue-300">Data Insights & Recommendations</h3>
      </div>

      {/* Data Quality Metrics */}
      {(Object.keys(insights.missingValues).length > 0 || Object.keys(insights.outliers).length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(insights.missingValues).length > 0 && (
            <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border border-yellow-300 dark:border-yellow-700">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2 flex items-center gap-2">
                <HiExclamationCircle className="w-5 h-5" />
                Missing Values Detected
              </h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-200 space-y-1">
                {Object.entries(insights.missingValues).map(([col, percent]) => (
                  <li key={col}>{col}: <strong>{percent}%</strong></li>
                ))}
              </ul>
            </div>
          )}

          {Object.keys(insights.outliers).length > 0 && (
            <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-lg border border-orange-300 dark:border-orange-700">
              <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-2 flex items-center gap-2">
                <HiExclamationCircle className="w-5 h-5" />
                Outliers Detected
              </h4>
              <ul className="text-sm text-orange-700 dark:text-orange-200 space-y-1">
                {Object.entries(insights.outliers).map(([col, count]) => (
                  <li key={col}>{col}: <strong>{count}</strong> outliers</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Data Types */}
      <div className="p-4 bg-white/50 dark:bg-white/5 rounded-lg">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <HiLightBulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Column Data Types
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Object.entries(insights.dataTypes).map(([col, type]) => (
            <div key={col} className="px-3 py-2 bg-blue-100 dark:bg-blue-900/40 rounded text-sm">
              <strong className="block text-blue-900 dark:text-blue-200">{col}</strong>
              <span className="text-blue-700 dark:text-blue-300">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {insights.recommendations.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold flex items-center gap-2">
            <HiLightBulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            Recommendations
          </h4>
          <div className="space-y-2">
            {insights.recommendations.map((rec, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg text-sm ${
                  rec.type === 'warning'
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700'
                }`}
              >
                {rec.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dataset Summary */}
      <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-300 dark:border-green-700">
        <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Dataset Summary</h4>
        <div className="grid grid-cols-2 gap-2 text-sm text-green-700 dark:text-green-200">
          <div>📊 Total Records: <strong>{data.length.toLocaleString()}</strong></div>
          <div>🏷️ Total Columns: <strong>{columns.length}</strong></div>
          <div>📈 Numeric Columns: <strong>{Object.values(insights.dataTypes).filter(t => t === 'Numeric').length}</strong></div>
          <div>📝 Categorical Columns: <strong>{Object.values(insights.dataTypes).filter(t => t === 'Categorical').length}</strong></div>
        </div>
      </div>
    </div>
  );
}
