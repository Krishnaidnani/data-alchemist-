/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import NLRuleInput from './NLRuleInput';
const RULE_TYPES = ['coRun', 'slotRestriction', 'loadLimit', 'phaseWindow'];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function RuleBuilder({ tasks, workers, clients }: any) {
  const [rules, setRules] = useState<any[]>([]);
  const [type, setType] = useState('coRun');
  const [form, setForm] = useState<any>({});

  const handleAddRule = () => {
    if (type === 'coRun' && form.tasks?.length > 1) {
      setRules([...rules, { type, tasks: form.tasks }]);
    } else if (type === 'slotRestriction') {
      setRules([
        ...rules,
        { type, group: form.group, minSlots: Number(form.minSlots) },
      ]);
    } else if (type === 'loadLimit') {
      setRules([
        ...rules,
        { type, group: form.group, maxPerPhase: Number(form.maxPerPhase) },
      ]);
    } else if (type === 'phaseWindow') {
      setRules([
        ...rules,
        { type, task: form.task, phases: form.phases?.split(',').map(Number) },
      ]);
    }
    setForm({});
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(rules, null, 2)], {
      type: 'application/json',
    });
    saveAs(blob, 'rules-config.json');
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Rule Builder</h2>

      <NLRuleInput
        onRule={(newRule) => setRules((prev) => [...prev, newRule])}
      />

      <div className="flex flex-col gap-4 mb-4">
        <label className="font-medium">Rule Type</label>
        <select
          className="border p-2 rounded"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {RULE_TYPES.map((rt) => (
            <option key={rt} value={rt}>
              {rt}
            </option>
          ))}
        </select>

        {type === 'coRun' && (
          <div>
            <label className="font-medium block mb-2">
              Select Task IDs (min 2)
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border p-2 rounded">
              {tasks.map((t: any) => {
                const checked = form.tasks?.includes(t.TaskID) || false;
                return (
                  <label key={t.TaskID} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={t.TaskID}
                      checked={checked}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        const prev = form.tasks || [];
                        const updated = isChecked
                          ? [...prev, t.TaskID]
                          : prev.filter((id: string) => id !== t.TaskID);
                        setForm({ ...form, tasks: updated });
                      }}
                    />
                    <span>{t.TaskID}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {type === 'slotRestriction' && (
          <div className="flex flex-col gap-2">
            <input
              placeholder="Group name"
              className="border p-2 rounded"
              value={form.group || ''}
              onChange={(e) => setForm({ ...form, group: e.target.value })}
            />
            <input
              placeholder="Min common slots"
              type="number"
              className="border p-2 rounded"
              value={form.minSlots || ''}
              onChange={(e) => setForm({ ...form, minSlots: e.target.value })}
            />
          </div>
        )}

        {type === 'loadLimit' && (
          <div className="flex flex-col gap-2">
            <input
              placeholder="Worker Group"
              className="border p-2 rounded"
              value={form.group || ''}
              onChange={(e) => setForm({ ...form, group: e.target.value })}
            />
            <input
              placeholder="Max slots per phase"
              type="number"
              className="border p-2 rounded"
              value={form.maxPerPhase || ''}
              onChange={(e) =>
                setForm({ ...form, maxPerPhase: e.target.value })
              }
            />
          </div>
        )}

        {type === 'phaseWindow' && (
          <div className="flex flex-col gap-2">
            <input
              placeholder="Task ID"
              className="border p-2 rounded"
              value={form.task || ''}
              onChange={(e) => setForm({ ...form, task: e.target.value })}
            />
            <input
              placeholder="Allowed phases (comma-separated)"
              className="border p-2 rounded"
              value={form.phases || ''}
              onChange={(e) => setForm({ ...form, phases: e.target.value })}
            />
          </div>
        )}

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleAddRule}
        >
          Add Rule
        </button>
      </div>

      <div className="mt-6 space-y-2">
        <h3 className="text-lg font-semibold">Current Rules</h3>
        <pre className="bg-gray-100 text-sm p-2 rounded max-h-48 overflow-y-auto">
          {JSON.stringify(rules, null, 2)}
        </pre>
      </div>

      <button
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        onClick={handleDownload}
      >
        Generate Rules Config
      </button>
    </div>
  );
}
