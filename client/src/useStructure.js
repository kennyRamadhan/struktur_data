import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';

/**
 * Hook untuk halaman Stack / Queue: memuat state dari backend
 * dan menjalankan operasi (push, pop, enqueue, dequeue, ...).
 */
export function useStructure(type) {
  const [state, setState] = useState(null);
  const [logs, setLogs] = useState([]);
  const [feedback, setFeedback] = useState(null); // { ok, text, op, value }
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api(`/${type}`).then((data) => {
      setState(data.state);
      setLogs(data.logs);
    });
  }, [type]);

  const run = useCallback(
    async (op, body) => {
      setBusy(true);
      try {
        const data = await api(`/${type}/${op}`, { method: 'POST', body: body ?? {} });
        setState(data.state);
        setFeedback({ id: Date.now(), ok: true, text: data.message, op, value: data.result });
      } catch (err) {
        if (err.body?.state) setState(err.body.state);
        setFeedback({ id: Date.now(), ok: false, text: err.message, op });
      } finally {
        api(`/${type}/logs`).then((data) => setLogs(data.logs)).catch(() => {});
        setBusy(false);
      }
    },
    [type]
  );

  return { state, logs, feedback, busy, run };
}
