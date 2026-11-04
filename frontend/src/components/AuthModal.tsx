import React, { useState } from 'react';
import sleeplyLogo from '../assets/sleeply (svg).svg';
import dayRoomImg from '../assets/Rooms/Rooms FInal Version/Oficina isométrica  dia con logo Sleeply.png';
import nightRoomImg from '../assets/Rooms/Rooms FInal Version/Oficina nocturna con neón Sleeply.png';
import char0Full from '../assets/characters/char_0_full.png';
import char1Full from '../assets/characters/char_1_full.png';
import char2Full from '../assets/characters/char_2_full.png';
import char3Full from '../assets/characters/char_3_full.png';
import { api, type User } from '../services/api';
import {
  SunIcon,
  MoonIcon,
  AlertTriangleIcon,
  SparklesIcon,
  RocketIcon,
  ZapIcon,
  LockIcon,
} from './Icons';
import './AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onSuccess,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'day' | 'night'>('day');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) {
          throw new Error('Por favor ingresa tu nombre completo.');
        }
        const res = await api.register(email, password, name);
        onSuccess(res.user);
      } else {
        const res = await api.login(email, password);
        onSuccess(res.user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error en la autenticación.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('ceo@sleeply.com');
    setPassword('SecurePassword123!');
    setIsRegister(false);
    setErrorMsg(null);
  };

  return (
    <div className="auth-fullscreen-container" role="dialog" aria-modal="true">
      <div className="auth-fullscreen-wrapper">
        {/* Left Column: Visual Game Showcase */}
        <div className="auth-showcase-panel">
          <div className="auth-brand-lockup">
            <img src={sleeplyLogo} alt="Sleeply" className="auth-brand-logo-large" />
          </div>

          <p className="auth-tagline">
            Oficina Virtual Isométrica 2D y Ecosistema de Agentes Autónomos. Delega tareas durante el día y avanza proyectos mientras descansas.
          </p>

          {/* Interactive Game Environment Preview */}
          <div className="auth-preview-card">
            <img
              src={previewMode === 'day' ? dayRoomImg : nightRoomImg}
              alt={`Entorno de oficina Sleeply en modo ${previewMode}`}
              className="auth-preview-img"
            />
            <div className="auth-preview-overlay">
              <div className="auth-preview-label">
                <span className="auth-mode-indicator">
                  {previewMode === 'day' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
                  <span>{previewMode === 'day' ? 'Modo Vigilia (Día)' : 'Modo Sueño (Noche)'}</span>
                </span>
                <button
                  type="button"
                  className="auth-scale-button auth-toggle-mode-btn"
                  onClick={() => setPreviewMode((prev) => (prev === 'day' ? 'night' : 'day'))}
                >
                  {previewMode === 'day' ? <MoonIcon size={13} /> : <SunIcon size={13} />}
                  <span>Ver en Modo {previewMode === 'day' ? 'Noche' : 'Día'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Core Agents & Avatars Showcase */}
          <div className="auth-characters-showcase">
            <h4 className="auth-showcase-title">Equipo de Agentes Inteligentes y Avatares</h4>
            <div className="auth-characters-grid">
              <div className="auth-char-item auth-scale-button" title="Alex Vance - CEO & Tech Lead">
                <img src={char0Full} alt="Alex Vance" className="auth-char-portrait" />
                <span className="auth-char-name">Alex V.</span>
                <span className="auth-char-role">CEO / Lead</span>
              </div>
              <div className="auth-char-item auth-scale-button" title="Sam Rivera - Co-worker Agent">
                <img src={char1Full} alt="Sam Rivera" className="auth-char-portrait" />
                <span className="auth-char-name">Sam R.</span>
                <span className="auth-char-role">Co-worker</span>
              </div>
              <div className="auth-char-item auth-scale-button" title="Taylor Chen - Asistente & Secretaria">
                <img src={char2Full} alt="Taylor Chen" className="auth-char-portrait" />
                <span className="auth-char-name">Taylor C.</span>
                <span className="auth-char-role">Asistente</span>
              </div>
              <div className="auth-char-item auth-scale-button" title="Jordan Díaz - Manager & Supervisor">
                <img src={char3Full} alt="Jordan Díaz" className="auth-char-portrait" />
                <span className="auth-char-name">Jordan D.</span>
                <span className="auth-char-role">Manager</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Full Authentication Form Card */}
        <div className="auth-form-card">
          <div className="auth-form-header">
            <h2 className="auth-form-title">
              {isRegister ? 'Crear Cuenta de Acceso' : 'Acceso a la Oficina'}
            </h2>
            <p className="auth-form-description">
              {isRegister
                ? 'Regístrate para inicializar tu sede virtual y tu equipo de agentes.'
                : 'Inicia sesión con tu cuenta para ingresar y explorar la oficina.'}
            </p>
          </div>

          <div className="auth-tabs-group">
            <button
              type="button"
              className={`auth-tab-choice auth-scale-button ${!isRegister ? 'active' : ''}`}
              onClick={() => {
                setIsRegister(false);
                setErrorMsg(null);
              }}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              className={`auth-tab-choice auth-scale-button ${isRegister ? 'active' : ''}`}
              onClick={() => {
                setIsRegister(true);
                setErrorMsg(null);
              }}
            >
              Registrarse
            </button>
          </div>

          <form className="auth-form-body" onSubmit={handleSubmit}>
            {isRegister && (
              <div className="auth-input-group">
                <label className="auth-field-label" htmlFor="reg-name">
                  Nombre Completo
                </label>
                <input
                  id="reg-name"
                  type="text"
                  className="auth-text-input"
                  placeholder="ej. Santiago Sarmiento"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="auth-input-group">
              <label className="auth-field-label" htmlFor="auth-email">
                Correo Electrónico
              </label>
              <input
                id="auth-email"
                type="email"
                className="auth-text-input"
                placeholder="ceo@sleeply.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-input-group">
              <label className="auth-field-label" htmlFor="auth-password">
                Contraseña
              </label>
              <input
                id="auth-password"
                type="password"
                className="auth-text-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {errorMsg && (
              <div className="auth-error-pill" role="alert">
                <AlertTriangleIcon size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="auth-primary-submit-btn auth-scale-button"
              disabled={isLoading}
            >
              {isRegister ? <SparklesIcon size={18} /> : <RocketIcon size={18} />}
              <span>
                {isLoading
                  ? 'Verificando credenciales...'
                  : isRegister
                  ? 'Crear Cuenta y Comenzar'
                  : 'Ingresar a la Oficina'}
              </span>
            </button>

            <button
              type="button"
              className="auth-demo-action-btn auth-scale-button"
              onClick={fillDemoAccount}
              title="Cargar credenciales de demostración preconfiguradas del CEO"
            >
              <ZapIcon size={16} />
              <span>Cargar Credenciales de Prueba (CEO)</span>
            </button>
          </form>

          <div className="auth-security-notice">
            <LockIcon size={14} />
            <span>Acceso restringido: Es obligatorio iniciar sesión para desbloquear la oficina.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
