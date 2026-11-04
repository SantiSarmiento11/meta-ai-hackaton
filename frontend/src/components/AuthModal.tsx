import React, { useState } from 'react';
import sleeplyLogo from '../assets/sleeply (svg).svg';
import dayRoomImg from '../assets/Rooms/Rooms FInal Version/Oficina isométrica  dia con logo Sleeply.png';
import nightRoomImg from '../assets/Rooms/Rooms FInal Version/Oficina nocturna con neón Sleeply.png';
import loginBgImg from '../assets/Fondo azul nocturno con diseño isométrico para el login.png';
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
          throw new Error('Please enter your full name.');
        }
        const res = await api.register(email, password, name);
        onSuccess(res.user);
      } else {
        const res = await api.login(email, password);
        onSuccess(res.user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error.');
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
    <div
      className="auth-fullscreen-container"
      style={{ '--auth-bg-url': `url("${loginBgImg}")` } as React.CSSProperties}
      role="dialog"
      aria-modal="true"
    >
      <div className="auth-fullscreen-wrapper">
        {/* Left Column: Visual Game Showcase */}
        <div className="auth-showcase-panel">
          <div className="auth-brand-lockup">
            <img src={sleeplyLogo} alt="Sleeply" className="auth-brand-logo-large" />
          </div>

          <p className="auth-tagline">
            2D Isometric Virtual Office & Autonomous Multi-Agent Workforce. Delegate tasks during the day and advance projects while you sleep.
          </p>

          {/* Interactive Game Environment Preview */}
          <div className="auth-preview-card">
            <img
              src={previewMode === 'day' ? dayRoomImg : nightRoomImg}
              alt={`Sleeply office environment in ${previewMode} mode`}
              className="auth-preview-img"
            />
            <div className="auth-preview-overlay">
              <div className="auth-preview-label">
                <span className="auth-mode-indicator">
                  {previewMode === 'day' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
                  <span>{previewMode === 'day' ? 'Day Mode (Awake)' : 'Night Mode (Sleep)'}</span>
                </span>
                <button
                  type="button"
                  className="auth-scale-button auth-toggle-mode-btn"
                  onClick={() => setPreviewMode((prev) => (prev === 'day' ? 'night' : 'day'))}
                >
                  {previewMode === 'day' ? <MoonIcon size={13} /> : <SunIcon size={13} />}
                  <span>View in {previewMode === 'day' ? 'Night' : 'Day'} Mode</span>
                </button>
              </div>
            </div>
          </div>

          {/* Core Agents & Avatars Showcase */}
          <div className="auth-characters-showcase">
            <h4 className="auth-showcase-title">Multi-Agent Workforce & Avatars</h4>
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
              <div className="auth-char-item auth-scale-button" title="Taylor Chen - Executive Secretary">
                <img src={char2Full} alt="Taylor Chen" className="auth-char-portrait" />
                <span className="auth-char-name">Taylor C.</span>
                <span className="auth-char-role">Secretary</span>
              </div>
              <div className="auth-char-item auth-scale-button" title="Jordan Díaz - Operations Manager">
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
              {isRegister ? 'Create Account' : 'Virtual Office Access'}
            </h2>
            <p className="auth-form-description">
              {isRegister
                ? 'Register to initialize your virtual headquarters and multi-agent team.'
                : 'Sign in with your account to enter and explore the office.'}
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
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab-choice auth-scale-button ${isRegister ? 'active' : ''}`}
              onClick={() => {
                setIsRegister(true);
                setErrorMsg(null);
              }}
            >
              Register
            </button>
          </div>

          <form className="auth-form-body" onSubmit={handleSubmit}>
            {isRegister && (
              <div className="auth-input-group">
                <label className="auth-field-label" htmlFor="reg-name">
                  Full Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  className="auth-text-input"
                  placeholder="e.g. Santiago Sarmiento"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="auth-input-group">
              <label className="auth-field-label" htmlFor="auth-email">
                Email Address
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
                Password
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
                  ? 'Verifying credentials...'
                  : isRegister
                  ? 'Create Account & Begin'
                  : 'Enter Office'}
              </span>
            </button>

            <button
              type="button"
              className="auth-demo-action-btn auth-scale-button"
              onClick={fillDemoAccount}
              title="Load preconfigured CEO demo credentials"
            >
              <ZapIcon size={16} />
              <span>Load Demo Credentials (CEO)</span>
            </button>
          </form>

          <div className="auth-security-notice">
            <LockIcon size={14} />
            <span>Restricted Access: Sign in required to unlock the virtual office.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
