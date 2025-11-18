import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function useSubmitAndNotify() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function submit({ sourcePage, payload }) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourcePage, payload })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Submit failed');
      setLoading(false);
      return { ok: true, data: json };
    } catch (err) {
      setLoading(false);
      setError(err.message || String(err));
      return { ok: false, error: err.message || String(err) };
    }
  }

  return { submit, loading, error };
}
