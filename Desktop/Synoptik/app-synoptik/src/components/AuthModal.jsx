// src/components/AuthModal.jsx
import React, { useState } from 'react';
import { pb } from '../services/pocketbase.js';
import { Lock, Mail, User, Phone, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

export default function AuthModal({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const formatPocketBaseError = (err) => {
    if (!err) return 'Une erreur inattendue est survenue.';
    const data = err.data?.data;
    if (data?.email) {
      if (data.email.code === 'validation_not_unique') return 'Cette adresse email est déjà utilisée.';
      return 'Adresse email invalide.';
    }
    if (data?.passwordConfirm) return 'Les mots de passe ne correspondent pas.';
    if (data?.password) return 'Le mot de passe doit faire au moins 8 caractères.';
    if (err.status === 400 || err.status === 404) {
      return isRegister
        ? 'Données de formulaire invalides. Vérifie les champs obligatoires.'
        : 'Identifiants incorrects : email introuvable ou mot de passe erroné.';
    }
    return err.message || 'Erreur de connexion au serveur.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!firstName.trim()) {
          setErrorMessage('Le prénom est obligatoire.');
          setLoading(false);
          return;
        }
        if (password !== passwordConfirm) {
          setErrorMessage('Les mots de passe ne sont pas identiques.');
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append('email', email.trim());
        formData.append('password', password);
        formData.append('passwordConfirm', passwordConfirm);
        formData.append('name', `${firstName.trim()} ${lastName.trim()}`.trim());
        formData.append('firstName', firstName.trim());
        formData.append('lastName', lastName.trim());
        formData.append('phone', phone.trim());

        await pb.collection('users').create(formData);
        const authData = await pb.collection('users').authWithPassword(email.trim(), password);
        onLoginSuccess(authData.record);
      } else {
        const authData = await pb.collection('users').authWithPassword(email.trim(), password);
        onLoginSuccess(authData.record);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(formatPocketBaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#0d0f12',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#15171d',
        border: '1px solid #282b36',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.7)',
        color: '#fff'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            background: '#2563eb20',
            border: '1px solid #2563eb50',
            borderRadius: '10px',
            marginBottom: '10px'
          }}>
            <Lock size={20} color="#38bdf8" />
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#f3f4f6' }}>SynopTik</h1>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0 0 0' }}>
            {isRegister ? 'Créer un profil régisseur' : 'Accéder à votre espace de travail'}
          </p>
        </div>

        {errorMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ef444420',
            border: '1px solid #ef444450',
            borderRadius: '6px',
            padding: '10px 12px',
            marginBottom: '18px',
            color: '#fca5a5',
            fontSize: '11px',
            lineHeight: 1.4
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {isRegister && (
            <>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>
                    Prénom <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={13} style={{ position: 'absolute', left: '10px', top: '10px', color: '#6b7280' }} />
                    <input
                      type="text"
                      required
                      placeholder="Timéo"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px 8px 30px',
                        background: '#1d1f27',
                        border: '1px solid #2e323e',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '12px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Nom</label>
                  <input
                    type="text"
                    placeholder="Binda"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: '#1d1f27',
                      border: '1px solid #2e323e',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '12px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Téléphone (pour le cartouche)</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={13} style={{ position: 'absolute', left: '10px', top: '10px', color: '#6b7280' }} />
                  <input
                    type="tel"
                    placeholder="+33 6 12 34 56 78"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px 8px 30px',
                      background: '#1d1f27',
                      border: '1px solid #2e323e',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '12px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>
              Adresse Email <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={13} style={{ position: 'absolute', left: '10px', top: '10px', color: '#6b7280' }} />
              <input
                type="email"
                required
                placeholder="nom@exemple.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px 8px 30px',
                  background: '#1d1f27',
                  border: '1px solid #2e323e',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>
              Mot de passe <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={13} style={{ position: 'absolute', left: '10px', top: '10px', color: '#6b7280' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px 8px 30px',
                  background: '#1d1f27',
                  border: '1px solid #2e323e',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>
                Confirmer le mot de passe <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <ShieldCheck size={13} style={{ position: 'absolute', left: '10px', top: '10px', color: '#6b7280' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px 8px 30px',
                    background: '#1d1f27',
                    border: '1px solid #2e323e',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              padding: '10px',
              background: '#2563eb',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Chargement...' : isRegister ? 'Créer mon compte' : 'Se connecter'}
            {!loading && <ArrowRight size={14} />}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '11px', color: '#9ca3af' }}>
          {isRegister ? 'Vous avez déjà un compte ? ' : "Pas encore d'identifiant ? "}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMessage('');
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#38bdf8',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isRegister ? 'Se connecter' : "S'inscrire"}
          </button>
        </div>
      </div>
    </div>
  );
}