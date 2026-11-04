import React, { useState, useEffect, useCallback } from 'react';
import {
  api,
  type N8nTestResponse,
  type AgentLiveState,
  type GitHubRepositoryItem,
  type SecretaryDriveData,
  type ManagerHealthData,
} from '../services/api';
import {
  getCharacterById,
  CHARACTERS_CATALOG,
  type CharacterId,
  type CharacterProfile,
} from '../game/models/CharacterModel';
import {
  ZapIcon,
  CloseIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  SendIcon,
} from './Icons';
import './N8nStatusModal.css';

interface N8nStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameInstance?: Phaser.Game | null;
  initialAgentCode?: 'ASSISTANT' | 'COWORKER' | 'MANAGER' | 'CEO' | null;
}

export const N8nStatusModal: React.FC<N8nStatusModalProps> = ({
  isOpen,
  onClose,
  gameInstance,
  initialAgentCode,
}) => {
  const [activeTab, setActiveTab] = useState<'agents' | 'n8n'>('agents');
  const [selectedAgentCode, setSelectedAgentCode] = useState<string>(
    initialAgentCode || 'COWORKER'
  );

  const [n8nData, setN8nData] = useState<N8nTestResponse | null>(null);
  const [agentsActivity, setAgentsActivity] = useState<AgentLiveState[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastActionResult, setLastActionResult] = useState<{
    agent: string;
    message: string;
    response: string;
  } | null>(null);

  // Specialized Co-worker Data
  const [repositories, setRepositories] = useState<GitHubRepositoryItem[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>('sleeply-core-engine');

  // Specialized Secretary Data
  const [driveData, setDriveData] = useState<SecretaryDriveData | null>(null);

  // Specialized Manager Data
  const [managerData, setManagerData] = useState<ManagerHealthData | null>(null);

  // Custom Task Input
  const [customTaskInput, setCustomTaskInput] = useState<string>('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [n8nRes, activityRes] = await Promise.all([
        api.testN8nConnection(),
        api.getAgentActivity(),
      ]);
      setN8nData(n8nRes);
      setAgentsActivity(activityRes);

      if (gameInstance) {
        gameInstance.events.emit('request-update-agent-states', activityRes);
      }
    } catch (err: any) {
      setError(err.message || 'Error al conectar con los servicios.');
    } finally {
      setIsLoading(false);
    }
  }, [gameInstance]);

  // Load specialized agent data depending on selected agent
  const loadSpecializedData = useCallback(async (code: string) => {
    try {
      if (code === 'COWORKER') {
        const repos = await api.getCoworkerRepositories();
        setRepositories(repos);
        if (repos.length > 0 && !selectedRepo) {
          setSelectedRepo(repos[0].name);
        }
      } else if (code === 'ASSISTANT') {
        const drive = await api.getSecretaryDriveFiles();
        setDriveData(drive);
      } else if (code === 'MANAGER') {
        const health = await api.getManagerSystemHealth();
        setManagerData(health);
      }
    } catch (err: any) {
      console.warn(`[loadSpecializedData] Error loading data for ${code}:`, err.message);
    }
  }, [selectedRepo]);

  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;

    const targetCode = initialAgentCode || 'COWORKER';
    setSelectedAgentCode(targetCode);
    setActiveTab('agents');

    const runInitialSync = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [n8nRes, activityRes] = await Promise.all([
          api.testN8nConnection(),
          api.getAgentActivity(),
        ]);
        if (!isCancelled) {
          setN8nData(n8nRes);
          setAgentsActivity(activityRes);
          if (gameInstance) {
            gameInstance.events.emit('request-update-agent-states', activityRes);
          }
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err.message || 'Error al conectar con los servicios.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }

      loadSpecializedData(targetCode);
    };

    runInitialSync();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, initialAgentCode, gameInstance, loadSpecializedData]);

  // Trigger custom action or specialized action
  const handleRunSpecializedAction = async (actionType: string, customText?: string) => {
    const code = selectedAgentCode;
    setActionLoading(actionType);
    setLastActionResult(null);
    setError(null);

    try {
      let res: any;

      if (code === 'COWORKER') {
        res = await api.executeCoworkerAction(
          selectedRepo || 'sleeply-core-engine',
          actionType,
          customText
        );
      } else if (code === 'ASSISTANT') {
        res = await api.executeSecretaryAction(
          actionType,
          'doc_final',
          customText
        );
      } else if (code === 'MANAGER') {
        res = await api.executeManagerAction(actionType, customText);
      } else {
        res = await api.executeAgentAction(code, customText || actionType);
      }

      setLastActionResult({
        agent: res.state.name,
        message: res.message || 'Acción ejecutada exitosamente',
        response: res.result.metaAiResponse || res.result.bubbleMessage || 'Acción completada con éxito en n8n.',
      });

      setAgentsActivity((prev) =>
        prev.map((a) => (a.code === res.state.code ? res.state : a))
      );

      if (gameInstance) {
        gameInstance.events.emit('request-update-single-agent', res.state);
      }

      // Refresh specialized data
      loadSpecializedData(code);
      setCustomTaskInput('');
    } catch (err: any) {
      setError(`Error al ejecutar acción: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen) return null;

  // Find the active agent or fallback to the first activity item
  const currentAgent = agentsActivity.find((a) => a.code === selectedAgentCode) || agentsActivity[0];

  // Map each character's visual design based on their avatar id or agent code
  const getProfileForAgent = (agent?: AgentLiveState): CharacterProfile => {
    if (!agent) return CHARACTERS_CATALOG[0];
    if (agent.avatar) {
      const p = getCharacterById(agent.avatar);
      if (p) return p;
    }
    const codeMap: Record<string, CharacterId> = {
      ASSISTANT: 'char_2',
      COWORKER: 'char_1',
      MANAGER: 'char_3',
      CEO: 'char_0',
    };
    const mappedId = codeMap[agent.code.toUpperCase()] || 'char_1';
    return getCharacterById(mappedId) || CHARACTERS_CATALOG[0];
  };

  const currentProfile = getProfileForAgent(currentAgent);
  const activeRepoItem = repositories.find((r) => r.name === selectedRepo) || repositories[0];

  return (
    <div className="n8n-modal-backdrop" role="dialog" aria-modal="true">
      <div className="n8n-modal-card">
        {/* Header */}
        <div className="n8n-modal-header">
          <div className="n8n-title-group">
            <span className="n8n-icon">
              <ZapIcon size={18} />
            </span>
            <div>
              <h3 className="n8n-title">Gestión de Agentes & Automatizaciones</h3>
              <p className="n8n-subtitle">Orquestación de Oficina • n8n Workflows + Meta AI</p>
            </div>
          </div>
          <button type="button" className="n8n-close-btn" onClick={onClose} aria-label="Cerrar">
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="n8n-tabs-bar">
          <button
            type="button"
            className={`n8n-tab-btn ${activeTab === 'agents' ? 'active' : ''}`}
            onClick={() => setActiveTab('agents')}
          >
            Agentes Especializados ({agentsActivity.length || 3})
          </button>
          <button
            type="button"
            className={`n8n-tab-btn ${activeTab === 'n8n' ? 'active' : ''}`}
            onClick={() => setActiveTab('n8n')}
          >
            Conexión n8n & Meta AI
          </button>
        </div>

        <div className="n8n-modal-body">
          {isLoading && (
            <div className="n8n-loading-state">
              <span className="n8n-spinner" />
              <span>Sincronizando estado con n8n y Meta AI...</span>
            </div>
          )}

          {error && (
            <div className="n8n-error-box">
              <AlertTriangleIcon size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: AGENTES EN OFICINA */}
          {activeTab === 'agents' && !isLoading && (
            <div className="n8n-agents-view">
              {/* Agent Selector Pills */}
              <div className="agent-selector-row">
                {agentsActivity.map((agent) => {
                  const profile = getProfileForAgent(agent);
                  const isSelected = selectedAgentCode === agent.code;
                  return (
                    <button
                      key={agent.code}
                      type="button"
                      className={`agent-selector-pill ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedAgentCode(agent.code);
                        loadSpecializedData(agent.code);
                      }}
                      style={{
                        borderColor: isSelected ? profile.themeColor : undefined,
                      }}
                    >
                      <img
                        src={profile.avatarUrl}
                        alt={agent.name}
                        className="pill-avatar"
                      />
                      <span className={`agent-dot ${agent.status.toLowerCase()}`} />
                      <span className="pill-name">{agent.name.split(' ')[0]}</span>
                      <span className="pill-role">({agent.role.split('/')[0].trim()})</span>
                    </button>
                  );
                })}
              </div>

              {currentAgent && (
                <div
                  className="agent-detail-card"
                  style={{ '--char-theme': currentProfile.themeColor } as React.CSSProperties}
                >
                  <div className="agent-detail-layout">
                    {/* Character Identity Column */}
                    <div className="character-identity-column">
                      <div className="character-sprite-box">
                        <img
                          src={currentProfile.fullUrl}
                          alt={currentProfile.name}
                          className="character-report-full-sprite"
                          loading="eager"
                        />
                        <div className="character-pedestal-glow" />
                      </div>

                      <div className="character-identity-info">
                        <span className="character-dept-badge">{currentProfile.department}</span>
                        <div className="character-traits-row">
                          {currentProfile.traits.map((trait) => (
                            <span key={trait} className="character-trait-tag">
                              {trait}
                            </span>
                          ))}
                        </div>
                        <p className="character-bio-text">{currentProfile.description}</p>
                      </div>
                    </div>

                    {/* Report and Action Column */}
                    <div className="character-report-data-column">
                      <div className="agent-card-header">
                        <div>
                          <h4 className="agent-name">{currentAgent.name}</h4>
                          <span className="agent-role-badge">{currentAgent.role}</span>
                        </div>
                        <span className={`status-pill ${currentAgent.status.toLowerCase()}`}>
                          {currentAgent.status === 'WORKING' ? 'TRABAJANDO' : 'EN LÍNEA'}
                        </span>
                      </div>

                      {/* Speech Report */}
                      <div className="agent-speech-bubble-preview">
                        <span className="bubble-tag">Reporte de Estado Actual:</span>
                        <p className="bubble-text">"{currentAgent.bubbleMessage}"</p>
                      </div>

                      {/* SPECIALIZED SECTION: CO-WORKER (Sam Rivera) */}
                      {currentAgent.code === 'COWORKER' && (
                        <div className="specialized-panel coworker-panel">
                          <h5 className="panel-title">Repositorios Conectados a GitHub:</h5>
                          <div className="repo-selection-grid">
                            {(repositories.length > 0 ? repositories : [
                              {
                                name: 'sleeply-core-engine',
                                description: 'Motor central de orquestación y agentes continuos',
                                branch: 'feature/agent-orchestration',
                                openPRs: [{ id: 14, title: 'feat: add meta ai n8n connector', status: 'ready_for_review' }],
                                commitsPending: 0,
                                status: 'Tarea terminada con éxito: Conexión validada',
                              },
                              {
                                name: 'sleeply-web-office',
                                description: 'Oficina virtual isométrica 2D con Phaser 3, React y Chat',
                                branch: 'full-agent-workflow',
                                openPRs: [],
                                commitsPending: 0,
                                status: 'Cambios aplicados: Chat multiagente integrado',
                              },
                              {
                                name: 'meta-hackaton-agents',
                                description: 'Arquitectura multiagente con flujos n8n',
                                branch: 'main',
                                openPRs: [],
                                commitsPending: 0,
                                status: 'Sincronizado con n8n-dev1.auto-node.tech',
                              },
                            ]).map((repo) => (
                              <button
                                key={repo.name}
                                type="button"
                                className={`repo-card-pill ${selectedRepo === repo.name ? 'active-repo' : ''}`}
                                onClick={() => setSelectedRepo(repo.name)}
                              >
                                <span className="repo-card-name">{repo.name}</span>
                                <span className="repo-card-branch">{repo.branch}</span>
                              </button>
                            ))}
                          </div>

                          {activeRepoItem && (
                            <div className="repo-active-details">
                              <div className="detail-line">
                                <strong>Rama:</strong> <code>{activeRepoItem.branch}</code>
                                <strong>PRs Abiertos:</strong> <span>{activeRepoItem.openPRs?.length || 0}</span>
                              </div>
                              <div className="detail-line">
                                <strong>Estado:</strong> <span className="status-highlight">{activeRepoItem.status}</span>
                              </div>
                            </div>
                          )}

                          <div className="specialized-action-buttons">
                            <button
                              type="button"
                              className="btn-specialized-action action-primary"
                              disabled={actionLoading !== null}
                              onClick={() => handleRunSpecializedAction('commit_changes')}
                            >
                              {actionLoading === 'commit_changes' ? 'Aplicando cambios en GitHub...' : 'Hacer cambios y comentar éxito en GitHub'}
                            </button>
                            <button
                              type="button"
                              className="btn-specialized-action"
                              disabled={actionLoading !== null}
                              onClick={() => handleRunSpecializedAction('review_pr')}
                            >
                              {actionLoading === 'review_pr' ? 'Auditando PR...' : 'Auditar PR #14 & Code Review'}
                            </button>
                            <button
                              type="button"
                              className="btn-specialized-action"
                              disabled={actionLoading !== null}
                              onClick={() => handleRunSpecializedAction('run_cli_tests')}
                            >
                              {actionLoading === 'run_cli_tests' ? 'Ejecutando tests...' : 'Ejecutar Tests Antigravity CLI'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* SPECIALIZED SECTION: SECRETARIA (Taylor Chen) */}
                      {currentAgent.code === 'ASSISTANT' && (
                        <div className="specialized-panel assistant-panel">
                          <h5 className="panel-title">Documentos Google Drive & Gestión:</h5>
                          <div className="drive-files-list">
                            {(driveData?.driveFiles || [
                              {
                                id: 'doc_final',
                                name: 'Sleeply_Entrega_Final_Proyecto.docx',
                                folder: 'Sleeply/Entregables',
                                modified: new Date().toISOString(),
                                status: 'Comentado: Tarea terminada con éxito',
                              },
                              {
                                id: 'doc_01',
                                name: 'Minuta_Reunion_Estrategica_Q4.docx',
                                folder: 'Sleeply/Minutas',
                                modified: new Date().toISOString(),
                                status: 'Archivada',
                              },
                              {
                                id: 'sheet_02',
                                name: 'Presupuesto_Operativo_2026.xlsx',
                                folder: 'Sleeply/Finanzas',
                                modified: new Date().toISOString(),
                                status: 'Aprobado',
                              },
                            ]).map((doc) => (
                              <div key={doc.id} className="drive-doc-item">
                                <span className="doc-name">{doc.name}</span>
                                <span className="doc-folder">{doc.folder}</span>
                                <span className="doc-status">{doc.status}</span>
                              </div>
                            ))}
                          </div>

                          <div className="specialized-action-buttons">
                            <button
                              type="button"
                              className="btn-specialized-action action-primary"
                              disabled={actionLoading !== null}
                              onClick={() => handleRunSpecializedAction('update_drive')}
                            >
                              {actionLoading === 'update_drive' ? 'Actualizando Drive...' : 'Actualizar Google Drive y comentar éxito'}
                            </button>
                            <button
                              type="button"
                              className="btn-specialized-action"
                              disabled={actionLoading !== null}
                              onClick={() => handleRunSpecializedAction('gmail_triage')}
                            >
                              {actionLoading === 'gmail_triage' ? 'Clasificando correos...' : 'Triage de correos urgentes Gmail'}
                            </button>
                            <button
                              type="button"
                              className="btn-specialized-action"
                              disabled={actionLoading !== null}
                              onClick={() => handleRunSpecializedAction('calendar_sync')}
                            >
                              {actionLoading === 'calendar_sync' ? 'Sincronizando...' : 'Coordinar agenda en Google Calendar'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* SPECIALIZED SECTION: MANAGER (Jordan Díaz) */}
                      {currentAgent.code === 'MANAGER' && (
                        <div className="specialized-panel manager-panel">
                          <h5 className="panel-title">Supervisión del Sistema & Modo Sueño:</h5>
                          <div className="manager-metrics-card">
                            <div className="metric-row">
                              <strong>Base de Datos:</strong>{' '}
                              <span>
                                {managerData?.database.name || 'PostgreSQL 17'} ({managerData?.database.status || 'Saludable'} • {managerData?.database.errors || 0} bloqueos)
                              </span>
                            </div>
                            <div className="metric-row">
                              <strong>Sentry & Alertas:</strong>{' '}
                              <span>
                                {managerData?.sentry.healthScore || 100}% Saludable • {managerData?.sentry.activeIncidents || 0} excepciones activas
                              </span>
                            </div>
                            <div className="metric-row">
                              <strong>Canales de Notificación:</strong>{' '}
                              <span>
                                {managerData?.notifications.telegramChannel || 'Telegram (@sleeply_ceo)'} & Discord
                              </span>
                            </div>
                          </div>

                          <div className="specialized-action-buttons">
                            <button
                              type="button"
                              className="btn-specialized-action action-primary"
                              disabled={actionLoading !== null}
                              onClick={() => handleRunSpecializedAction('morning_report')}
                            >
                              {actionLoading === 'morning_report' ? 'Compilando reporte...' : 'Compilar reporte matutino ejecutivo'}
                            </button>
                            <button
                              type="button"
                              className="btn-specialized-action"
                              disabled={actionLoading !== null}
                              onClick={() => handleRunSpecializedAction('system_audit')}
                            >
                              {actionLoading === 'system_audit' ? 'Auditando...' : 'Auditar salud de PostgreSQL y tareas'}
                            </button>
                            <button
                              type="button"
                              className="btn-specialized-action"
                              disabled={actionLoading !== null}
                              onClick={() => handleRunSpecializedAction('send_alert')}
                            >
                              {actionLoading === 'send_alert' ? 'Enviando...' : 'Despachar alerta a Telegram / Discord'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Custom Task Assignment for Selected Agent */}
                      <div className="assign-custom-task-box">
                        <label className="custom-task-label">
                          Asignar nueva tarea o trabajo a {currentAgent.name}:
                        </label>
                        <div className="custom-task-row">
                          <input
                            type="text"
                            className="custom-task-input"
                            value={customTaskInput}
                            onChange={(e) => setCustomTaskInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && customTaskInput.trim()) {
                                e.preventDefault();
                                handleRunSpecializedAction('custom_task', customTaskInput);
                              }
                            }}
                            placeholder={`Escribe una instrucción para ${currentAgent.name} (se enviará a n8n)...`}
                            disabled={actionLoading !== null}
                          />
                          <button
                            type="button"
                            className="btn-assign-custom-task"
                            disabled={!customTaskInput.trim() || actionLoading !== null}
                            onClick={() => handleRunSpecializedAction('custom_task', customTaskInput)}
                          >
                            <SendIcon size={14} />
                            <span>Asignar en n8n</span>
                          </button>
                        </div>
                      </div>

                      {/* Action Feedback Box */}
                      {lastActionResult && lastActionResult.agent === currentAgent.name && (
                        <div className="action-feedback-box">
                          <div className="feedback-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircleIcon size={16} />
                            <span>{lastActionResult.message}</span>
                          </div>
                          <div className="feedback-response">{lastActionResult.response}</div>
                        </div>
                      )}

                      {/* Recent Logs */}
                      <div className="agent-logs-container">
                        <span className="logs-label">Registro de Actividad Reciente:</span>
                        <ul className="logs-list">
                          {currentAgent.recentLogs.map((log, idx) => (
                            <li key={idx}>{log}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: N8N & META AI CONNECTION */}
          {activeTab === 'n8n' && !isLoading && n8nData && (
            <div className="n8n-results">
              <div className={`n8n-status-badge ${n8nData.connected ? 'online' : 'offline'}`}>
                <span className="status-dot" />
                <span>
                  {n8nData.connected
                    ? 'Instancia n8n Remota Conectada'
                    : 'Instancia n8n En Espera'}
                </span>
                <span className="latency-tag">{n8nData.latencyMs}ms</span>
              </div>

              <div className="n8n-info-card">
                <div className="info-row">
                  <span className="info-label">Servidor n8n:</span>
                  <code className="info-value">{n8nData.testCredential.baseUrl}</code>
                </div>
                <div className="info-row">
                  <span className="info-label">Ruta Workflows:</span>
                  <code className="info-value">{n8nData.workflowsUrl || n8nData.testCredential.workflowsUrl}</code>
                </div>
                <div className="info-row">
                  <span className="info-label">API Key n8n:</span>
                  <code className="info-value">{n8nData.testCredential.apiKeyPreview}</code>
                </div>
                <div className="info-row">
                  <span className="info-label">Meta AI API Key:</span>
                  <code className="info-value-meta">{n8nData.testCredential.metaAiKeyPreview || 'Configurada'}</code>
                </div>
                <div className="info-row">
                  <span className="info-label">Meta AI Base URL:</span>
                  <code className="info-value-meta">https://api.meta.ai/v1 (OpenAI Compatible)</code>
                </div>
              </div>

              <div className="n8n-diagnostic-note">
                <strong>Diagnóstico del Orquestador:</strong> {n8nData.message}
              </div>

              {n8nData.workflows && n8nData.workflows.length > 0 && (
                <div className="n8n-agents-flow-preview">
                  <h4>Workflows Desplegados en n8n ({n8nData.workflowsCount}):</h4>
                  <ul>
                    {n8nData.workflows.map((wf) => (
                      <li key={wf.id}>
                        <strong>{wf.name}</strong> <code>[{wf.id}]</code> {wf.active ? '(Activo)' : '(Desplegado)'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="n8n-modal-footer">
          <button
            type="button"
            className="n8n-retest-btn"
            onClick={loadData}
            disabled={isLoading || actionLoading !== null}
          >
            {isLoading ? 'Sincronizando...' : 'Actualizar Estado y Flujos'}
          </button>
        </div>
      </div>
    </div>
  );
};
