import { env } from '../config/env';

export interface N8nTriggerPayload {
  userId: string;
  userEmail: string;
  agentCode: string;
  agentName: string;
  taskTitle: string;
  taskDescription: string;
  operatingMode: 'awake' | 'sleep';
  timestamp: string;
  contextData?: Record<string, any>;
}

export interface N8nConnectionTestResult {
  connected: boolean;
  endpoint: string;
  workflowsUrl: string;
  statusCode?: number;
  statusText?: string;
  message: string;
  latencyMs: number;
  workflowsCount?: number;
  workflows?: Array<{ id: string; name: string; active: boolean }>;
  testCredential: {
    service: string;
    apiKeyPreview: string;
    baseUrl: string;
    workflowsUrl: string;
    webhookUrl: string;
    metaAiConfigured: boolean;
    metaAiKeyPreview: string;
  };
}

export class N8nService {
  /**
   * Attempts connection to the configured n8n endpoint.
   * Performs a live API check to query available workflows using X-N8N-API-KEY.
   */
  public async testConnection(): Promise<N8nConnectionTestResult> {
    const startTime = Date.now();
    const endpoint = env.N8N_BASE_URL;
    const workflowsUrl = env.N8N_WORKFLOWS_URL;
    const webhookUrl = env.N8N_WEBHOOK_URL;
    const apiKey = env.N8N_API_KEY;
    const metaAiKey = env.META_AI_API_KEY;

    const maskedApiKey = apiKey.length > 12
      ? `${apiKey.slice(0, 8)}...${apiKey.slice(-6)}`
      : '***';

    const maskedMetaAiKey = metaAiKey.length > 8
      ? `${metaAiKey.slice(0, 7)}...${metaAiKey.slice(-4)}`
      : '***';

    const testCredential = {
      service: 'n8n + Meta AI',
      apiKeyPreview: maskedApiKey,
      baseUrl: endpoint,
      workflowsUrl: workflowsUrl,
      webhookUrl: webhookUrl,
      metaAiConfigured: !!metaAiKey,
      metaAiKeyPreview: maskedMetaAiKey,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      // Query n8n public API workflows endpoint
      const response = await fetch(`${endpoint}/api/v1/workflows`, {
        method: 'GET',
        headers: {
          'X-N8N-API-KEY': apiKey,
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      if (response.ok) {
        const body = (await response.json()) as { data?: Array<{ id: string; name: string; active: boolean }> };
        const workflows = body.data || [];

        return {
          connected: true,
          endpoint,
          workflowsUrl,
          statusCode: response.status,
          statusText: response.statusText,
          message: `Conexión exitosa con el servidor n8n en ${endpoint}. Se detectaron ${workflows.length} flujos de trabajo disponibles. Meta AI configurado.`,
          latencyMs,
          workflowsCount: workflows.length,
          workflows: workflows.map((w) => ({ id: w.id, name: w.name, active: w.active })),
          testCredential,
        };
      } else {
        return {
          connected: false,
          endpoint,
          workflowsUrl,
          statusCode: response.status,
          statusText: response.statusText,
          message: `El servidor n8n respondió con estado HTTP ${response.status} (${response.statusText}).`,
          latencyMs,
          testCredential,
        };
      }
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      return {
        connected: false,
        endpoint,
        workflowsUrl,
        message: `Error de conexión con n8n: ${err.message}`,
        latencyMs,
        testCredential,
      };
    }
  }

  /**
   * Dedicated webhook paths and workflow IDs for each agent role
   */
  public static readonly AGENT_WEBHOOKS: Record<string, { webhookPath: string; workflowId: string; name: string }> = {
    CEO: {
      webhookPath: '/webhook/sleeply-chat-principal',
      workflowId: 'HKDqzxQSleroRA0V',
      name: 'Alex Vance',
    },
    ASSISTANT: {
      webhookPath: '/webhook/sleeply-secretary-agent',
      workflowId: 'Ei8laDc9CAdA4IaB',
      name: 'Taylor Chen',
    },
    COWORKER: {
      webhookPath: '/webhook/sleeply-coworker-agent',
      workflowId: 'jMxiFZxMnkl9LsbQ',
      name: 'Sam Rivera',
    },
    MANAGER: {
      webhookPath: '/webhook/sleeply-manager-agent',
      workflowId: 'uwJCpuo5d0650cIv',
      name: 'Jordan Díaz',
    },
  };

  /**
   * Dispatches task orchestration payload directly to an agent-specific n8n webhook
   */
  public async dispatchToAgent(agentCode: string, payload: N8nTriggerPayload): Promise<{
    dispatched: boolean;
    n8nStatus?: number;
    responseBody?: any;
    workflowId?: string;
    error?: string;
  }> {
    const code = agentCode.toUpperCase();
    const agentConfig = N8nService.AGENT_WEBHOOKS[code];
    const targetUrl = agentConfig
      ? `${env.N8N_BASE_URL}${agentConfig.webhookPath}`
      : env.N8N_WEBHOOK_URL;
    const apiKey = env.N8N_API_KEY;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 75000);

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': apiKey,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json().catch(() => ({ raw: 'Non-JSON response' }));

      return {
        dispatched: response.ok,
        n8nStatus: response.status,
        responseBody: data,
        workflowId: agentConfig?.workflowId,
      };
    } catch (err: any) {
      console.warn(`[N8nService dispatchToAgent:${code}] Fallback local execution:`, err.message);
      return {
        dispatched: false,
        workflowId: agentConfig?.workflowId,
        error: err.message,
      };
    }
  }

  /**
   * Dispatches task orchestration payload to central n8n orchestrator webhook
   */
  public async dispatchToN8n(payload: N8nTriggerPayload): Promise<{
    dispatched: boolean;
    n8nStatus?: number;
    responseBody?: any;
    error?: string;
  }> {
    const webhookUrl = env.N8N_WEBHOOK_URL;
    const apiKey = env.N8N_API_KEY;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 75000);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': apiKey,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json().catch(() => ({ raw: 'Non-JSON response' }));

      return {
        dispatched: response.ok,
        n8nStatus: response.status,
        responseBody: data,
      };
    } catch (err: any) {
      console.warn('[N8nService dispatchToN8n] Fallback local simulated orchestration:', err.message);
      return {
        dispatched: false,
        error: err.message,
      };
    }
  }
}

export const n8nService = new N8nService();

