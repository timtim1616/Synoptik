// src/components/Dashboard.jsx
import React, { useState } from 'react';
import { Plus, Folder, Copy, Trash2, LogOut, Calendar, MapPin, Camera, X } from 'lucide-react';
import { pb } from '../services/pocketbase.js';
import Logo from './Logo.jsx';

export default function Dashboard({
  projects = [],
  currentUser,
  onLogout,
  onOpenProject,
  onCreateProject,
  onDuplicateProject,
  onDeleteProject,
  onUserUpdated
}) {
  const [newTitle, setNewTitle] = useState('');
  const [showAccountModal, setShowAccountModal] = useState(false);

  // Édition profil utilisateur
  const [editFirstName, setEditFirstName] = useState(currentUser?.firstName || '');
  const [editLastName, setEditLastName] = useState(currentUser?.lastName || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  const getGreetingMessage = () => {
    const hour = new Date().getHours();
    const name = currentUser?.firstName || currentUser?.name?.split(' ')[0] || 'Régisseur';

    if (hour >= 23 || hour < 5) return `Va te coucher ${name}, le show commence demain ! 🌙`;
    if (hour >= 5 && hour < 12) return `Bonjour ${name}, prêt pour le montage ? ☕`;
    if (hour >= 12 && hour < 18) return `Bon après-midi ${name}, on câble quoi aujourd'hui ? ⚡`;
    return `Bonsoir ${name}, on boucle le synoptique de la régie ? 🎬`;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const formData = new FormData();
      formData.append('firstName', editFirstName.trim());
      formData.append('lastName', editLastName.trim());
      formData.append('name', `${editFirstName.trim()} ${editLastName.trim()}`.trim());
      formData.append('phone', editPhone.trim());
      if (avatarFile) formData.append('avatar', avatarFile);

      const updated = await pb.collection('users').update(currentUser.id, formData);
      if (onUserUpdated) onUserUpdated(updated);
      setShowAccountModal(false);
    } catch (err) {
      alert(`Erreur de mise à jour : ${err.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateProject(newTitle.trim());
    setNewTitle('');
  };

  const avatarUrl = currentUser?.avatar
    ? pb.files.getURL(currentUser, currentUser.avatar)
    : null;

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0e1014', color: '#fff', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        height: '56px',
        borderBottom: '1px solid #232630',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#13151b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Logo size={24} />
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#f3f4f6', letterSpacing: '0.5px' }}>
            Synop<span style={{ color: '#38bdf8' }}>Tik</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => {
              setEditFirstName(currentUser?.firstName || '');
              setEditLastName(currentUser?.lastName || '');
              setEditPhone(currentUser?.phone || '');
              setShowAccountModal(true);
            }}
            style={{
              background: '#1e212a',
              border: '1px solid #2e3342',
              borderRadius: '20px',
              padding: '4px 12px 4px 6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              color: '#d1d5db'
            }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                {(currentUser?.firstName?.[0] || currentUser?.email?.[0] || 'U').toUpperCase()}
              </div>
            )}
            <span style={{ fontSize: '11px', fontWeight: 600 }}>
              {currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : currentUser?.email}
            </span>
          </button>

          <button
            onClick={onLogout}
            title="Se déconnecter"
            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '36px 40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#f3f4f6' }}>
            {getGreetingMessage()}
          </h2>
          <p style={{ fontSize: '13px', color: '#9ca3af', margin: '6px 0 0 0' }}>
            Gérez vos synoptiques broadcast, générez vos schémas et téléchargez vos fiches techniques.
          </p>
        </div>

        <div style={{
          background: '#161820',
          border: '1px solid #282c38',
          borderRadius: '10px',
          padding: '18px 24px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <input
            type="text"
            placeholder="Nom du nouveau synoptique (ex: Captation Festival Main Stage, Régie B...)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate(e)}
            style={{
              flex: 1,
              padding: '10px 14px',
              background: '#1e212b',
              border: '1px solid #313645',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '12px',
              outline: 'none'
            }}
          />
          <button
            onClick={handleCreate}
            style={{
              background: '#2563eb',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 18px',
              color: '#fff',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={15} /> Nouveau synoptique
          </button>
        </div>

        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
            Mes Projets ({projects.length})
          </h3>

          {projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed #2b303e', borderRadius: '10px', color: '#6b7280' }}>
              Aucun projet pour le moment. Créez votre premier synoptique ci-dessus !
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {projects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onOpenProject(p.id)}
                  style={{
                    background: '#161820',
                    border: '1px solid #282c38',
                    borderRadius: '8px',
                    padding: '18px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px',
                    transition: 'border-color 0.15s ease'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Folder size={18} color="#38bdf8" />
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#f3f4f6' }}>{p.title}</h4>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: '#9ca3af' }}>
                      {p.eventDate && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Calendar size={12} color="#6b7280" />
                          <span>Presta : {p.eventDate}</span>
                        </div>
                      )}
                      {p.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <MapPin size={12} color="#6b7280" />
                          <span>Lieu : {p.location}</span>
                        </div>
                      )}
                      <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>
                        Version {p.version || 'v1.0'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', borderTop: '1px solid #242733', paddingTop: '10px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateProject(p.id);
                      }}
                      title="Dupliquer"
                      style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }}
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(p.id);
                      }}
                      title="Supprimer"
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAccountModal && (
        <div
          onClick={() => setShowAccountModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#161820',
              border: '1px solid #2e3344',
              borderRadius: '10px',
              width: '100%',
              maxWidth: '400px',
              padding: '24px',
              color: '#fff'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Mon Compte Régisseur</h3>
              <button onClick={() => setShowAccountModal(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '6px' }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700 }}>
                    {(editFirstName?.[0] || 'U').toUpperCase()}
                  </div>
                )}
                <div>
                  <label style={{ color: '#38bdf8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                    <Camera size={13} /> Changer la photo
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => setAvatarFile(e.target.files[0])}
                    />
                  </label>
                  {avatarFile && <span style={{ fontSize: '10px', color: '#22c55e' }}>{avatarFile.name}</span>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Prénom</label>
                  <input
                    type="text"
                    required
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', background: '#20232d', border: '1px solid #333848', borderRadius: '5px', color: '#fff', outline: 'none' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Nom</label>
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', background: '#20232d', border: '1px solid #333848', borderRadius: '5px', color: '#fff', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Numéro de téléphone</label>
                <input
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', background: '#20232d', border: '1px solid #333848', borderRadius: '5px', color: '#fff', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Email (non modifiable)</label>
                <input
                  type="text"
                  disabled
                  value={currentUser?.email || ''}
                  style={{ width: '100%', padding: '7px 10px', background: '#191b22', border: '1px solid #282b36', borderRadius: '5px', color: '#6b7280', outline: 'none' }}
                />
              </div>

              <button
                type="submit"
                disabled={saveLoading}
                style={{
                  marginTop: '10px',
                  padding: '9px',
                  background: '#2563eb',
                  border: 'none',
                  borderRadius: '5px',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: saveLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {saveLoading ? 'Enregistrement...' : 'Enregistrer mon profil'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}