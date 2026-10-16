// src/components/DeviceNode.jsx
import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { SIGNAL_COLORS, getCategoryMeta, normalizeCategoryId } from '../constants/equipment.js';
import { Box } from 'lucide-react';

const CATEGORY_DEFAULT_WIDTHS = {
  converter: 190,
  audio_mic: 190,
  intercom_beltpack: 190,
  camera: 230,
  camera_ptz: 230,
  display_tv: 250,
  display_led: 260,
  it_server: 260,
  it_router: 240,
  recorder: 250,
  controller: 250,
  power_distro: 240,
  power_ups: 240,
  mixer: 290,
  audio_console: 290,
  audio_stagebox: 280,
  grid: 290,
  network: 290,
  other: 220,
};

export const isBiPort = (p) => {
  if (!p) return false;
  if (p.isBiDirectional || p.direction === 'bidirectional') return true;
  const t = (p.type || '').toUpperCase();
  return (
    t === 'RJ45' ||
    t === 'USB' ||
    t === 'USB-C' ||
    t === 'TYPE-C' ||
    t === 'DANTE' ||
    t === 'ETHERNET'
  );
};

export default function DeviceNode({ data, selected }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const normalizedCat = normalizeCategoryId(data?.category);
  const meta = getCategoryMeta(normalizedCat);
  const IconComponent = meta?.icon || Box;

  // 1. Ports explicitement dans la catégorie 'bidirectional'
  const directBiPorts = (data?.bidirectional || []).filter((p) => p && p.visible !== false);

  // 2. Ports de rétrocompatibilité (si anciens nœuds avaient du RJ45/USB dans inputs/outputs)
  const legacyBiInputs = (data?.inputs || []).filter((p) => p && p.visible !== false && isBiPort(p));
  const legacyBiOutputs = (data?.outputs || []).filter((p) => p && p.visible !== false && isBiPort(p));

  // Fusion et déduplication des ports de la face inférieure
  const seenIds = new Set();
  const bottomPorts = [];
  [...directBiPorts, ...legacyBiInputs, ...legacyBiOutputs].forEach((p) => {
    const baseId = p.id.replace('_dup', '');
    if (!seenIds.has(baseId)) {
      seenIds.add(baseId);
      bottomPorts.push({ ...p, id: baseId });
    }
  });

  // Ports latéraux stricts (uniquement entrées/sorties unilatérales)
  const sideInputs = (data?.inputs || []).filter((p) => p && p.visible !== false && !isBiPort(p));
  const sideOutputs = (data?.outputs || []).filter((p) => p && p.visible !== false && !isBiPort(p));

  const baseCategoryWidth = CATEGORY_DEFAULT_WIDTHS[normalizedCat] || 220;
  const bottomPortsRequiredWidth = bottomPorts.length <= 2 ? 0 : bottomPorts.length * 36 + 40;
  const finalWidth = Math.max(baseCategoryWidth, bottomPortsRequiredWidth);

  const count = bottomPorts.length;
  const isDense = count >= 3;
  const bottomHeight = isDense ? 42 : 26;

  const formatShortLabel = (name = '') => {
    if (!name) return '';
    return name
      .replace(/Ethernet Gigabit/i, 'LAN')
      .replace(/Ethernet/i, 'LAN')
      .replace(/USB-A/i, 'USB')
      .replace(/USB-C/i, 'USB-C')
      .replace(/Gen\s*[12]/i, '')
      .replace(/\(Right\)|\(Left\)/gi, '')
      .trim();
  };

  const fullLabel = data?.label || 'Appareil';
  const charLimit = finalWidth <= 200 ? 18 : finalWidth <= 240 ? 23 : 30;
  const isLong = fullLabel.length > charLimit;
  const displayLabel = !isLong || isExpanded
    ? fullLabel
    : `${fullLabel.slice(0, charLimit - 5)} (....)`;

  const titleFontSize = fullLabel.length > 22 ? '11px' : '12px';
  const isPoEPowered = data?.poeStatus?.powered;
  const poeLevel = data?.poeStatus?.level;

  return (
    <div style={{
      background: '#18191d',
      border: `2px solid ${selected ? '#38bdf8' : '#2e313a'}`,
      borderRadius: '8px',
      width: `${finalWidth}px`,
      boxSizing: 'border-box',
      color: '#fff',
      boxShadow: selected ? '0 0 0 3px rgba(56, 189, 248, 0.4), 0 8px 24px rgba(0,0,0,0.6)' : '0 8px 24px rgba(0,0,0,0.5)',
      fontSize: '11px',
      userSelect: 'none',
      position: 'relative',
      overflow: 'visible',
      paddingBottom: count > 0 ? `${bottomHeight + 4}px` : '0px'
    }}>
      {/* Bordure haute colorée permanente */}
      <div style={{
        position: 'absolute',
        top: '-2px',
        left: '-2px',
        right: '-2px',
        height: '5px',
        background: meta.color || '#38bdf8',
        borderTopLeftRadius: '7px',
        borderTopRightRadius: '7px',
        zIndex: 1
      }} />

      {/* En-tête */}
      <div style={{
        background: '#131417',
        padding: '10px 10px 7px 10px',
        borderBottom: '1px solid #282a33',
        borderTopLeftRadius: '6px',
        borderTopRightRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flex: 1, minWidth: 0 }}>
          <div style={{
            background: `${meta.color}20`,
            border: `1px solid ${meta.color}40`,
            borderRadius: '4px',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <IconComponent size={13} color={meta.color} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
            <span
              onClick={(e) => {
                if (isLong) {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }
              }}
              title={isLong ? (isExpanded ? 'Cliquer pour réduire' : `Nom complet : ${fullLabel}`) : undefined}
              style={{
                fontWeight: 700,
                fontSize: titleFontSize,
                color: '#f3f4f6',
                cursor: isLong ? 'pointer' : 'default',
                whiteSpace: isExpanded ? 'normal' : 'nowrap',
                wordBreak: isExpanded ? 'break-word' : 'normal',
                lineHeight: 1.2
              }}
            >
              {displayLabel}
            </span>

            {(data?.role || data?.ip) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1px' }}>
                {data?.role && (
                  <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {data.role}
                  </span>
                )}
                {data?.role && data?.ip && (
                  <span style={{ fontSize: '9px', color: '#4b5563' }}>•</span>
                )}
                {data?.ip && (
                  <span style={{ fontSize: '9px', color: '#06b6d4', fontFamily: 'monospace' }}>
                    {data.ip}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          {data?.location && (
            <span style={{ fontSize: '9px', color: '#9ca3af', background: '#1f2128', padding: '1px 4px', borderRadius: '3px' }}>
              {data.location}
            </span>
          )}

          {isPoEPowered ? (
            <span
              title={`Alimenté en réseau via ${poeLevel?.toUpperCase()} (prise 230V désactivée)`}
              style={{
                fontSize: '9px',
                fontWeight: 700,
                color: '#22c55e',
                background: '#22c55e20',
                border: '1px solid #22c55e60',
                padding: '1px 4px',
                borderRadius: '3px'
              }}
            >
              ⚡ {poeLevel?.toUpperCase()}
            </span>
          ) : data?.power ? (
            <span title="Alimentation secteur 230V requise" style={{ color: '#ef4444', fontSize: '11px', fontWeight: 'bold' }}>
              ⚡
            </span>
          ) : null}
        </div>
      </div>

      {/* Ports latéraux (In gauche et Out droite) */}
      <div style={{ display: 'flex', padding: '8px 0', minHeight: '32px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
          {sideInputs.map((port) => (
            <div key={port.id} style={{ position: 'relative', paddingLeft: '14px', height: '18px', display: 'flex', alignItems: 'center' }}>
              <Handle
                type="target"
                position={Position.Left}
                id={port.id}
                style={{
                  background: SIGNAL_COLORS[port.type] || '#fff',
                  width: '9px',
                  height: '9px',
                  left: '-6px',
                  borderRadius: '3px',
                  border: '1px solid #111',
                  zIndex: 10
                }}
              />
              <span style={{ fontSize: '10px', color: '#d1d5db', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {port.name}
              </span>
            </div>
          ))}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end', minWidth: 0 }}>
          {sideOutputs.map((port) => (
            <div key={port.id} style={{ position: 'relative', paddingRight: '14px', height: '18px', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', color: '#d1d5db', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {port.name}
              </span>
              <Handle
                type="source"
                position={Position.Right}
                id={port.id}
                style={{
                  background: SIGNAL_COLORS[port.type] || '#fff',
                  width: '9px',
                  height: '9px',
                  right: '-6px',
                  borderRadius: '3px',
                  border: '1px solid #111',
                  zIndex: 10
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Ports inférieurs (RJ45, USB, USB-C, SSD) */}
      {count > 0 && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: `${bottomHeight}px`,
          borderTop: '1px solid #232630',
          background: '#121316',
          borderBottomLeftRadius: '6px',
          borderBottomRightRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0 8px',
          boxSizing: 'border-box'
        }}>
          {bottomPorts.map((port, idx) => {
            const leftPercent = ((idx + 0.5) / count) * 100;
            const shortLabel = formatShortLabel(port.name);
            const portColor = SIGNAL_COLORS[port.type] || (port.type === 'USB-C' ? '#f97316' : '#059669');

            return (
              <div
                key={port.id}
                title={`${port.name} (${port.type})`}
                style={{
                  position: 'absolute',
                  left: `${leftPercent}%`,
                  bottom: 0,
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end',
                  paddingBottom: '5px'
                }}
              >
                <span style={{
                  fontSize: '9px',
                  fontWeight: 600,
                  color: '#9ca3af',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  writingMode: isDense ? 'vertical-rl' : 'horizontal-tb',
                  transform: isDense ? 'rotate(180deg)' : 'none',
                  maxHeight: isDense ? '30px' : 'auto',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: '2px',
                  opacity: 0.9
                }}>
                  {shortLabel}
                </span>

                {/* Poignée Target pour recevoir un câble */}
                <Handle
                  type="target"
                  position={Position.Bottom}
                  id={port.id}
                  style={{
                    position: 'static',
                    transform: 'none',
                    background: portColor,
                    width: '9px',
                    height: '9px',
                    borderRadius: '2px',
                    border: '1px solid #111',
                    zIndex: 10,
                    marginBottom: '-4px'
                  }}
                />

                {/* Poignée Source superposée pour tirer un câble */}
                <Handle
                  type="source"
                  position={Position.Bottom}
                  id={`${port.id}_src`}
                  style={{
                    position: 'absolute',
                    bottom: '-6px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'transparent',
                    width: '13px',
                    height: '13px',
                    borderRadius: '50%',
                    border: 'none',
                    zIndex: 9
                  }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}