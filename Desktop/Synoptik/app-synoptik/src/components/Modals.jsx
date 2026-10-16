// src/components/Modals.jsx
import React, { useMemo } from 'react';
import { X, Download, Cable, Box, Zap, Plug, AlertTriangle } from 'lucide-react';
import { getCategoryMeta, SIGNAL_COLORS } from '../constants/equipment.js';

export function ProjectModal({ show, onClose, data, onChange }) {
  if (!show) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#161820',
          border: '1px solid #2f3444',
          borderRadius: '10px',
          width: '420px',
          padding: '24px',
          color: '#fff'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Paramètres du Projet</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '11px' }}>
          <div>
            <label style={{ color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Titre du synoptique</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => onChange('title', e.target.value)}
              style={{ width: '100%', padding: '7px 10px', background: '#20232d', border: '1px solid #333848', borderRadius: '5px', color: '#fff', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Indice de version</label>
              <input
                type="text"
                placeholder="v1.0"
                value={data.version || ''}
                onChange={(e) => onChange('version', e.target.value)}
                style={{ width: '100%', padding: '7px 10px', background: '#20232d', border: '1px solid #333848', borderRadius: '5px', color: '#fff', outline: 'none' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Date de la prestation</label>
              <input
                type="text"
                placeholder="JJ/MM/AAAA"
                value={data.eventDate || ''}
                onChange={(e) => onChange('eventDate', e.target.value)}
                style={{ width: '100%', padding: '7px 10px', background: '#20232d', border: '1px solid #333848', borderRadius: '5px', color: '#fff', outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <label style={{ color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Lieu de la prestation</label>
            <input
              type="text"
              placeholder="ex: Zénith de Paris, Studio Régie 3..."
              value={data.location || ''}
              onChange={(e) => onChange('location', e.target.value)}
              style={{ width: '100%', padding: '7px 10px', background: '#20232d', border: '1px solid #333848', borderRadius: '5px', color: '#fff', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Auteur / Régisseur responsable</label>
            <input
              type="text"
              value={data.author || ''}
              onChange={(e) => onChange('author', e.target.value)}
              style={{ width: '100%', padding: '7px 10px', background: '#20232d', border: '1px solid #333848', borderRadius: '5px', color: '#fff', outline: 'none' }}
            />
          </div>

          <button
            onClick={onClose}
            style={{
              marginTop: '10px',
              padding: '9px',
              background: '#2563eb',
              border: 'none',
              borderRadius: '5px',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

export function ExportModal({ show, onClose, config, onConfigChange, onExecute, isExporting }) {
  if (!show) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#161820',
          border: '1px solid #2f3444',
          borderRadius: '10px',
          width: '380px',
          padding: '24px',
          color: '#fff'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Exporter le Synoptique</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '11px' }}>
          <div>
            <label style={{ color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Format</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => onConfigChange('format', 'pdf')}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: config.format === 'pdf' ? '#2563eb' : '#20232d',
                  border: '1px solid #333848',
                  borderRadius: '5px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                PDF (A4 Paysage)
              </button>
              <button
                onClick={() => onConfigChange('format', 'png')}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: config.format === 'png' ? '#2563eb' : '#20232d',
                  border: '1px solid #333848',
                  borderRadius: '5px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Image PNG
              </button>
            </div>
          </div>

          <div>
            <label style={{ color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Thème</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => onConfigChange('theme', 'dark')}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: config.theme === 'dark' ? '#2563eb' : '#20232d',
                  border: '1px solid #333848',
                  borderRadius: '5px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Foncé (Régie)
              </button>
              <button
                onClick={() => onConfigChange('theme', 'light')}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: config.theme === 'light' ? '#2563eb' : '#20232d',
                  border: '1px solid #333848',
                  borderRadius: '5px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Blanc (Impression)
              </button>
            </div>
          </div>

          {config.format === 'pdf' && (
            <div style={{ background: '#1c1f28', padding: '10px 12px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.includeCartouche}
                  onChange={(e) => onConfigChange('includeCartouche', e.target.checked)}
                />
                <span>Afficher le cartouche normalisé</span>
              </label>

              {config.includeCartouche && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', paddingLeft: '22px' }}>
                  <input
                    type="checkbox"
                    checked={config.includeContact}
                    onChange={(e) => onConfigChange('includeContact', e.target.checked)}
                  />
                  <span style={{ color: '#9ca3af' }}>Inclure coordonnées (Nom & Tél)</span>
                </label>
              )}
            </div>
          )}

          <button
            onClick={onExecute}
            disabled={isExporting}
            style={{
              marginTop: '6px',
              padding: '10px',
              background: '#2563eb',
              border: 'none',
              borderRadius: '5px',
              color: '#fff',
              fontWeight: 700,
              cursor: isExporting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Download size={14} />
            {isExporting ? 'Génération du fichier...' : 'Télécharger'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function EquipmentListModal({ show, onClose, nodes = [], edges = [], projectTitle }) {
  if (!show) return null;

  const devices = useMemo(() => {
    return (nodes || []).filter((n) => n.type === 'device');
  }, [nodes]);

  const totalWatts = useMemo(() => {
    return devices.reduce((sum, d) => sum + (parseFloat(d.data?.powerWatts) || 0), 0);
  }, [devices]);

  const totalPowerUnits = useMemo(() => {
    return devices.filter((d) => d.data?.power).length;
  }, [devices]);

  const groupedDevices = useMemo(() => {
    const groups = {};

    devices.forEach((d) => {
      const meta = getCategoryMeta(d.data?.category);
      const catKey = meta.id;

      if (!groups[catKey]) {
        groups[catKey] = {
          meta,
          items: [],
        };
      }
      groups[catKey].items.push(d);
    });

    return Object.values(groups);
  }, [devices]);

  const groupedCables = useMemo(() => {
    const cableMap = {};

    (edges || []).forEach((e) => {
      const source = e.data?.sourceType || 'Inconnu';
      const target = e.data?.targetType || 'Inconnu';
      const isMismatch = source !== target && source !== 'Inconnu' && target !== 'Inconnu';

      const label = isMismatch ? `${source} ➔ ${target}` : source;
      const length = e.data?.length && e.data?.length !== 'Non spécifié' ? e.data.length : null;
      const key = `${label}__${length || 'Non spécifié'}`;

      if (!cableMap[key]) {
        cableMap[key] = {
          label,
          sourceType: source,
          targetType: target,
          isMismatch,
          length,
          count: 0,
        };
      }
      cableMap[key].count += 1;
    });

    return Object.values(cableMap).sort((a, b) => a.label.localeCompare(b.label));
  }, [edges]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#161820',
          border: '1px solid #2f3444',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '780px',
          height: '84vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px rgba(0,0,0,0.8)',
          color: '#fff',
          overflow: 'hidden'
        }}
      >
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #282c38',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#13151b'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#f3f4f6' }}>
              Bilan Matériel, Câbles & Puissance
            </h3>
            <span style={{ fontSize: '11px', color: '#9ca3af' }}>{projectTitle}</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '14px' }}>
            <div style={{
              flex: 1,
              background: '#1c1f28',
              border: '1px solid #2f3446',
              borderLeft: '4px solid #f59e0b',
              padding: '12px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>
                  Consommation Électrique Totale
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#fbbf24', marginTop: '2px' }}>
                  {totalWatts} W
                </div>
              </div>
              <Zap size={24} color="#f59e0b" style={{ opacity: 0.8 }} />
            </div>

            <div style={{
              flex: 1,
              background: '#1c1f28',
              border: '1px solid #2f3446',
              borderLeft: '4px solid #38bdf8',
              padding: '12px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>
                  Prises Secteur 230V Requises
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                  {totalPowerUnits} départs
                </div>
              </div>
              <Plug size={24} color="#38bdf8" style={{ opacity: 0.8 }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <Box size={14} color="#38bdf8" />
              <h4 style={{ margin: 0, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#d1d5db', letterSpacing: '0.5px' }}>
                Appareils & Modules ({devices.length})
              </h4>
            </div>

            {groupedDevices.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', background: '#1c1f28', borderRadius: '6px', color: '#6b7280', fontSize: '11px' }}>
                Aucun équipement posé sur le synoptique.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {groupedDevices.map((group) => {
                  const IconComp = group.meta.icon || Box;

                  return (
                    <div
                      key={group.meta.id}
                      style={{
                        background: '#191b22',
                        border: '1px solid #292d3a',
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}
                    >
                      <div style={{
                        padding: '8px 12px',
                        background: '#1e212b',
                        borderBottom: '1px solid #292d3a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <IconComp size={13} color={group.meta.color} />
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#f3f4f6' }}>
                            {group.meta.label}
                          </span>
                        </div>
                        <span style={{ fontSize: '10px', color: '#9ca3af', background: '#14161d', padding: '1px 6px', borderRadius: '4px' }}>
                          {group.items.length} appareil(s)
                        </span>
                      </div>

                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                        <tbody>
                          {group.items.map((d) => (
                            <tr key={d.id} style={{ borderBottom: '1px solid #212530' }}>
                              <td style={{ padding: '7px 12px', fontWeight: 600, color: '#e5e7eb' }}>
                                {d.data?.label}
                                {d.data?.brand && (
                                  <span style={{ fontSize: '9px', color: '#9ca3af', marginLeft: '6px', textTransform: 'uppercase' }}>
                                    ({d.data.brand})
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: '7px 12px', color: '#38bdf8', fontSize: '10px' }}>
                                {d.data?.role ? `Rôle : ${d.data.role}` : '—'}
                              </td>
                              <td style={{ padding: '7px 12px', color: '#9ca3af', fontSize: '10px' }}>
                                {d.data?.location ? `📍 ${d.data.location}` : '—'}
                              </td>
                              <td style={{ padding: '7px 12px', textAlign: 'right', color: '#fbbf24', fontWeight: 600, fontSize: '10px' }}>
                                {d.data?.powerWatts ? `${d.data.powerWatts} W` : '0 W'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <Cable size={14} color="#a855f7" />
              <h4 style={{ margin: 0, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#d1d5db', letterSpacing: '0.5px' }}>
                Inventaire des Câbles ({edges.length})
              </h4>
            </div>

            {groupedCables.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', background: '#1c1f28', borderRadius: '6px', color: '#6b7280', fontSize: '11px' }}>
                Aucune liaison de câble sur le schéma.
              </div>
            ) : (
              <div style={{
                background: '#191b22',
                border: '1px solid #292d3a',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ background: '#1e212b', borderBottom: '1px solid #292d3a', color: '#9ca3af', textAlign: 'left' }}>
                      <th style={{ padding: '8px 12px' }}>Type de câble</th>
                      <th style={{ padding: '8px 12px' }}>Longueur</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Quantité</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedCables.map((cable, idx) => {
                      const sigColor = SIGNAL_COLORS[cable.sourceType] || '#94a3b8';

                      return (
                        <tr key={`${cable.label}_${cable.length}_${idx}`} style={{ borderBottom: '1px solid #212530' }}>
                          <td style={{ padding: '7px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: cable.isMismatch ? '#ef4444' : sigColor }} />
                            
                            {cable.isMismatch ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <AlertTriangle size={12} color="#f87171" />
                                <span style={{ fontWeight: 700, color: '#fca5a5' }}>{cable.label}</span>
                                <span style={{ fontSize: '9px', background: '#450a0a', color: '#f87171', border: '1px solid #ef444450', borderRadius: '3px', padding: '1px 4px' }}>
                                  Incompatible / Adaptateur requis
                                </span>
                              </div>
                            ) : (
                              <span style={{ fontWeight: 600, color: '#f3f4f6' }}>{cable.label}</span>
                            )}
                          </td>
                          <td style={{ padding: '7px 12px', color: cable.length ? '#38bdf8' : '#6b7280' }}>
                            {cable.length ? cable.length : 'Longueur libre / non spécifiée'}
                          </td>
                          <td style={{ padding: '7px 12px', textAlign: 'right', fontWeight: 700, color: '#fff' }}>
                            × {cable.count}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}