'use client';
import React, { useState } from 'react';

export default function NLRuleInput({ onRule }: { onRule: (r: any) => void }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConvert = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/nl-to-rule', {
        method: 'POST',
        body: JSON.stringify({ prompt: text }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.rule) {
        onRule(data.rule);
        setText('');
      } else {
        setError(data.error || 'Failed to convert.');
      }
    } catch (err) {
      setError('Conversion failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 border rounded p-4 mb-4">
      <h3 className="font-semibold mb-2">Natural Language Rule</h3>
      <textarea
        className="w-full border rounded p-2"
        rows={3}
        placeholder="e.g. Ensure T5 and T7 always run together"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        className="mt-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        onClick={handleConvert}
        disabled={loading}
      >
        {loading ? 'Converting...' : 'Convert to Rule'}
      </button>
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}
