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

      </div>
  );
};

export default DashboardPage;
