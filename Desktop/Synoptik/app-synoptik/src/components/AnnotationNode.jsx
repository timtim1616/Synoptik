// src/components/AnnotationNode.jsx
import React from 'react';
import { NodeResizer } from '@xyflow/react';
import { Trash2 } from 'lucide-react';

export const NOTE_COLORS = [
  { id: 'slate', bg: '#27272a', border: '#52525b', text: '#f4f4f5' },
  { id: 'blue', bg: '#1e3a8a', border: '#3b82f6', text: '#eff6ff' },
  { id: 'green', bg: '#14532d', border: '#22c55e', text: '#f0fdf4' },
  { id: 'yellow', bg: '#713f12', border: '#eab308', text: '#fefce8' },
  { id: 'red', bg: '#7f1d1d', border: '#ef4444', text: '#fef2f2' },
];

export default function AnnotationNode({ id, data, selected }) {
  const currentColor = NOTE_COLORS.find((c) => c.id === data.colorId) || NOTE_COLORS[0];

  return (
    <div style={{
      background: currentColor.bg,
      border: `2px solid ${selected ? '#38bdf8' : currentColor.border}`,
      borderRadius: '8px',
      padding: '8px 10px',
      color: currentColor.text,
      boxShadow: selected ? '0 0 0 2px rgba(56, 189, 248, 0.4)' : '0 4px 12px rgba(0,0,0,0.3)',
      fontSize: '11px',
      width: '100%',
      height: '100%',
      minWidth: '140px',
      minHeight: '80px',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      <NodeResizer
        color="#38bdf8"
        isVisible={selected}
        minWidth={140}
        minHeight={80}
        handleStyle={{ width: 8, height: 8, borderRadius: 2 }}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onDelete(id);
          }}
          title="Supprimer la note"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            padding: '2px',
            opacity: 0.85
          }}
        >
          <Trash2 size={13} />
        </button>
      </div>

      <textarea
        placeholder="Écrire une note..."
        value={data.text || ''}
        onChange={(e) => data.onChangeText(id, e.target.value)}
        style={{
          flex: 1,
          width: '100%',
          background: 'transparent',
          border: 'none',
          color: currentColor.text,
          fontSize: '11px',
          lineHeight: '1.4',
          resize: 'none',
          outline: 'none',
          fontFamily: 'inherit',
          padding: 0,
        }}
      />
    </div>
  );
}