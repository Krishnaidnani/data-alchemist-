'use client';
import React, { useRef } from 'react';
import Papa from 'papaparse';

export default function FileUploader({
  onData,
}: {
  onData: (data: any[], entity: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as any[];
          const name = file.name.toLowerCase();
          if (name.includes('client')) onData(data, 'clients');
          else if (name.includes('worker')) onData(data, 'workers');
          else if (name.includes('task')) onData(data, 'tasks');
          else alert(`Unknown file: ${file.name}`);
        },
      });
    });

    e.target.value = '';
  };

  return (
    <div>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Upload CSV
      </button>
      <input
        type="file"
        accept=".csv"
        multiple
        onChange={handleUpload}
        ref={fileInputRef}
        className="hidden"
      />
    </div>
  );
}
