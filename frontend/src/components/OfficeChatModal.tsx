import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  CheckCircleIcon,
  SpinnerIcon,
} from './Icons';
import './OfficeChatModal.css';

export type AgentCodeType = 'CEO' | 'COWORKER' | 'ASSISTANT' | 'MANAGER';

interface OfficeChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameInstance?: Phaser.Game | null;
  selectedAgentCode?: AgentCodeType | null;
  onSelectAgent?: (code: AgentCodeType) => void;
  onOpenDiagnostics?: () => void;
}

interface AgentTabInfo {
  code: AgentCodeType;
  name: string;
  role: string;
  avatarId: CharacterId;
  shortDesc: string;
}

const AGENT_TABS: AgentTabInfo[] = [
  {
    code: 'CEO',
    name: 'Alex Vance',
    role: 'CEO & Tech Lead',
    avatarId: 'char_0',
    shortDesc: 'Executive leadership & strategic vision',
  },
  {
    code: 'COWORKER',
    name: 'Sam Rivera',
    role: 'Co-worker / Software',
    avatarId: 'char_1',
    shortDesc: 'GitHub, code & automation',
  },
  {
    code: 'ASSISTANT',
    name: 'Taylor Chen',
    role: 'Executive Secretary',
    avatarId: 'char_2',
    shortDesc: 'Gmail, Drive & Calendar',
  },
  {
    code: 'MANAGER',
    name: 'Jordan Díaz',
    role: 'Operations Manager',
    avatarId: 'char_3',
    shortDesc: 'PostgreSQL, Sentry & audit',
  },
];

export const OfficeChatModal: React.FC<OfficeChatModalProps> = ({
  isOpen,
  onClose,
  gameInstance,
  selectedAgentCode,
  onSelectAgent,
  onOpenDiagnostics,
}) => {
  const [activeAgentCode, setActiveAgentCode] = useState<AgentCodeType>(
    () => selectedAgentCode || 'CEO'
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dbNotification, setDbNotification] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync active agent with selectedAgentCode prop when modal opens or prop changes
  useEffect(() => {
    if (selectedAgentCode && selectedAgentCode !== activeAgentCode) {
      setActiveAgentCode(selectedAgentCode);
    }
  }, [selectedAgentCode]);

  // Load chat history or set initial greeting when opened
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const loadHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const history = await api.getChatHistory();
        if (isMounted && Array.isArray(history) && history.length > 0) {
          const formatted: ChatMessage[] = [];
          history.forEach((item) => {
            formatted.push({
              id: `user-${item.id}`,
              sender: 'user',
              text: item.userMessage,
              timestamp: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });
            formatted.push({
              id: `agent-${item.id}`,
              sender: 'agent',
              agentCode: item.agentCode,
              agentName: item.agentName,
              avatar: item.avatar,
              text: item.reply,
              timestamp: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });
          });
          setMessages(formatted);
        } else if (isMounted) {
          // Default initial message
          setMessages([
            {
              id: 'init-default',
              sender: 'agent',
              agentCode: 'CEO',
              agentName: 'Alex Vance',
              agentRole: 'CEO & Tech Lead / Principal Orchestrator',
              avatar: 'char_0',
              text:
                'Welcome to the Sleeply virtual office. The conversational multi-agent chatbot is connected to the Meta AI API (consuming META_AI_API_KEY from .env) and directly linked to the PostgreSQL database.\n\n' +
                'You can interact with any member of your digital workforce by clicking their tab above or by clicking on them directly in the 2D office:\n' +
                '- Alex Vance (CEO): Strategic leadership, office administration, and task routing.\n' +
                '- Sam Rivera (Co-worker): GitHub repository management, software development, and pull request reviews.\n' +
                '- Taylor Chen (Secretary): Gmail inbox triage, Google Calendar scheduling, and Drive deliverables.\n' +
                '- Jordan Díaz (Manager): PostgreSQL 17 auditing, Sentry health monitoring, and night-shift operations.\n\n' +
                'Type any natural-language request and the agents will coordinate in real time.',
              briefReport:
                'EXECUTIVE REPORT:\n- Connection: Meta AI API (.env) [muse-spark-1.3]\n- Database: PostgreSQL 17 (sleeply_db) Connected & Synced\n- Active Agents: 4 specialized profiles available\n- Status: 100% operational (no emojis).',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      } catch {
        // Fallback default message
        if (isMounted) {
          setMessages([
            {
              id: 'init-fallback',
              sender: 'agent',
              agentCode: 'CEO',
              agentName: 'Alex Vance',
              agentRole: 'CEO & Tech Lead',
              avatar: 'char_0',
              text: 'Connection to Meta AI and PostgreSQL established. Ready for instructions.',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      } finally {
        if (isMounted) setIsLoadingHistory(false);
      }
    };

    loadHistory();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, isSending]);

  const currentAgentTab = useMemo(() => {
    return AGENT_TABS.find((t) => t.code === activeAgentCode) || AGENT_TABS[0];
  }, [activeAgentCode]);

  const handleSelectTab = (code: AgentCodeType) => {
    setActiveAgentCode(code);
    if (onSelectAgent) {
      onSelectAgent(code);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending) return;

    setError(null);
    setDbNotification(null);

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
      const response = await api.chatWithPrincipalAgent(text, activeAgentCode);

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        agentCode: response.agentCode,
        agentName: response.agentName,
        agentRole: response.agentRole,
        avatar: response.avatar,
        text: response.reply,
        actionTaken: response.actionTaken,
        briefReport: response.briefReport,
        dbConnected: response.dbConnected,
        dbStats: response.dbStats,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, agentMsg]);

      if (response.actionTaken && response.actionTaken.includes('database')) {
        setDbNotification(response.actionTaken);
      }

      // Sync updated office states to Phaser scene
      try {
        const updatedActivities = await api.getAgentActivity();
        if (gameInstance) {
          gameInstance.events.emit('request-update-agent-states', updatedActivities);
        }
      } catch {
        // Non-fatal if office sync fails momentarily
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with Meta AI model.');
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

  // Quick Action Chips tailored to the active agent
  const quickChips = useMemo(() => {
    switch (activeAgentCode) {
      case 'COWORKER':
        return [
          'Sam: Check GitHub repositories and branch status',
          'Sam: Create an optimization task in the database',
          'Sam: Review pull requests and Antigravity CLI tests',
          'Sam: Explain how the AI workforce queries PostgreSQL',
        ];
      case 'ASSISTANT':
        return [
          'Taylor: Summarize urgent emails in Gmail',
          'Taylor: Check schedule in Google Calendar',
          'Taylor: Search deliverables in Google Drive',
          'Taylor: Create an administrative task in PostgreSQL',
        ];
      case 'MANAGER':
        return [
          'Jordan: PostgreSQL and Sentry health report',
          'Jordan: Audit pending tasks registered in the database',
          'Jordan: Switch office to Night Mode for unattended shift',
          'Jordan: Validate integrity of environment connections',
        ];
      case 'CEO':
      default:
        return [
          'Alex: General status of agents and tasks in database',
          'Alex: Create a high-priority task in the database',
          'Alex: Switch office to Day Mode in PostgreSQL',
          'Alex: Comprehensive executive operations report',
        ];
    }
  }, [activeAgentCode]);

  if (!isOpen) return null;

  return (
    <div className="office-chat-backdrop" role="dialog" aria-modal="true">
      <div className="office-chat-container">
        {/* Header */}
        <header className="office-chat-header">
          <div className="chat-agent-profile">
            <div className="chat-avatar-wrapper">
              <img
                src={getAvatarForCode(currentAgentTab.avatarId, currentAgentTab.code)}
                alt={currentAgentTab.name}
                className="chat-header-avatar"
              />
              <span className="chat-live-pulse" />
            </div>
            <div className="chat-agent-text">
              <div className="chat-agent-title-row">
                <h3 className="chat-agent-name">{currentAgentTab.name}</h3>
                <span className="chat-role-tag">{currentAgentTab.role}</span>
              </div>
              <div className="chat-badges-row">
                <span className="chat-meta-badge" title="Consuming META_AI_API_KEY from .env">
                  Meta AI: muse-spark-1.3
                </span>
                <span className="chat-db-badge" title="Connected to PostgreSQL 17 (sleeply_db)">
                  DB: PostgreSQL Connected
                </span>
              </div>
            </div>
          </div>

          <div className="chat-header-actions">
            {onOpenDiagnostics && (
              <button
                type="button"
                className="chat-diagnostics-btn"
                onClick={onOpenDiagnostics}
                title="Open n8n Workflow Diagnostics"
              >
                n8n Flows
              </button>
            )}
            <button
              type="button"
              className="chat-close-btn"
              onClick={onClose}
              aria-label="Close chat"
            >
              <CloseIcon size={18} />
            </button>
          </div>
        </header>

        {/* Agent Switcher Tabs */}
        <div className="chat-agent-tabs-bar">
          <span className="tabs-header-label">Chat with:</span>
          <div className="agent-tabs-list">
            {AGENT_TABS.map((tab) => {
              const isActive = tab.code === activeAgentCode;
              return (
                <button
                  key={tab.code}
                  type="button"
                  className={`agent-tab-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectTab(tab.code)}
                >
                  <img
                    src={getAvatarForCode(tab.avatarId, tab.code)}
                    alt={tab.name}
                    className="agent-tab-avatar"
                  />
                  <div className="agent-tab-info">
                    <span className="agent-tab-name">{tab.name}</span>
                    <span className="agent-tab-role">{tab.role.split('/')[0].trim()}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* DB Action Notification Alert */}
        {dbNotification && (
          <div className="chat-db-alert">
            <CheckCircleIcon size={16} />
            <span>{dbNotification}</span>
          </div>
        )}

        {/* Messages Body */}
        <div className="office-chat-body">
          {isLoadingHistory && (
            <div className="chat-loading-history">
              <SpinnerIcon size={18} className="spin-icon" />
              <span>Loading database chat history...</span>
            </div>
          )}

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
                      alt={msg.agentName || 'Agent'}
                      className="bubble-avatar-img"
                    />
                    <span className="bubble-code-label">{msg.agentCode}</span>
                  </div>
                )}

                <div className={`chat-bubble-box ${isUser ? 'user-bubble' : 'agent-bubble'}`}>
                  {!isUser && (
                    <div className="agent-bubble-header">
                      <span className="agent-bubble-name">{msg.agentName}</span>
                      {msg.agentRole && (
                        <span className="agent-bubble-role">({msg.agentRole})</span>
                      )}
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

                  {msg.briefReport && (
                    <div className="brief-report-box">
                      <div className="brief-report-tag">
                        <span className="brief-report-title">Executive Report: Database & Meta AI</span>
                        <span className="brief-report-badge">PostgreSQL • Meta AI</span>
                      </div>
                      <div className="brief-report-content">
                        {msg.briefReport.split('\n').map((line: string, idx: number) => (
                          <p key={idx} className="brief-report-line">{line}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  <span className="bubble-timestamp">{msg.timestamp}</span>
                </div>
              </div>
            );
          })}

          {isSending && (
            <div className="chat-bubble-row agent-row">
              <div className="bubble-avatar-column">
                <img
                  src={getAvatarForCode(currentAgentTab.avatarId, currentAgentTab.code)}
                  alt={currentAgentTab.name}
                  className="bubble-avatar-img"
                />
                <span className="bubble-code-label">{currentAgentTab.code}</span>
              </div>
              <div className="chat-bubble-box agent-bubble sending-bubble">
                <div className="sending-indicator">
                  <span className="dot dot-1" />
                  <span className="dot dot-2" />
                  <span className="dot dot-3" />
                  <span className="sending-text">
                    Querying Meta AI API and syncing PostgreSQL...
                  </span>
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
          <span className="chips-label">Actions with {currentAgentTab.name.split(' ')[0]}:</span>
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
              placeholder={`Message for ${currentAgentTab.name} (Meta AI + DB)...`}
              disabled={isSending}
            />
            <button
              type="button"
              className="chat-send-btn"
              disabled={!inputText.trim() || isSending}
              onClick={() => handleSendMessage()}
              aria-label="Send message"
            >
              <SendIcon size={16} />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
