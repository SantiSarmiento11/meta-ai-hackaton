import { env } from '../config/env';

export interface OpenClawConnectionTestResult {
  connected: boolean;
  endpoint: string;
  statusCode?: number;
  message: string;
  latencyMs: number;
  modelsCount?: number;
  models?: Array<{ id: string; ownedBy?: string }>;
  activeModel: string;
}

export interface OpenClawChatResult {
  success: boolean;
  reply: string;
  agentCode: 'CEO' | 'COWORKER' | 'ASSISTANT' | 'MANAGER';
  agentName: string;
  agentRole: string;
  avatar: string;
  actionTaken?: string;
  briefReport?: string;
  timestamp: string;
}

export class OpenClawService {
  /**
   * Test live connectivity to local OpenClaw Gateway instance
   */
  public async testConnection(): Promise<OpenClawConnectionTestResult> {
    const startTime = Date.now();
    const endpoint = env.OPENCLAW_BASE_URL;
    const token = env.OPENCLAW_TOKEN;

    if (!env.OPENCLAW_ENABLED) {
      return {
        connected: false,
        endpoint,
        message: 'OpenClaw integration is disabled in environment configuration',
        latencyMs: 0,
        activeModel: env.OPENCLAW_MODEL,
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(`${endpoint}/v1/models`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      if (response.ok) {
        const body = (await response.json()) as any;
        const models = Array.isArray(body?.data)
          ? body.data.map((m: any) => ({ id: m.id, ownedBy: m.owned_by }))
          : [];

        return {
          connected: true,
          endpoint,
          statusCode: response.status,
          message: 'Successfully connected to local OpenClaw Gateway (Port 18789)',
          latencyMs,
          modelsCount: models.length,
          models,
          activeModel: env.OPENCLAW_MODEL,
        };
      }

      return {
        connected: false,
        endpoint,
        statusCode: response.status,
        message: `OpenClaw Gateway responded with HTTP error ${response.status}: ${response.statusText}`,
        latencyMs,
        activeModel: env.OPENCLAW_MODEL,
      };
    } catch (error: any) {
      const latencyMs = Date.now() - startTime;
      return {
        connected: false,
        endpoint,
        message: error.name === 'AbortError'
          ? 'Timeout connecting to local OpenClaw Gateway (> 4000ms)'
          : `Could not connect to local OpenClaw Gateway: ${error.message}`,
        latencyMs,
        activeModel: env.OPENCLAW_MODEL,
      };
    }
  }

  /**
   * Dispatches a user query to the local OpenClaw AI Gateway agent
   */
  public async chatCompletion(params: {
    message: string;
    userId?: string;
    operatingMode?: 'day' | 'night' | 'awake' | 'sleep';
  }): Promise<OpenClawChatResult | null> {
    if (!env.OPENCLAW_ENABLED) {
      return null;
    }

    const endpoint = env.OPENCLAW_BASE_URL;
    const token = env.OPENCLAW_TOKEN;

    const systemPrompt = `You are Alex Vance, CEO & Tech Lead of Sleeply and Principal Orchestrator of the autonomous multi-agent team in the 2D isometric office.
You are running locally connected via OpenClaw Gateway with the Meta AI model (Muse Spark).
Your role is to respond and coordinate your team consisting of:
1. Sam Rivera (Co-worker / Software Engineer): Manages GitHub repositories (sleeply-core-engine, sleeply-web-office, meta-hackaton-agents), PRs, branches, and Antigravity CLI tests.
2. Taylor Chen (Executive Assistant): Manages Gmail inbox (sansamablogers@gmail.com), synchronizes Google Calendar, and updates Google Drive files and meeting minutes.
3. Jordan Díaz (Operations Manager): Continuous system health monitoring, PostgreSQL 17 database (sleeply_db), Sentry (0 incidents), and night-shift Sleep Mode auditing.

Current office operating mode: ${params.operatingMode || 'day'}.

Formatting instructions:
- Respond clearly, professionally, and concisely (1 or 2 paragraphs).
- Specify precisely what action was executed or to whom you delegated the task.
- At the end of your response, ALWAYS include an exact block with this format:
BRIEF REPORT:
- Principal Agent: Alex Vance (CEO) [OpenClaw Local]
- Delegated to: [Alex Vance (CEO) | Sam Rivera (Co-worker) | Taylor Chen (Executive Assistant) | Jordan Díaz (Operations Manager)]
- Services: [GitHub | Gmail & Drive & Calendar | PostgreSQL & Sentry]
- Status: [100% coordinated | In execution | Task completed successfully]`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      const response = await fetch(`${endpoint}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          model: env.OPENCLAW_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: params.message },
          ],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[OpenClawService] Chat completion failed with status ${response.status}`);
        return null;
      }

      const data = (await response.json()) as any;
      const content: string = data?.choices?.[0]?.message?.content || '';

      if (!content) {
        return null;
      }

      // Detect responding agent code
      const lowerText = (content + ' ' + params.message).toLowerCase();
      let agentCode: 'CEO' | 'COWORKER' | 'ASSISTANT' | 'MANAGER' = 'CEO';
      let agentName = 'Alex Vance';
      let agentRole = 'CEO & Tech Lead / Principal Agent (OpenClaw)';
      let avatar = 'char_0';

      if (lowerText.includes('sam') || lowerText.includes('github') || lowerText.includes('pr') || lowerText.includes('commit') || lowerText.includes('code') || lowerText.includes('código')) {
        agentCode = 'COWORKER';
        agentName = 'Sam Rivera';
        agentRole = 'Co-worker / Software Engineer';
        avatar = 'char_1';
      } else if (lowerText.includes('taylor') || lowerText.includes('gmail') || lowerText.includes('drive') || lowerText.includes('calendar') || lowerText.includes('email') || lowerText.includes('correo')) {
        agentCode = 'ASSISTANT';
        agentName = 'Taylor Chen';
        agentRole = 'Executive Assistant';
        avatar = 'char_2';
      } else if (lowerText.includes('jordan') || lowerText.includes('manager') || lowerText.includes('sentry') || lowerText.includes('postgres') || lowerText.includes('audit') || lowerText.includes('auditoría')) {
        agentCode = 'MANAGER';
        agentName = 'Jordan Díaz';
        agentRole = 'Operations Manager';
        avatar = 'char_3';
      }

      // Extract brief report if present
      let briefReport: string | undefined;
      const reportIndex = content.indexOf('BRIEF REPORT:') !== -1 ? content.indexOf('BRIEF REPORT:') : content.indexOf('BREVE REPORTE:');
      if (reportIndex !== -1) {
        briefReport = content.slice(reportIndex).trim();
      } else {
        briefReport =
          `BRIEF REPORT:\n- Principal Agent: Alex Vance (CEO) [OpenClaw Local]\n- Delegated to: ${agentName}\n- Services: Local Gateway (127.0.0.1:18789) + Meta AI\n- Status: 100% coordinated.`;
      }

      return {
        success: true,
        reply: content,
        agentCode,
        agentName,
        agentRole,
        avatar,
        actionTaken: agentCode === 'CEO'
          ? 'Orchestration processed via OpenClaw Gateway (local)'
          : `Delegated to ${agentName} via OpenClaw Local Gateway`,
        briefReport,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      console.warn('[OpenClawService] Chat Completion Exception:', err.message);
      return null;
    }
  }
}

export const openClawService = new OpenClawService();
