import React, { useState, useEffect, useRef } from 'react';
import { api, type ChatMessage } from '../services/api';
import {
  getCharacterById,
  CHARACTERS_CATALOG,
  type CharacterId,
} from '../game/models/CharacterModel';
import {
  ChatIcon,
  SendIcon,
  CloseIcon,
  AlertTriangleIcon,
} from './Icons';
import './OfficeChatModal.css';

interface OfficeChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameInstance?: Phaser.Game | null;
}

export const OfficeChatModal: React.FC<OfficeChatModalProps> = ({
  isOpen,
  onClose,
  gameInstance,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-1',
      sender: 'agent',
      agentCode: 'CEO',
      agentName: 'Alex Vance',
      agentRole: 'CEO & Tech Lead / Agente Principal',
      avatar: 'char_0',
      text:
        'Bienvenido a la oficina central de Sleeply. Soy Alex Vance, tu Agente Conversacional Principal y Orquestador del equipo.\n\n' +
        'Estoy conectado directamente a los flujos de trabajo de n8n y Meta AI para coordinar todas tus tareas:\n' +
        '• Sam Rivera (Co-worker): Desarrollo, repositorios GitHub, PRs y pruebas de código.\n' +
        '• Taylor Chen (Secretaria): Gestión de Gmail, Google Calendar y almacenamiento en Google Drive.\n' +
        '• Jordan Díaz (Manager): Supervisión continua, persistencia PostgreSQL y reportes ejecutivos.\n\n' +
        'Puedes escribirme cualquier orden en lenguaje natural o utilizar las acciones rápidas abajo.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, isSending]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    try {
      const response = await api.chatWithPrincipalAgent(text);

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        agentCode: response.agentCode,
        agentName: response.agentName,
        agentRole: response.agentRole,
        avatar: response.avatar,
        text: response.reply,
        actionTaken: response.actionTaken,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, agentMsg]);

      // Sync updated office states
      try {
        const updatedActivities = await api.getAgentActivity();
        if (gameInstance) {
          gameInstance.events.emit('request-update-agent-states', updatedActivities);
        }
      } catch {
        // Non-fatal if office sync fails momentarily
      }
    } catch (err: any) {
      setError(err.message || 'Error al comunicarse con el agente principal.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getAvatarForCode = (avatarId?: string, code?: string): string => {
    if (avatarId) {
      const char = getCharacterById(avatarId as CharacterId);
      if (char) return char.avatarUrl;
    }
    const map: Record<string, CharacterId> = {
      CEO: 'char_0',
      COWORKER: 'char_1',
      ASSISTANT: 'char_2',
      MANAGER: 'char_3',
    };
    const id = map[code || 'CEO'] || 'char_0';
    return getCharacterById(id)?.avatarUrl || CHARACTERS_CATALOG[0].avatarUrl;
  };

  const quickChips = [
    'Sam: Consultar repositorios GitHub y hacer cambios',
    'Taylor: Triage de Gmail y sincronizar Google Drive',
    'Jordan: Reporte ejecutivo de estado del sistema',
    'Comentar que la tarea finalizó con éxito en GitHub y Drive',
  ];

  return (
    <div className="office-chat-backdrop" role="dialog" aria-modal="true">
      <div className="office-chat-container">
        {/* Header */}
        <header className="office-chat-header">
          <div className="chat-agent-profile">
            <div className="chat-avatar-wrapper">
              <img
                src={getAvatarForCode('char_0', 'CEO')}
                alt="Alex Vance"
                className="chat-header-avatar"
              />
              <span className="chat-live-pulse" />
            </div>
            <div className="chat-agent-text">
              <div className="chat-agent-title-row">
                <h3 className="chat-agent-name">Alex Vance</h3>
                <span className="chat-role-tag">CEO & Orquestador</span>
                <span className="chat-n8n-badge">n8n Online</span>
              </div>
              <p className="chat-agent-desc">Punto Central de Interacción • Meta AI Engine</p>
            </div>
          </div>

          <button
            type="button"
            className="chat-close-btn"
            onClick={onClose}
            aria-label="Cerrar chat"
          >
            <CloseIcon size={18} />
          </button>
        </header>

        {/* Messages Body */}
        <div className="office-chat-body">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const avatarUrl = getAvatarForCode(msg.avatar, msg.agentCode);

            return (
              <div
                key={msg.id}
                className={`chat-bubble-row ${isUser ? 'user-row' : 'agent-row'}`}
              >
                {!isUser && (
                  <div className="bubble-avatar-column">
                    <img
                      src={avatarUrl}
                      alt={msg.agentName || 'Agente'}
                      className="bubble-avatar-img"
                    />
                    <span className="bubble-code-label">{msg.agentCode}</span>
                  </div>
                )}

                <div className={`chat-bubble-box ${isUser ? 'user-bubble' : 'agent-bubble'}`}>
                  {!isUser && (
                    <div className="agent-bubble-header">
                      <span className="agent-bubble-name">{msg.agentName}</span>
                      <span className="agent-bubble-role">({msg.agentRole})</span>
                      {msg.actionTaken && (
                        <span className="agent-action-pill">{msg.actionTaken}</span>
                      )}
                    </div>
                  )}

                  <div className="chat-bubble-content">
                    {msg.text.split('\n').map((line, idx) => (
                      <p key={idx} className="bubble-paragraph">
                        {line}
                      </p>
                    ))}
                  </div>

                  <span className="bubble-timestamp">{msg.timestamp}</span>
                </div>
              </div>
            );
          })}

          {isSending && (
            <div className="chat-bubble-row agent-row">
              <div className="bubble-avatar-column">
                <img
                  src={getAvatarForCode('char_0', 'CEO')}
                  alt="Alex Vance"
                  className="bubble-avatar-img"
                />
              </div>
              <div className="chat-bubble-box agent-bubble sending-bubble">
                <div className="sending-indicator">
                  <span className="dot dot-1" />
                  <span className="dot dot-2" />
                  <span className="dot dot-3" />
                  <span className="sending-text">Orquestando con n8n y Meta AI...</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="chat-error-banner">
              <AlertTriangleIcon size={16} />
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="chat-quick-chips-bar">
          <span className="chips-label">Acciones Rápidas:</span>
          <div className="chips-scroll">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                className="quick-chip-btn"
                disabled={isSending}
                onClick={() => handleSendMessage(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Input */}
        <footer className="office-chat-footer">
          <div className="chat-input-wrapper">
            <span className="chat-input-icon">
              <ChatIcon size={16} />
            </span>
            <input
              type="text"
              className="chat-text-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe una instrucción a Sleeply (ej: Sam, revisa el repositorio GitHub)..."
              disabled={isSending}
            />
            <button
              type="button"
              className="chat-send-btn"
              disabled={!inputText.trim() || isSending}
              onClick={() => handleSendMessage()}
              aria-label="Enviar mensaje"
            >
              <SendIcon size={16} />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
