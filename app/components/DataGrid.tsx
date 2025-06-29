'use client';
import React, { useState } from 'react';

type Props = {
  data: any[];
  onEdit: (rowIndex: number, key: string, value: string) => void;
  cellErrors?: { row: number; column: string; message: string }[];
};

export default function DataGrid({ data, onEdit, cellErrors = [] }: Props) {
  const [editingCell, setEditingCell] = useState<{
    row: number;
    key: string;
  } | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [loadingFix, setLoadingFix] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<{ [key: string]: string }>({});

  if (!data || data.length === 0) {
    return <div className="text-gray-500">No data available.</div>;
  }

  const headers = Object.keys(data[0]);

  const getError = (row: number, key: string) => {
    return cellErrors.find((err) => err.row === row && err.column === key);
  };

  const handleSuggestFix = async (error: {
    row: number;
    column: string;
    message: string;
  }) => {
    const originalValue = data[error.row][error.column];
    const fullRow = data[error.row];
    const key = `${error.row}-${error.column}`;
    setLoadingFix(key);

    try {
      const response = await fetch('/api/ai-fix-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          column: error.column,
          value: originalValue,
          message: error.message,
          row: fullRow,
          dataset: data,
        }),
      });

      const result = await response.json();
      const suggested = result.fix;

      if (suggested) {
        setSuggestions((prev) => ({
          ...prev,
          [key]: suggested,
        }));
      }
    } catch (err) {
      console.error('AI suggestion failed:', err);
    } finally {
      setLoadingFix(null);
    }
  };

  return (
    <table className="w-full text-sm border border-gray-300 overflow-auto">
      <thead>
        <tr>
          {headers.map((header) => (
            <th
              key={header}
              className="border px-2 py-1 bg-gray-100 font-semibold"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {headers.map((key) => {
              const error = getError(rowIndex, key);
              const isEditing =
                editingCell?.row === rowIndex && editingCell?.key === key;
              const suggestionKey = `${rowIndex}-${key}`;
              const suggested = suggestions[suggestionKey];

              return (
                <td
                  key={key}
                  onClick={() => {
                    setEditingCell({ row: rowIndex, key });
                    setTempValue(typeof row[key] === 'string' ? row[key] : '');
                  }}
                  className={`border px-2 py-1 cursor-pointer align-top ${
                    error ? 'bg-red-200' : row[key] === '' ? 'bg-red-100' : ''
                  }`}
                >
                  {isEditing ? (
                    <div>
                      <input
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={() => {
                          onEdit(rowIndex, key, tempValue);
                          setEditingCell(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            onEdit(rowIndex, key, tempValue);
                            setEditingCell(null);
                          }
                        }}
                        className="w-full px-1 border rounded-sm"
                        autoFocus
                      />
                      {error && (
                        <div className="text-xs text-red-600 mt-1">
                          {error.message}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <span className="text-gray-800">
                        {row[key] !== undefined && row[key] !== '' ? (
                          row[key]
                        ) : (
                          <span className="text-gray-400 italic">
                            Click to edit
                          </span>
                        )}
                      </span>

                      {error && (
                        <div className="text-xs text-red-600 mt-1">
                          {error.message}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSuggestFix(error);
                            }}
                            disabled={loadingFix === suggestionKey}
                            className="text-blue-600 underline ml-2"
                          >
                            {loadingFix === suggestionKey
                              ? '...'
                              : 'Suggest Fix'}
                          </button>

                          {suggested && (
                            <div className="mt-1 bg-yellow-100 border border-yellow-400 text-yellow-800 text-xs p-1 rounded">
                              <strong>AI Suggestion:</strong> {suggested}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(rowIndex, key, suggested);
                                  setSuggestions((prev) => {
                                    const copy = { ...prev };
                                    delete copy[suggestionKey];
                                    return copy;
                                  });
                                }}
                                className="ml-2 text-green-700 underline"
                              >
                                Apply
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
