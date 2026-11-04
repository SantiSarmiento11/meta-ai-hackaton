const API_BASE_URL = 'http://localhost:3001/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface OfficeObjectData {
  id?: string;
  objectId: string;
  instanceId?: string;
  col: number;
  row: number;
  width?: number;
  height?: number;
}

export interface OfficeData {
  id?: string;
  name?: string;
  currentMode: 'day' | 'night' | 'DAY' | 'NIGHT';
  selectedAvatarId?: string;
  zoomLevel?: number;
  isGridVisible?: boolean;
  objects?: OfficeObjectData[];
}

export interface AgentData {
  id: string;
  code: string;
  name: string;
  description: string;
  avatar: string;
  status: string;
  instructions: string;
}

export interface AgentLiveState {
  code: 'ASSISTANT' | 'COWORKER' | 'MANAGER';
  name: string;
  role: string;
  avatar: string;
  status: 'IDLE' | 'WORKING' | 'SUCCESS' | 'ERROR';
  activeWorkflow: string;
  workflowId: string;
  currentAction: string;
  bubbleMessage: string;
  metaAiEndpoint: string;
  lastUpdated: string;
  recentLogs: string[];
}

export interface N8nTestResponse {
  connected: boolean;
  endpoint: string;
  workflowsUrl?: string;
  statusCode?: number;
  message: string;
  latencyMs: number;
  workflowsCount?: number;
  workflows?: Array<{ id: string; name: string; active: boolean }>;
  testCredential: {
    service: string;
    apiKeyPreview: string;
    baseUrl: string;
    workflowsUrl?: string;
    webhookUrl: string;
    metaAiConfigured?: boolean;
    metaAiKeyPreview?: string;
  };
}

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('sleeply_jwt_token');
  }

  public setToken(token: string): void {
    localStorage.setItem('sleeply_jwt_token', token);
  }

  public removeToken(): void {
    localStorage.removeItem('sleeply_jwt_token');
    localStorage.removeItem('sleeply_user');
  }

  public getStoredUser(): User | null {
    const raw = localStorage.getItem('sleeply_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public setStoredUser(user: User): void {
    localStorage.setItem('sleeply_user', JSON.stringify(user));
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Error en la solicitud: ${response.statusText}`);
    }

    return data;
  }

  // Auth Endpoints
  public async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await this.request<{ success: boolean; user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.token);
    this.setStoredUser(res.user);
    return res;
  }

  public async register(email: string, password: string, name: string): Promise<{ user: User; token: string }> {
    const res = await this.request<{ success: boolean; user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    this.setToken(res.token);
    this.setStoredUser(res.user);
    return res;
  }

  public async getCurrentUser(): Promise<User> {
    const res = await this.request<{ success: boolean; user: User }>('/auth/me');
    this.setStoredUser(res.user);
    return res.user;
  }

  public logout(): void {
    this.removeToken();
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Office Endpoints
  public async getOffice(): Promise<OfficeData> {
    const res = await this.request<{ success: boolean; office: OfficeData }>('/office');
    return res.office;
  }

  public async saveOffice(office: OfficeData): Promise<OfficeData> {
    const res = await this.request<{ success: boolean; office: OfficeData }>('/office/save', {
      method: 'POST',
      body: JSON.stringify(office),
    });
    return res.office;
  }

  // Agent Endpoints
  public async getAgents(): Promise<AgentData[]> {
    const res = await this.request<{ success: boolean; agents: AgentData[] }>('/agents');
    return res.agents;
  }

  public async getAgentActivity(): Promise<AgentLiveState[]> {
    const res = await this.request<{ success: boolean; states: AgentLiveState[] }>('/agents/activity');
    return res.states;
  }

  public async executeAgentAction(
    code: string,
    actionName: string
  ): Promise<{ success: boolean; message: string; result: any; state: AgentLiveState }> {
    const res = await this.request<{ success: boolean; message: string; result: any; state: AgentLiveState }>(
      `/agents/${code}/action`,
      {
        method: 'POST',
        body: JSON.stringify({ actionName }),
      }
    );
    return res;
  }

  // Automation & n8n
  public async testN8nConnection(): Promise<N8nTestResponse> {
    const res = await this.request<{ success: boolean; data: N8nTestResponse }>('/automation/n8n/test');
    return res.data;
  }
}

export const api = new ApiService();
