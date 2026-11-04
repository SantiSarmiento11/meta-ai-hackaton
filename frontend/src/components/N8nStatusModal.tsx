import React, { useState, useEffect } from 'react';
import { api, type AgentLiveState } from '../services/api';
import {
  getCharacterById,
  CHARACTERS_CATALOG,
  type CharacterId,
  type CharacterProfile,
} from '../game/models/CharacterModel';
import {
  CloseIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  ZapIcon,
} from './Icons';
import './N8nStatusModal.css';

interface N8nStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameInstance?: Phaser.Game | null;
  initialAgentCode?: 'ASSISTANT' | 'COWORKER' | 'MANAGER' | 'CEO' | null;
}

interface ActionButtonDef {
  id: string;
  title: string;
  description: string;
  serviceBadge: string;
  icon: string;
}

interface ExecutionResultState {
  actionTitle: string;
  agent: string;
  message: string;
  response: string;
  bubble: string;
}

export const N8nStatusModal: React.FC<N8nStatusModalProps> = ({
  isOpen,
  onClose,
  gameInstance,
  initialAgentCode = 'COWORKER',
}) => {
  const [selectedAgentCode] = useState<'ASSISTANT' | 'COWORKER' | 'MANAGER'>(() => {
    if (initialAgentCode === 'ASSISTANT' || initialAgentCode === 'MANAGER') {
      return initialAgentCode;
    }
    return 'COWORKER';
  });

  const [agentsActivity, setAgentsActivity] = useState<AgentLiveState[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [lastActionResult, setLastActionResult] = useState<ExecutionResultState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setLastActionResult(null);
    setError(null);

    let isMounted = true;
    api.getAgentActivity().then((states) => {
      if (isMounted) {
        setAgentsActivity(states);
      }
    }).catch((err) => {
      if (isMounted) {
        setError('Failed to synchronize status: ' + err.message);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, initialAgentCode]);

  const getProfileForAgent = (code: string): CharacterProfile => {
    const codeMap: Record<string, CharacterId> = {
      ASSISTANT: 'char_2',
      COWORKER: 'char_1',
      MANAGER: 'char_3',
      CEO: 'char_0',
    };
    const mappedId = codeMap[code.toUpperCase()] || 'char_1';
    return getCharacterById(mappedId) || CHARACTERS_CATALOG[0];
  };

  // Dedicated button options for each agent and workflow
  const getAgentButtons = (code: string): ActionButtonDef[] => {
    switch (code) {
      case 'ASSISTANT':
        return [
          {
            id: 'send_email',
            title: 'Send Email Notification',
            description: 'Sends an email notification to sansamablogers@gmail.com via the Gmail node.',
            serviceBadge: 'Gmail (sansamablogers@gmail.com)',
            icon: '📧',
          },
          {
            id: 'gmail_triage',
            title: 'Urgent Email Triage',
            description: 'Classifies and audits priority emails in sansamablogers@gmail.com with Meta AI.',
            serviceBadge: 'Gmail API',
            icon: '📬',
          },
          {
            id: 'update_drive',
            title: 'Sync File to Google Drive',
            description: 'Uploads or updates the executive summary in the Sleeply Google Drive folder.',
            serviceBadge: 'Google Drive API',
            icon: '📁',
          },
          {
            id: 'calendar_check',
            title: 'Check Schedule in Google Calendar',
            description: 'Checks availability and events in Google Calendar for sansamablogers@gmail.com.',
            serviceBadge: 'Google Calendar API',
            icon: '📅',
          },
          {
            id: 'calendar_sync',
            title: 'Schedule Meeting in Google Calendar',
            description: 'Creates a new executive coordination block in Google Calendar.',
            serviceBadge: 'Google Calendar API',
            icon: '🗓️',
          },
          {
            id: 'meta_google_summary',
            title: 'Google Services Executive Summary',
            description: 'Meta AI synthesizes global status across Gmail, Drive, and Calendar.',
            serviceBadge: 'Meta AI Engine',
            icon: '🤖',
          },
        ];

      case 'COWORKER':
        return [
          {
            id: 'commit_changes',
            title: 'Create File & Commit to GitHub',
            description: 'Applies changes and pushes commit to GitHub for user SantiSarmiento11.',
            serviceBadge: 'GitHub API (SantiSarmiento11)',
            icon: '🐙',
          },
          {
            id: 'list_repos',
            title: 'Query Repositories & Branches',
            description: 'Audits sleeply-core-engine, sleeply-web-office, and meta-hackaton-agents.',
            serviceBadge: 'GitHub API',
            icon: '🔍',
          },
          {
            id: 'review_pr',
            title: 'Audit PR #14 & Code Review',
            description: 'Meta AI conducts pull request code review and validates architecture.',
            serviceBadge: 'Meta AI Code Engine',
            icon: '🛠️',
          },
          {
            id: 'run_cli_tests',
            title: 'Run Antigravity CLI Tests',
            description: 'Executes suite of 24 automated tests with verification report.',
            serviceBadge: 'Antigravity CLI Runner',
            icon: '⚡',
          },
        ];

      case 'MANAGER':
        return [
          {
            id: 'morning_report',
            title: 'Compile Executive Morning Report',
            description: 'Meta AI generates operational health and system uptime summary.',
            serviceBadge: 'Meta AI Reasoning',
            icon: '📊',
          },
          {
            id: 'postgres_audit',
            title: 'Audit PostgreSQL Database',
            description: 'Verifies localhost:5432 / sleeply_db status (tables, locks, and active connections).',
            serviceBadge: 'PostgreSQL 17',
            icon: '🗄️',
          },
          {
            id: 'sentry_audit',
            title: 'Audit Sentry Alerts & Exceptions',
            description: 'Monitors stability metrics (100% operational, 0 critical incidents).',
            serviceBadge: 'Sentry Monitor',
            icon: '🛡️',
          },
          {
            id: 'night_mode_sync',
            title: 'Enable Night-Mode Supervision',
            description: 'Activates continuous unattended background monitoring in n8n.',
            serviceBadge: 'Sleeply Background Engine',
            icon: '🌙',
          },
        ];

      default:
        return [];
    }
  };

  const handleExecuteButton = async (btn: ActionButtonDef) => {
    setActionLoading(btn.id);
    setError(null);
    setLastActionResult(null);

    try {
      let res: any;
      if (selectedAgentCode === 'ASSISTANT') {
        res = await api.executeSecretaryAction(btn.id, 'doc_final', btn.title);
      } else if (selectedAgentCode === 'COWORKER') {
        res = await api.executeCoworkerAction('sleeply-core-engine', btn.id, btn.title);
      } else if (selectedAgentCode === 'MANAGER') {
        res = await api.executeManagerAction(btn.id, btn.title);
      } else {
        res = await api.executeAgentAction(selectedAgentCode, btn.title);
      }

      const bubbleText = res.state?.bubbleMessage || res.result?.bubbleMessage || 'Action processed successfully';
      const outputText = res.result?.metaAiResponse || res.result?.bubbleMessage || res.message || 'Execution successful';

      setLastActionResult({
        actionTitle: btn.title,
        agent: res.state?.name || selectedAgentCode,
        message: res.message || 'Action executed successfully in n8n',
        response: String(outputText),
        bubble: bubbleText,
      });

      // Update local state list
      if (res.state) {
        setAgentsActivity((prev) =>
          prev.map((a) => (a.code === res.state.code ? res.state : a))
        );
        if (gameInstance) {
          gameInstance.events.emit('request-update-single-agent', res.state);
        }
      }
    } catch (err: any) {
      setError(`Action execution failed: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen) return null;

  const currentAgent = agentsActivity.find((a) => a.code === selectedAgentCode) || {
    code: selectedAgentCode as any,
    name: selectedAgentCode === 'ASSISTANT' ? 'Taylor Chen' : selectedAgentCode === 'COWORKER' ? 'Sam Rivera' : 'Jordan Díaz',
    role: selectedAgentCode === 'ASSISTANT' ? 'Secretary / Google Services' : selectedAgentCode === 'COWORKER' ? 'Co-worker / GitHub & Development' : 'Manager / Operations & Health',
    status: 'IDLE' as const,
    activeWorkflow: selectedAgentCode === 'ASSISTANT' ? 'Sleeply - Multi-Service Secretary (Taylor Chen)' : selectedAgentCode === 'COWORKER' ? 'Sleeply - Co-worker GitHub & Code Executor (Sam Rivera)' : 'Sleeply - Manager Nightly Monitor & Report (Jordan Díaz)',
    workflowId: selectedAgentCode === 'ASSISTANT' ? 'L7na6CjNOcAp7p0U' : selectedAgentCode === 'COWORKER' ? '8OTbNua6EJpVLxxe' : 'LfN37IXa0dRtyXuo',
    currentAction: 'Ready to receive tasks',
    bubbleMessage: 'Services online and synced with n8n',
    metaAiEndpoint: 'https://api.meta.ai/v1',
    lastUpdated: new Date().toISOString(),
    recentLogs: [],
    avatar: selectedAgentCode === 'ASSISTANT' ? 'char_2' : selectedAgentCode === 'COWORKER' ? 'char_1' : 'char_3',
  };

  const profile = getProfileForAgent(selectedAgentCode);
  const actionButtons = getAgentButtons(selectedAgentCode);

  return (
    <div className="n8n-modal-backdrop" role="dialog" aria-modal="true">
      <div className="n8n-modal-card agent-buttons-modal">
        {/* Header */}
        <div className="n8n-modal-header">
          <div className="n8n-title-group">
            <span className="n8n-icon">
              <ZapIcon size={20} />
            </span>
            <div>
              <h3 className="n8n-title">Agent Actions • {currentAgent.name}</h3>
              <p className="n8n-subtitle">
                n8n Workflow: <strong>{currentAgent.activeWorkflow}</strong>
              </p>
            </div>
          </div>
          <button type="button" className="n8n-close-btn" onClick={onClose} aria-label="Close">
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Agent Character Bar */}
        <div className="agent-identity-strip" style={{ borderColor: profile.themeColor }}>
          <img
            src={profile.avatarUrl}
            alt={currentAgent.name}
            className="agent-identity-avatar"
          />
          <div className="agent-identity-meta">
            <div className="agent-identity-name-row">
              <span className="agent-name-label">{currentAgent.name}</span>
              <span className="agent-role-tag">{currentAgent.role}</span>
              <span className="agent-workflow-badge">n8n + Meta AI</span>
            </div>
            <div className="agent-bubble-strip">
              <span className="bubble-strip-quote">"{lastActionResult?.bubble || currentAgent.bubbleMessage}"</span>
            </div>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="n8n-error-box">
            <AlertTriangleIcon size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Action result notification banner */}
        {lastActionResult && (
          <div className="action-success-banner">
            <div className="action-success-header">
              <CheckCircleIcon size={18} />
              <strong>{lastActionResult.actionTitle}</strong>
              <span className="action-success-badge">Completed</span>
            </div>
            <p className="action-success-text">{lastActionResult.response}</p>
          </div>
        )}

        {/* ONLY BUTTONS SECTION */}
        <div className="agent-buttons-container">
          <h4 className="agent-buttons-title">
            Workflow Options (Click a button to execute):
          </h4>

          <div className="agent-action-buttons-grid">
            {actionButtons.map((btn) => {
              const isLoading = actionLoading === btn.id;
              return (
                <button
                  key={btn.id}
                  type="button"
                  className={`agent-action-card-btn ${isLoading ? 'btn-executing' : ''}`}
                  disabled={actionLoading !== null}
                  onClick={() => handleExecuteButton(btn)}
                >
                  <div className="card-btn-top">
                    <span className="card-btn-icon">{btn.icon}</span>
                    <span className="card-btn-badge">{btn.serviceBadge}</span>
                  </div>
                  <div className="card-btn-title">{btn.title}</div>
                  <div className="card-btn-desc">{btn.description}</div>
                  {isLoading && (
                    <div className="card-btn-spinner-overlay">
                      <span className="n8n-spinner" />
                      <span>Executing in n8n...</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info note */}
        <div className="agent-buttons-footer">
          <span>Configured Services: GitHub (SantiSarmiento11) • Gmail, Calendar & Drive (sansamablogers@gmail.com) • Meta AI Engine</span>
        </div>
      </div>
    </div>
  );
};
