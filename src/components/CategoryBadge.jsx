import React from 'react';

const CategoryBadge = ({ category }) => {
  if (!category || category === 'Other') return null;

  const colors = {
    Shopping: '#FFD700',
    Travel: '#00CED1',
    Meeting: '#FF6347',
    College: '#4169E1',
    Projects: '#8A2BE2',
    Interview: '#32CD32',
    Personal: '#FF69B4',
    Finance: '#2E8B57',
    Ideas: '#FFA500',
    Health: '#FF4500',
    Work: '#4682B4',
    Learning: '#9370DB'
  };

  const bg = colors[category] || '#aaa';

  return (
    <div 
      className="category-badge"
      style={{
        position: 'absolute',
        top: '-12px',
        right: '10px',
        backgroundColor: bg,
        color: '#fff',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        zIndex: 10
      }}
    >
      {category}
    </div>
  );
};

export default CategoryBadge;
