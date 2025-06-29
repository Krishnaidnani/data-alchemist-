'use client';

import React, { useState } from 'react';
import { saveAs } from 'file-saver';

const DEFAULT_WEIGHTS = {
  priorityLevel: 5,
  fulfillment: 5,
  fairness: 5,
  workload: 5,
};

const PRESETS = {
  maximizeFulfillment: {
    priorityLevel: 2,
    fulfillment: 10,
    fairness: 3,
    workload: 5,
  },
  fairDistribution: {
    priorityLevel: 4,
    fulfillment: 4,
    fairness: 10,
    workload: 5,
  },
};

export default function PrioritizationPanel() {
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(weights, null, 2)], {
      type: 'application/json',
    });
    saveAs(blob, 'prioritization.json');
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        ⚖️ Prioritization Settings
      </h2>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setWeights(PRESETS.maximizeFulfillment)}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Maximize Fulfillment
        </button>
        <button
          onClick={() => setWeights(PRESETS.fairDistribution)}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Fair Distribution
        </button>
        <button
          onClick={() => setWeights(DEFAULT_WEIGHTS)}
          className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
        >
          Reset
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(weights).map(([key, value]) => (
          <div key={key} className="flex items-center gap-4">
            <label className="w-48 capitalize text-gray-700">
              {key.replace(/([A-Z])/g, ' $1')}
            </label>
            <input
              type="range"
              min={0}
              max={10}
              value={value}
              onChange={(e) =>
                setWeights({ ...weights, [key]: Number(e.target.value) })
              }
              className="flex-1"
            />
            <span className="w-8 text-right">{value}</span>
          </div>
        ))}
      </div>

      <button
        className="mt-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        onClick={handleExport}
      >
        Export Prioritization
      </button>
    </div>
  );
}
