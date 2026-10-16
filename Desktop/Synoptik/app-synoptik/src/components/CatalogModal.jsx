// src/components/CatalogModal.jsx
import React, { useState, useMemo } from 'react';
import { CATEGORIES, BRANDS, DOMAINS, getCategoryMeta, normalizeCategoryId, getDomainForCategory } from '../constants/equipment.js';
import { X, Search, Star, ExternalLink, Plus, Box } from 'lucide-react';
import { pb } from '../services/pocketbase.js';

export default function CatalogModal({
  show,
  onClose,
  equipmentList = [],
  onSelectEquipment,
  favorites = [],
  onToggleFavorite,
  onReloadEquipment,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [showCustomForm, setShowCustomForm] = useState(false);

  const [customLabel, setCustomLabel] = useState('');
  const [customBrand, setCustomBrand] = useState('Générique');
  const [customCategory, setCustomCategory] = useState('mixer');
  const [customWatts, setCustomWatts] = useState('50');
  const [customPower, setCustomPower] = useState(true);

  const filteredItems = useMemo(() => {
    if (!show) return [];
    const term = (searchTerm || '').toLowerCase().trim();

    return (equipmentList || [])
      .filter((item) => {
        if (!item || !item.label) return false;

        const itemNormCat = normalizeCategoryId(item.category);
        const itemDomain = item.domain || getDomainForCategory(itemNormCat);

        const matchesDomain = selectedDomain === 'all' || itemDomain === selectedDomain;
        const matchesCategory = selectedCategory === 'all' || itemNormCat === selectedCategory;

        const matchesBrand =
          selectedBrand === 'all' ||
          (item.brand && item.brand.toLowerCase() === selectedBrand.toLowerCase()) ||
          (selectedBrand === 'Autre' && !item.brand);

        const matchesSearch =
          term === '' ||
          item.label.toLowerCase().includes(term) ||
          (item.brand && item.brand.toLowerCase().includes(term));

        return matchesDomain && matchesCategory && matchesBrand && matchesSearch;
      })
      .sort((a, b) => {
        const isFavA = favorites.includes(a.id || a.label);
        const isFavB = favorites.includes(b.id || b.label);
        if (isFavA && !isFavB) return -1;
        if (!isFavA && isFavB) return 1;
        return (a.label || '').localeCompare(b.label || '');
      });
  }, [equipmentList, selectedDomain, selectedCategory, selectedBrand, searchTerm, favorites, show]);

  if (!show) return null;

  const handleCreateCustom = async (e) => {
    e.preventDefault();
    if (!customLabel.trim()) return;

    try {
      const currentUserId = pb.authStore.model?.id || '';
      const payload = {
        label: customLabel.trim(),
        brand: customBrand,
        category: customCategory,
        domain: getDomainForCategory(customCategory),
        power: customPower,
        powerWatts: String(customWatts),
        location: 'Régie',
        user: currentUserId,
        inputs: [{ id: `in_${Date.now()}`, name: 'In 1', type: 'SDI', connector: 'BNC', visible: true }],
        outputs: [{ id: `out_${Date.now()}`, name: 'Out 1', type: 'SDI', connector: 'BNC', visible: true }],
      };

      await pb.collection('equipment').create(payload);
      setShowCustomForm(false);
      setCustomLabel('');
      if (onReloadEquipment) onReloadEquipment();
    } catch (err) {
      alert(`Erreur création : ${err.message}`);
    }
  };

  // Recherche simple : Marque + Modèle uniquement
  const openGoogleSearch = (e, item) => {
    e.stopPropagation();
    const query = encodeURIComponent(`${item.brand || ''} ${item.label}`.trim());
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '24px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#16181d',
          border: '1px solid #2e323d',
          borderRadius: '10px',
          width: '100%',
          maxWidth: '1020px',
          height: '82vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8)',
          overflow: 'hidden',
          color: '#fff'
        }}
      >
        {/* Entête */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid #262933',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#121316'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#f3f4f6' }}>
              Bibliothèque Complète
            </h2>
            <span style={{ fontSize: '11px', background: '#22252e', color: '#9ca3af', padding: '2px 8px', borderRadius: '10px' }}>
              {filteredItems.length} appareils
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowCustomForm(true)}
              style={{
                background: '#2563eb',
                border: 'none',
                borderRadius: '5px',
                padding: '6px 12px',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Plus size={13} /> Appareil sur-mesure
            </button>
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Filtre Domaine (onglets horizontaux) */}
        <div style={{ display: 'flex', gap: '4px', padding: '8px 20px', background: '#14161b', borderBottom: '1px solid #23252d' }}>
          {DOMAINS.map((dom) => (
            <button
              key={dom.id}
              onClick={() => {
                setSelectedDomain(dom.id);
                setSelectedCategory('all');
              }}
              style={{
                background: selectedDomain === dom.id ? '#2563eb' : '#1e2028',
                color: selectedDomain === dom.id ? '#fff' : '#9ca3af',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: selectedDomain === dom.id ? 600 : 400,
                cursor: 'pointer'
              }}
            >
              {dom.label}
            </button>
          ))}
        </div>

        {/* Barre de filtres Marque + Catégorie + Recherche */}
        <div style={{
          padding: '10px 20px',
          background: '#191b22',
          borderBottom: '1px solid #262933',
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: '#6b7280' }} />
            <input
              type="text"
              autoFocus
              placeholder="Rechercher par nom, marque..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 30px',
                background: '#20222a',
                border: '1px solid #333644',
                borderRadius: '5px',
                color: '#fff',
                fontSize: '11px',
                outline: 'none'
              }}
            />
          </div>

          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            style={{
              padding: '6px 8px',
              background: '#20222a',
              border: '1px solid #333644',
              borderRadius: '5px',
              color: '#d1d5db',
              fontSize: '11px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">Toutes les marques</option>
            {BRANDS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '6px 8px',
              background: '#20222a',
              border: '1px solid #333644',
              borderRadius: '5px',
              color: '#d1d5db',
              fontSize: '11px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {CATEGORIES.filter((c) => selectedDomain === 'all' || c.domain === 'all' || c.domain === selectedDomain).map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Grille */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#6b7280', fontSize: '12px' }}>
              Aucun matériel trouvé pour cette sélection.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '12px'
            }}>
              {filteredItems.map((item) => {
                const meta = getCategoryMeta(item.category);
                const IconComponent = meta.icon || Box;
                const isFav = favorites.includes(item.id || item.label);

                return (
                  <div
                    key={item.id || item.label}
                    onClick={() => {
                      onSelectEquipment(item);
                      onClose();
                    }}
                    style={{
                      background: '#1d1f27',
                      border: `1px solid ${isFav ? '#f59e0b50' : '#2b2e3a'}`,
                      borderLeft: `4px solid ${meta.color}`,
                      borderRadius: '6px',
                      padding: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          background: `${meta.color}20`,
                          padding: '4px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <IconComponent size={13} color={meta.color} />
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#f3f4f6' }}>{item.label}</div>
                          <div style={{ fontSize: '10px', color: '#9ca3af' }}>{item.brand || 'Générique'} • {meta.label}</div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(item.id || item.label);
                        }}
                        style={{ background: 'transparent', border: 'none', color: isFav ? '#f59e0b' : '#4b5563', cursor: 'pointer', padding: '2px' }}
                      >
                        <Star size={14} fill={isFav ? '#f59e0b' : 'none'} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#9ca3af', paddingTop: '6px', borderTop: '1px solid #282a35' }}>
                      <span>{(item.inputs || []).length} In · {(item.outputs || []).length} Out</span>
                      <button
                        onClick={(e) => openGoogleSearch(e, item)}
                        title={`Rechercher ${item.brand || ''} ${item.label}`}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#38bdf8',
                          fontSize: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <ExternalLink size={11} /> Google
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Formulaire privé */}
      {showCustomForm && (
        <div
          onClick={() => setShowCustomForm(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#18191e',
              border: '1px solid #333642',
              borderRadius: '8px',
              width: '360px',
              padding: '20px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', margin: 0 }}>Créer un appareil privé</h3>
              <button onClick={() => setShowCustomForm(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateCustom} style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
              <div>
                <label style={{ color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Nom du modèle</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Switch Luminex GigaCore"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  style={{ width: '100%', padding: '7px', background: '#22242c', border: '1px solid #333642', borderRadius: '4px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Marque</label>
                <input
                  type="text"
                  placeholder="ex: Luminex"
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  style={{ width: '100%', padding: '7px', background: '#22242c', border: '1px solid #333642', borderRadius: '4px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Catégorie</label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  style={{ width: '100%', padding: '7px', background: '#22242c', border: '1px solid #333642', borderRadius: '4px', color: '#fff' }}
                >
                  {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Watts</label>
                  <input
                    type="number"
                    value={customWatts}
                    onChange={(e) => setCustomWatts(e.target.value)}
                    style={{ width: '100%', padding: '7px', background: '#22242c', border: '1px solid #333642', borderRadius: '4px', color: '#fff' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '18px' }}>
                  <input
                    type="checkbox"
                    id="chk230"
                    checked={customPower}
                    onChange={(e) => setCustomPower(e.target.checked)}
                  />
                  <label htmlFor="chk230" style={{ color: '#d1d5db', cursor: 'pointer' }}>230V</label>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '10px',
                  padding: '8px',
                  background: '#2563eb',
                  border: 'none',
                  borderRadius: '5px',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Enregistrer dans ma base
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}