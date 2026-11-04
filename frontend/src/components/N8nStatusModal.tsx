import React, { useState, useEffect, useCallback } from 'react';
import { api, type N8nTestResponse, type AgentLiveState } from '../services/api';
import './N8nStatusModal.css';

interface N8nStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameInstance?: Phaser.Game | null;
  initialAgentCode?: 'ASSISTANT' | 'COWORKER' | 'MANAGER' | null;
}

export const N8nStatusModal: React.FC<N8nStatusModalProps> = ({
  isOpen,
  onClose,
  gameInstance,
  initialAgentCode,
}) => {
  const [activeTab, setActiveTab] = useState<'agents' | 'n8n'>('agents');
  const [selectedAgentCode, setSelectedAgentCode] = useState<'ASSISTANT' | 'COWORKER' | 'MANAGER'>(
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

      // Sincronizar estados en la escena de Phaser
      if (gameInstance) {
        gameInstance.events.emit('request-update-agent-states', activityRes);
      }
    } catch (err: any) {
      setError(err.message || 'Error al conectar con los servicios.');
    } finally {
      setIsLoading(false);
    }
  }, [gameInstance]);

  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;

    const runInitialSync = async () => {
      await Promise.resolve();
      if (isCancelled) return;

      if (initialAgentCode) {
        setSelectedAgentCode(initialAgentCode);
        setActiveTab('agents');
      }

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
    };

    runInitialSync();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, initialAgentCode, gameInstance]);

  const handleRunAction = async (agentCode: 'ASSISTANT' | 'COWORKER' | 'MANAGER', actionName: string) => {
    setActionLoading(agentCode);
    setLastActionResult(null);
    try {
      const res = await api.executeAgentAction(agentCode, actionName);
      setLastActionResult({
        agent: res.state.name,
        message: res.message,
        response: res.result.metaAiResponse || 'Acción procesada con éxito.',
      });

      // Actualizar estado local
      setAgentsActivity((prev) =>
        prev.map((a) => (a.code === res.state.code ? res.state : a))
      );

      // Notificar a la oficina virtual de Phaser para actualizar el globo de diálogo en tiempo real
      if (gameInstance) {
        gameInstance.events.emit('request-update-single-agent', res.state);
      }
    } catch (err: any) {
      setError(`Error al ejecutar acción: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen) return null;

  const currentAgent = agentsActivity.find((a) => a.code === selectedAgentCode);

  return (
    <div className="n8n-modal-backdrop" role="dialog" aria-modal="true">
      <div className="n8n-modal-card">
        {/* Header */}
        <div className="n8n-modal-header">
          <div className="n8n-title-group">
            <span className="n8n-icon">⚡</span>
            <div>
              <h3 className="n8n-title">Sistema de Automatizaciones & Agentes</h3>
              <p className="n8n-subtitle">Orquestación n8n + Meta AI API (https://api.meta.ai/v1)</p>
            </div>
          </div>
          <button type="button" className="n8n-close-btn" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="n8n-tabs-bar">
          <button
            type="button"
            className={`n8n-tab-btn ${activeTab === 'agents' ? 'active' : ''}`}
            onClick={() => setActiveTab('agents')}
          >
            Personajes en Oficina ({agentsActivity.length || 3})
          </button>
          <button
            type="button"
            className={`n8n-tab-btn ${activeTab === 'n8n' ? 'active' : ''}`}
            onClick={() => setActiveTab('n8n')}
          >
            Servicios n8n & Meta AI
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
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: AGENTES EN OFICINA */}
          {activeTab === 'agents' && !isLoading && (
            <div className="n8n-agents-view">
              {/* Agent Selector Pills */}
              <div className="agent-selector-row">
                {agentsActivity.map((agent) => (
                  <button
                    key={agent.code}
                    type="button"
                    className={`agent-selector-pill ${selectedAgentCode === agent.code ? 'selected' : ''}`}
                    onClick={() => setSelectedAgentCode(agent.code)}
                  >
                    <span className={`agent-dot ${agent.status.toLowerCase()}`} />
                    <span className="pill-name">{agent.name.split(' ')[0]}</span>
                    <span className="pill-role">({agent.role.split('/')[0].trim()})</span>
                  </button>
                ))}
              </div>

              {currentAgent && (
                <div className="agent-detail-card">
                  <div className="agent-card-header">
                    <div>
                      <h4 className="agent-name">{currentAgent.name}</h4>
                      <span className="agent-role-badge">{currentAgent.role}</span>
                    </div>
                    <span className={`status-pill ${currentAgent.status.toLowerCase()}`}>
                      {currentAgent.status === 'WORKING' ? 'TRABAJANDO' : 'EN LÍNEA'}
                    </span>
                  </div>

                  <div className="agent-speech-bubble-preview">
                    <span className="bubble-tag">Globo de Diálogo en Oficina:</span>
                    <p className="bubble-text">"{currentAgent.bubbleMessage}"</p>
                  </div>

                  <div className="agent-workflow-box">
                    <div className="workflow-detail-row">
                      <span className="row-label">Workflow n8n:</span>
                      <strong className="row-value">{currentAgent.activeWorkflow}</strong>
                    </div>
                    <div className="workflow-detail-row">
                      <span className="row-label">Workflow ID:</span>
                      <code className="row-code">{currentAgent.workflowId}</code>
                    </div>
                    <div className="workflow-detail-row">
                      <span className="row-label">Motor de IA:</span>
                      <code className="row-code-meta">Meta AI ({currentAgent.metaAiEndpoint})</code>
                    </div>
                  </div>

                  {/* Action Executor */}
                  <div className="agent-action-box">
                    <button
                      type="button"
                      className="btn-trigger-action"
                      disabled={actionLoading !== null}
                      onClick={() => {
                        let action = 'Ejecución Automática';
                        if (currentAgent.code === 'ASSISTANT') action = 'Triage de correos Gmail y Google Calendar';
                        if (currentAgent.code === 'COWORKER') action = 'Análisis de PR en GitHub y pruebas locales';
                        if (currentAgent.code === 'MANAGER') action = 'Auditoría nocturna y reporte matutino';
                        handleRunAction(currentAgent.code, action);
                      }}
                    >
                      {actionLoading === currentAgent.code ? (
                        <>
                          <span className="action-spinner" /> Ejecutando en n8n...
                        </>
                      ) : (
                        `Disparar Flujo: ${
                          currentAgent.code === 'ASSISTANT'
                            ? 'Triage Correos & Agenda'
                            : currentAgent.code === 'COWORKER'
                            ? 'Tests GitHub & PR Review'
                            : 'Auditoría & Reporte Matutino'
                        }`
                      )}
                    </button>
                  </div>

                  {lastActionResult && lastActionResult.agent === currentAgent.name && (
                    <div className="action-feedback-box">
                      <div className="feedback-title">✓ {lastActionResult.message}</div>
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
