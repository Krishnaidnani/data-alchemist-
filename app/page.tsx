'use client';

import React, { useState } from 'react';
import FileUploader from './components/FileUploader';
import DataGrid from './components/DataGrid';
import { validateAll, ValidationError } from './utils/validationEngine';
import NLQueryFilter from './components/NLQueryFilter';
import RuleBuilder from './components/RuleBuilder';
import PrioritizationPanel from './components/PrioritizationPanel';
import ExportBundle from './components/ExportBundle';

export default function Home() {
  const [clients, setClients] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [prioritization, setPrioritization] = useState<Record<string, number>>(
    {}
  );

  const handleData = (data: any[], entity: string) => {
    if (entity === 'clients') setClients(data);
    else if (entity === 'workers') setWorkers(data);
    else if (entity === 'tasks') setTasks(data);
    setErrors([]);
  };

  const updateRow = (
    entity: 'clients' | 'workers' | 'tasks',
    rowIndex: number,
    key: string,
    value: string
  ) => {
    const updater = (prev: any[]) =>
      prev.map((row, idx) =>
        idx === rowIndex ? { ...row, [key]: value } : row
      );

    if (entity === 'clients')
      setClients((prev) => {
        const updated = updater(prev);
        setTimeout(() => setErrors(validateAll(updated, tasks, workers)), 0);
        return updated;
      });

    if (entity === 'workers')
      setWorkers((prev) => {
        const updated = updater(prev);
        setTimeout(() => setErrors(validateAll(clients, tasks, updated)), 0);
        return updated;
      });

    if (entity === 'tasks')
      setTasks((prev) => {
        const updated = updater(prev);
        setTimeout(() => setErrors(validateAll(clients, updated, workers)), 0);
        return updated;
      });
  };

  const revalidate = () => {
    const result = validateAll(clients, tasks, workers);
    setErrors(result);
  };

  const getCellErrors = (entity: 'clients' | 'workers' | 'tasks') =>
    errors
      .filter((e) => e.entity === entity)
      .map((e) => ({ row: e.rowIndex, column: e.column, message: e.message }));

  const getErrorMessages = (entity: 'clients' | 'workers' | 'tasks') =>
    errors.filter((e) => e.entity === entity);

  const Section = ({
    title,
    data,
    entity,
  }: {
    title: string;
    data: any[];
    entity: 'clients' | 'workers' | 'tasks';
    setData: React.Dispatch<React.SetStateAction<any[]>>;
  }) => (
    <div className="bg-white rounded-2xl shadow-md p-6 w-full overflow-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <div className="flex gap-3">
          <FileUploader
            onData={(parsedData) => handleData(parsedData, entity)}
          />
          <button
            onClick={revalidate}
            className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600"
          >
            Re-Validate
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        {data.length > 0 ? (
          <>
            <DataGrid
              data={data}
              onEdit={(row, key, val) => updateRow(entity, row, key, val)}
              cellErrors={getCellErrors(entity)}
            />
            <ul className="mt-4 text-sm text-red-600 space-y-1">
              {getErrorMessages(entity).map((e, i) => (
                <li key={i}>
                  Row {e.rowIndex + 1} - <strong>{e.column}</strong>:{' '}
                  {e.message}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-gray-500 italic text-center">
            No data uploaded yet.
          </p>
        )}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-200 py-10 px-4">
      <h1 className="text-4xl font-extrabold text-center text-blue-900 mb-10">
        Data Alchemist Dashboard
      </h1>

      <div className="max-w-full xl:max-w-7xl mx-auto space-y-12">
        <Section
          title="Clients"
          data={clients}
          entity="clients"
          setData={setClients}
        />
        <Section
          title="Workers"
          data={workers}
          entity="workers"
          setData={setWorkers}
        />
        <Section title="Tasks" data={tasks} entity="tasks" setData={setTasks} />

        <div className="bg-white rounded-2xl shadow-md p-6 w-full">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Natural Language Data Query
          </h2>
          <NLQueryFilter clients={clients} workers={workers} tasks={tasks} />
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 w-full">
          <RuleBuilder
            clients={clients}
            workers={workers}
            tasks={tasks}
            rules={rules}
            setRules={setRules}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 w-full">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            ⚖️ Prioritization & Weights
          </h2>
          <PrioritizationPanel
            prioritization={prioritization}
            setPrioritization={setPrioritization}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 w-full">
          <ExportBundle
            clients={clients}
            workers={workers}
            tasks={tasks}
            rules={rules}
            prioritization={prioritization}
          />
        </div>
      </div>
    </main>
  );
}
