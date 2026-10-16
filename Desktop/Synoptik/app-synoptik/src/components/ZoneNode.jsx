// src/components/ZoneNode.jsx
import React from 'react';
import { NodeResizer } from '@xyflow/react';
import { Trash2 } from 'lucide-react';

export const ZONE_THEMES = [
  { id: 'slate', label: 'Neutre', bg: 'rgba(39, 39, 42, 0.35)', border: '#52525b', text: '#e4e4e7' },
  { id: 'blue', label: 'Régie / Control', bg: 'rgba(30, 58, 138, 0.25)', border: '#3b82f6', text: '#93c5fd' },
  { id: 'purple', label: 'Plateau / Scène', bg: 'rgba(88, 28, 135, 0.25)', border: '#a855f7', text: '#d8b4fe' },
  { id: 'amber', label: 'Baie / Technique', bg: 'rgba(120, 53, 15, 0.25)', border: '#f59e0b', text: '#fcd34d' },
  { id: 'emerald', label: 'Accueil / Public', bg: 'rgba(6, 78, 59, 0.25)', border: '#10b981', text: '#6ee7b7' },
];

export default function ZoneNode({ id, data, selected }) {
  const currentTheme = ZONE_THEMES.find((t) => t.id === data.themeId) || ZONE_THEMES[0];

  return (
    <div style={{
      width: '100%',
      height: '100%',
      minWidth: '280px',
      minHeight: '180px',
      background: currentTheme.bg,
      border: `2px dashed ${selected ? '#38bdf8' : currentTheme.border}`,
      borderRadius: '12px',
      padding: '12px 16px',
      position: 'relative',
      boxSizing: 'border-box',
      pointerEvents: 'all'
    }}>
      <NodeResizer
        color="#38bdf8"
        isVisible={selected}
        minWidth={280}
        minHeight={180}
        handleStyle={{ width: 10, height: 10, borderRadius: 2 }}
      />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        userSelect: 'none',
        borderBottom: `1px solid ${currentTheme.border}`,
        paddingBottom: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: currentTheme.text, letterSpacing: '0.5px' }}>
            {data.label || 'ZONE'}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onDelete(id);
          }}
          title="Supprimer la zone"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            padding: '2px',
            opacity: 0.8
          }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}