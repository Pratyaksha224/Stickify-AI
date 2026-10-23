import React, { useContext, useMemo, useState } from 'react';
import { NoteContext } from '../context/NoteContext';
import { useNavigate } from 'react-router-dom';
import { BarChart2, FileText, ClipboardList, CheckCircle, AlertCircle, CloudUpload } from "lucide-react";
import { createUserDb } from '../appwrite/databases';

const DashboardPage = () => {
  const { notes, aiMeta, db } = useContext(NoteContext);
  const navigate = useNavigate();
  const [migrating, setMigrating] = useState(false);
  const [migrateResult, setMigrateResult] = useState(null);

  // Compute metrics
  const totalNotes = notes.length;
  
  // Tasks
  let pendingTasks = 0;
  let completedTasks = 0;
  
  // Category counts
  const categoryCount = {};
  
  // Priority counts
  const priorityCount = { HIGH: 0, MEDIUM: 0, LOW: 0 };
  
  Object.values(aiMeta).forEach(meta => {
    // Tasks
    let tasks = meta.tasks;
    if (typeof tasks === 'string') {
      try {
        tasks = JSON.parse(tasks);
      } catch (e) {
        tasks = [];
      }
    }
    
    if (tasks && Array.isArray(tasks)) {
      tasks.forEach(t => {
        if (t.done) completedTasks++;
        else pendingTasks++;
      });
    }
    
    // Category
    if (meta.category && meta.category !== 'Other') {
      categoryCount[meta.category] = (categoryCount[meta.category] || 0) + 1;
    }
    
    // Priority
    if (meta.priority) {
      priorityCount[meta.priority] = (priorityCount[meta.priority] || 0) + 1;
    }
  });

  const topCategory = Object.keys(categoryCount).reduce((a, b) => categoryCount[a] > categoryCount[b] ? a : b, 'None');

  const StatCard = ({ title, value, icon, color }) => (
    <div style={{
      backgroundColor: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      minWidth: '180px',
      flex: 1
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
        <span>{icon}</span>
        <span>{title}</span>
      </div>
      <div style={{ fontSize: '32px', fontWeight: 'bold', color: color || '#fff' }}>
        {value}
      </div>
    </div>
  );

  return (
    <div className="dashboard-page" style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ display: 'flex', alignItems: 'center' }}><BarChart2 size={32} /></span> AI Knowledge Dashboard
        </h1>
        <button 
          onClick={() => navigate('/')}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ← Back to Notes
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '40px' }}>
        <StatCard title="Total Notes" value={totalNotes} icon={<FileText size={14} />} />
        <StatCard title="Pending Tasks" value={pendingTasks} icon={<ClipboardList size={14} />} color="#FF9500" />
        <StatCard title="Completed Tasks" value={completedTasks} icon={<CheckCircle size={14} />} color="#32CD32" />
        <StatCard title="High Priority" value={priorityCount.HIGH} icon={<AlertCircle size={14} />} color="#FF3B30" />
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '300px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', color: 'rgba(255,255,255,0.8)' }}>Top Categories</h2>
          {Object.entries(categoryCount).length > 0 ? (
            Object.entries(categoryCount).sort((a,b) => b[1] - a[1]).map(([cat, count]) => (
              <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <span style={{ fontWeight: 'bold' }}>{cat}</span>
                <span style={{ opacity: 0.8 }}>{count} note{count > 1 ? 's' : ''}</span>
              </div>
            ))
          ) : (
            <p style={{ opacity: 0.5 }}>No AI categorized notes yet.</p>
          )}
        </div>

        <div style={{ flex: 1, minWidth: '300px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', color: 'rgba(255,255,255,0.8)' }}>AI Insights</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>Most Active Topic</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{topCategory}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>AI Processed Notes</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{Object.keys(aiMeta).length} / {totalNotes}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Migrate Local Data ────────────────────────────────────── */}
      <div style={{ marginTop: '40px', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,165,0,0.3)', backgroundColor: 'rgba(255,165,0,0.05)' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', color: 'rgba(255,255,255,0.9)' }}>📦 Migrate Local Data to Cloud</h2>
        <p style={{ opacity: 0.6, fontSize: '13px', margin: '0 0 16px 0' }}>Use this once to copy notes saved on this device (IndexedDB) to your cloud account so they appear on all devices.</p>
        {migrateResult && (
          <p style={{ color: migrateResult.error ? '#FF3B30' : '#32CD32', fontSize: '14px', marginBottom: '12px' }}>
            {migrateResult.message}
          </p>
        )}
        <button
          disabled={migrating}
          onClick={async () => {
            setMigrating(true);
            setMigrateResult(null);
            try {
              // Try to open the old Dexie DB that may exist for this user
              const { Dexie } = await import('dexie');
              const userId = db?.userId || 'unknown';
              const oldDbName = `StickifyDB_${userId}`;
              const exists = await Dexie.exists(oldDbName);
              if (!exists) {
                setMigrateResult({ error: false, message: '✅ No old local data found — you are already on cloud sync!' });
                setMigrating(false);
                return;
              }
              const oldDexie = new Dexie(oldDbName);
              oldDexie.version(5).stores({
                notes: '$id, body, colors, position, template',
                canvasImages: '$id, src, position, size',
                canvasShapes: '$id, shapeId, html, position, size',
                aiMeta: '$id, title, category, priority, priorityReason, summary, tasks'
              });
              const oldNotes = await oldDexie.notes.toArray();
              let migrated = 0;
              for (const note of oldNotes) {
                const { $id, ...payload } = note;
                try {
                  await db.notes.create(payload, $id);
                  migrated++;
                } catch (_) { /* skip duplicates */ }
              }
              setMigrateResult({ error: false, message: `✅ Successfully migrated ${migrated} note(s) to cloud!` });
            } catch (err) {
              console.error('Migration error', err);
              setMigrateResult({ error: true, message: `❌ Migration failed: ${err.message}` });
            }
            setMigrating(false);
          }}
          style={{
            background: migrating ? 'rgba(255,165,0,0.2)' : 'rgba(255,165,0,0.25)',
            border: '1px solid rgba(255,165,0,0.5)',
            color: '#FFD700',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: migrating ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CloudUpload size={16} />
          {migrating ? 'Migrating...' : 'Migrate Local Notes to Cloud'}
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
