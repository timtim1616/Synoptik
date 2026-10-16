// src/components/Logo.jsx
import React from 'react';

export default function Logo({ size = 20, showText = false }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', userSelect: 'none' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="logoStrokeGrad" x1="8" y1="10" x2="24" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>

        <path
          d="M 9 11 H 16 V 21 H 23"
          stroke="url(#logoStrokeGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle cx="9" cy="11" r="3.2" fill="#161820" stroke="#38bdf8" strokeWidth="1.3" />
        <circle cx="9" cy="11" r="1.3" fill="#38bdf8" />

        <circle cx="16" cy="16" r="1.5" fill="#60a5fa" />

        <circle cx="23" cy="21" r="3.2" fill="#161820" stroke="#818cf8" strokeWidth="1.3" />
        <circle cx="23" cy="21" r="1.3" fill="#818cf8" />
      </svg>

      {showText && (
        <span style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '-0.3px', color: '#f3f4f6' }}>
          Synop<span style={{ color: '#38bdf8' }}>Tik</span>
        </span>
      )}
    </div>
  );
}