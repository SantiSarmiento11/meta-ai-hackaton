import React, { useState, useEffect } from 'react';
import {
  api,
  type AgentLiveState,
} from '../services/api';
import {
  getCharacterById,
  CHARACTERS_CATALOG,
  type CharacterId,
  type CharacterProfile,
} from '../game/models/CharacterModel';
import {
  CloseIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
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

export const N8nStatusModal: React.FC<N8nStatusModalProps> = ({
  isOpen,
  onClose,
  gameInstance,
  initialAgentCode,
}) => {
  const [selectedAgentCode, setSelectedAgentCode] = useState<string>(
    initialAgentCode || 'COWORKER'
  );
  const [agentsActivity, setAgentsActivity] = useState<AgentLiveState[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastActionResult, setLastActionResult] = useState<{
    actionTitle: string;
    agent: string;
    message: string;
    response: string;
    bubble: string;
  } | null>(null);

  // Sync agent activity on open
  useEffect(() => {
    if (!isOpen) return;
    const targetCode = initialAgentCode || 'COWORKER';
    setSelectedAgentCode(targetCode);
    setLastActionResult(null);
    setError(null);

    let isMounted = true;
    api.getAgentActivity().then((states) => {
      if (isMounted) {
        setAgentsActivity(states);
      }
    }).catch((err) => {
      if (isMounted) {
        setError('No se pudo sincronizar el estado: ' + err.message);
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
            title: 'Enviar Notificación por Correo',
            description: 'Envía un correo de notificación a sansamablogers@gmail.com a través del nodo Gmail.',
            serviceBadge: 'Gmail (sansamablogers@gmail.com)',
            icon: '📧',
          },
          {
            id: 'gmail_triage',
            title: 'Triage de Correos Urgentes',
            description: 'Clasifica y audita correos prioritarios en sansamablogers@gmail.com con Meta AI.',
            serviceBadge: 'Gmail API',
            icon: '📬',
          },
          {
            id: 'update_drive',
            title: 'Sincronizar Archivo en Google Drive',
            description: 'Sube o actualiza la minuta ejecutiva en la carpeta Sleeply de Google Drive.',
            serviceBadge: 'Google Drive API',
            icon: '📁',
          },
          {
            id: 'calendar_check',
            title: 'Consultar Agenda en Google Calendar',
            description: 'Revisa disponibilidad y días feriados en Google Calendar para sansamablogers@gmail.com.',
            serviceBadge: 'Google Calendar API',
            icon: '📅',
          },
          {
            id: 'calendar_sync',
            title: 'Agendar Reunión en Google Calendar',
            description: 'Crea un nuevo bloque de coordinación ejecutiva en Google Calendar.',
            serviceBadge: 'Google Calendar API',
            icon: '🗓️',
          },
          {
            id: 'meta_google_summary',
            title: 'Resumen Ejecutivo de Servicios Google',
            description: 'Meta AI sintetiza el estado global de Gmail, Drive y Calendar.',
            serviceBadge: 'Meta AI Engine',
            icon: '🤖',
          },
        ];

      case 'COWORKER':
        return [
          {
            id: 'commit_changes',
            title: 'Crear Archivo y Commit en GitHub',
            description: 'Aplica cambios y registra commit en GitHub para el usuario SantiSarmiento11.',
            serviceBadge: 'GitHub API (SantiSarmiento11)',
            icon: '🐙',
          },
          {
            id: 'list_repos',
            title: 'Consultar Repositorios y Ramas',
            description: 'Inspecciona sleeply-core-engine, sleeply-web-office y meta-hackaton-agents.',
            serviceBadge: 'GitHub API',
            icon: '🔍',
          },
          {
            id: 'review_pr',
            title: 'Auditar PR #14 & Code Review',
            description: 'Meta AI realiza auditoría de código del pull request y valida arquitectura.',
            serviceBadge: 'Meta AI Code Engine',
            icon: '🛠️',
          },
          {
            id: 'run_cli_tests',
            title: 'Ejecutar Tests Antigravity CLI',
            description: 'Ejecuta suite de 24 pruebas automatizadas con reporte de verificación.',
            serviceBadge: 'Antigravity CLI Runner',
            icon: '⚡',
          },
        ];

      case 'MANAGER':
        return [
          {
            id: 'morning_report',
            title: 'Compilar Reporte Matutino Ejecutivo',
            description: 'Meta AI genera el resumen de salud operativa y disponibilidad del sistema.',
            serviceBadge: 'Meta AI Reasoning',
            icon: '📊',
          },
          {
            id: 'postgres_audit',
            title: 'Monitorear Base de Datos PostgreSQL',
            description: 'Verifica estado de localhost:5432 / sleeply_db (tablas, bloqueos y conexiones).',
            serviceBadge: 'PostgreSQL 17',
            icon: '🗄️',
          },
          {
            id: 'sentry_audit',
            title: 'Auditoría de Alertas y Excepciones Sentry',
            description: 'Supervisa métricas de salud (100% operativo, 0 incidentes críticos).',
            serviceBadge: 'Sentry Monitor',
            icon: '🛡️',
          },
          {
            id: 'night_mode_sync',
            title: 'Activar Supervisión en Modo Sueño',
            description: 'Habilita el monitoreo nocturno continuo en segundo plano en n8n.',
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

      const bubbleText = res.state?.bubbleMessage || res.result?.bubbleMessage || 'Acción procesada con éxito';
      const outputText = res.result?.metaAiResponse || res.result?.bubbleMessage || res.message || 'Ejecución exitosa';

      setLastActionResult({
        actionTitle: btn.title,
        agent: res.state?.name || selectedAgentCode,
        message: res.message || 'Acción ejecutada exitosamente en n8n',
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
      setError(`Error al ejecutar acción: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen) return null;

  const currentAgent = agentsActivity.find((a) => a.code === selectedAgentCode) || {
    code: selectedAgentCode as any,
    name: selectedAgentCode === 'ASSISTANT' ? 'Taylor Chen' : selectedAgentCode === 'COWORKER' ? 'Sam Rivera' : 'Jordan Díaz',
    role: selectedAgentCode === 'ASSISTANT' ? 'Secretaria / Servicios Google' : selectedAgentCode === 'COWORKER' ? 'Co-worker / GitHub & Desarrollo' : 'Manager / Supervisión & Salud',
    status: 'IDLE' as const,
    activeWorkflow: selectedAgentCode === 'ASSISTANT' ? 'Sleeply - Secretaria Multi-Servicios (Taylor Chen)' : selectedAgentCode === 'COWORKER' ? 'Sleeply - Co-worker GitHub & Code Executor (Sam Rivera)' : 'Sleeply - Manager Nightly Monitor & Report (Jordan Díaz)',
    workflowId: selectedAgentCode === 'ASSISTANT' ? 'L7na6CjNOcAp7p0U' : selectedAgentCode === 'COWORKER' ? '8OTbNua6EJpVLxxe' : 'LfN37IXa0dRtyXuo',
    currentAction: 'Listo para recibir órdenes',
    bubbleMessage: 'Servicios en línea y sincronizados con n8n',
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
              <h3 className="n8n-title">Acciones del Agente • {currentAgent.name}</h3>
              <p className="n8n-subtitle">
                Workflow n8n: <strong>{currentAgent.activeWorkflow}</strong>
              </p>
            </div>
          </div>
          <button type="button" className="n8n-close-btn" onClick={onClose} aria-label="Cerrar">
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
              <span className="action-success-badge">Completado</span>
            </div>
            <p className="action-success-text">{lastActionResult.response}</p>
          </div>
        )}

        {/* ONLY BUTTONS SECTION */}
        <div className="agent-buttons-container">
          <h4 className="agent-buttons-title">
            Opciones del Workflow (Haz clic en un botón para ejecutar):
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
                      <span>Ejecutando en n8n...</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info note */}
        <div className="agent-buttons-footer">
          <span>Servicios configurados: GitHub (SantiSarmiento11) • Gmail & Calendar & Drive (sansamablogers@gmail.com) • Meta AI Engine</span>
        </div>
      </div>
    </div>
  );
};
