/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

interface ExportBundleProps {
  clients: any[];
  workers: any[];
  tasks: any[];
  rules: any[];
  prioritization: Record<string, number>;
}

export default function ExportBundle({
  clients,
  workers,
  tasks,
  rules,
  prioritization,
}: ExportBundleProps) {
  const exportAll = async () => {
    const zip = await import('jszip');
    const JSZip = zip.default;
    const zipFile = new JSZip();

    const addCSV = (name: string, data: any[]) => {
      const csv = Papa.unparse(data);
      zipFile.file(`${name}.csv`, csv);
    };

    addCSV('clients', clients);
    addCSV('workers', workers);
    addCSV('tasks', tasks);
    zipFile.file('rules.json', JSON.stringify(rules, null, 2));
    zipFile.file(
      'prioritization.json',
      JSON.stringify(prioritization, null, 2)
    );

    const content = await zipFile.generateAsync({ type: 'blob' });
    saveAs(content, 'data-bundle.zip');
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 w-full text-center">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Export Bundle</h2>
      <p className="text-gray-600 mb-4">
        Download cleaned and validated data sheets + rules and prioritization as
        a zip file.
      </p>
      <button
        onClick={exportAll}
        className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
      >
        Export All
      </button>
    </div>
  );
}
