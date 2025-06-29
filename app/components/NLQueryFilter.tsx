'use client';
import React, { useState } from 'react';

interface Props {
  clients: any[];
  workers: any[];
  tasks: any[];
}

export default function NLQueryFilter({ clients, workers, tasks }: Props) {
  const [entity, setEntity] = useState<'clients' | 'workers' | 'tasks'>(
    'tasks'
  );
  const [query, setQuery] = useState('');
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [filterCode, setFilterCode] = useState('');

  const runQuery = async () => {
    const res = await fetch('/api/nl-filter-gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: query, entity }),
    });
    const { filterCode } = await res.json();
    setFilterCode(filterCode);

    const data =
      entity === 'clients' ? clients : entity === 'workers' ? workers : tasks;
    const filterFn = new Function('row', `return (${filterCode})`);

    const result = data.filter((row) => {
      try {
        return filterFn(row);
      } catch {
        return false;
      }
    });
    setFilteredData(result);
  };

  return (
    <div className="bg-white shadow p-4 rounded-xl mt-8">
      <h2 className="text-lg font-semibold mb-2"> Natural Language Filter</h2>
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <select
          value={entity}
          onChange={(e) => setEntity(e.target.value as any)}
          className="border rounded px-2 py-1"
        >
          <option value="clients">Clients</option>
          <option value="workers">Workers</option>
          <option value="tasks">Tasks</option>
        </select>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Tasks with Duration > 1 and phase 2"
          className="flex-1 border rounded px-2 py-1"
        />
        <button
          onClick={runQuery}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Run
        </button>
      </div>
      {filterCode && (
        <pre className="text-xs bg-gray-100 p-2 rounded text-gray-600 mb-3 overflow-x-auto">
          Generated filter: <code>{filterCode}</code>
        </pre>
      )}
      <div>
        <h3 className="font-medium mb-1">
          Results ({filteredData.length} rows)
        </h3>
        <pre className="text-xs bg-gray-50 p-2 rounded max-h-60 overflow-auto">
          {JSON.stringify(filteredData, null, 2)}
        </pre>
      </div>
    </div>
  );
}
