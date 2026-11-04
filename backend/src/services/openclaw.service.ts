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
          message: 'Conectado exitosamente a OpenClaw en local (Puerto 18789)',
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
        message: `OpenClaw Gateway respondió con error HTTP ${response.status}: ${response.statusText}`,
        latencyMs,
        activeModel: env.OPENCLAW_MODEL,
      };
    } catch (error: any) {
      const latencyMs = Date.now() - startTime;
      return {
        connected: false,
        endpoint,
        message: error.name === 'AbortError'
          ? 'Timeout al conectar con OpenClaw Gateway en local (> 4000ms)'
          : `No se pudo conectar a OpenClaw en local: ${error.message}`,
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

    const systemPrompt = `Eres Alex Vance, CEO & Tech Lead de Sleeply y Orquestador Principal del equipo multiagente autónomo en la oficina virtual isométrica.
Estás ejecutándote localmente conectado a través de OpenClaw Gateway con el modelo Meta AI (Muse Spark).
Tu rol es responder y coordinar a tu equipo compuesto por:
1. Sam Rivera (Co-worker / Software Engineer): Maneja repositorios GitHub (sleeply-core-engine, sleeply-web-office, meta-hackaton-agents), PRs, ramas y pruebas con Antigravity CLI.
2. Taylor Chen (Secretaria Ejecutiva): Gestiona bandejas de Gmail (sansamablogers@gmail.com), sincroniza Google Calendar y minutas/entregables en Google Drive.
3. Jordan Díaz (Manager de Operaciones): Monitoreo continuo de salud, base de datos PostgreSQL 17 (sleeply_db), Sentry (0 incidentes) y auditoría nocturna en Modo Sueño.

Modo actual de la oficina: ${params.operatingMode || 'day'}.

Instrucciones de formato:
- Responde de forma clara, profesional y concisa (1 o 2 párrafos).
- Indica con precisión qué acción tomaste o a quién delegaste la tarea.
- Al final de tu respuesta, SIEMPRE incluye un bloque exacto con este formato:
BREVE REPORTE:
- Agente Principal: Alex Vance (CEO) [OpenClaw Local]
- Delegado a: [Alex Vance (CEO) | Sam Rivera (Co-worker) | Taylor Chen (Secretaria) | Jordan Díaz (Manager)]
- Servicios: [GitHub | Gmail & Drive & Calendar | PostgreSQL & Sentry]
- Estado: [100% coordinado | En ejecución | Tarea completada con éxito]`;

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
      let agentRole = 'CEO & Tech Lead / Agente Principal (OpenClaw)';
      let avatar = 'char_0';

      if (lowerText.includes('sam') || lowerText.includes('github') || lowerText.includes('pr') || lowerText.includes('commit') || lowerText.includes('código')) {
        agentCode = 'COWORKER';
        agentName = 'Sam Rivera';
        agentRole = 'Co-worker / Software Engineer';
        avatar = 'char_1';
      } else if (lowerText.includes('taylor') || lowerText.includes('gmail') || lowerText.includes('drive') || lowerText.includes('calendar') || lowerText.includes('correo')) {
        agentCode = 'ASSISTANT';
        agentName = 'Taylor Chen';
        agentRole = 'Secretaria Ejecutiva';
        avatar = 'char_2';
      } else if (lowerText.includes('jordan') || lowerText.includes('manager') || lowerText.includes('sentry') || lowerText.includes('postgres') || lowerText.includes('auditoría')) {
        agentCode = 'MANAGER';
        agentName = 'Jordan Díaz';
        agentRole = 'Manager de Operaciones';
        avatar = 'char_3';
      }

      // Extract brief report if present
      let briefReport: string | undefined;
      const reportIndex = content.indexOf('BREVE REPORTE:');
      if (reportIndex !== -1) {
        briefReport = content.slice(reportIndex).trim();
      } else {
        briefReport =
          `BREVE REPORTE:\n- Agente Principal: Alex Vance (CEO) [OpenClaw Local]\n- Delegado a: ${agentName}\n- Servicios: Local Gateway (127.0.0.1:18789) + Meta AI\n- Estado: 100% coordinado.`;
      }

      return {
        success: true,
        reply: content,
        agentCode,
        agentName,
        agentRole,
        avatar,
        actionTaken: agentCode === 'CEO'
          ? 'Orquestación procesada mediante OpenClaw Gateway (local)'
          : `Delegado a ${agentName} vía OpenClaw Local Gateway`,
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
