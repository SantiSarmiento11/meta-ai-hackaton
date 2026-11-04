import { Response } from 'express';
import { prisma } from '../database/prisma';
import { AuthRequest } from '../types';
import { AgentStatus } from '@prisma/client';
import { agentActivityService } from '../services/agentActivity.service';
import { metaAiService } from '../services/metaAi.service';

export const getAgents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const agents = await prisma.agent.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    res.status(200).json({
      success: true,
      agents,
    });
  } catch (error: any) {
    console.error('[GetAgents Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching agents: ' + error.message,
    });
  }
};

export const getAgentActivity = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const states = agentActivityService.getAllStates();
    res.status(200).json({
      success: true,
      states,
    });
  } catch (error: any) {
    console.error('[GetAgentActivity Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching agent activity: ' + error.message,
    });
  }
};

export const updateAgentActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { agentCode, status, activeWorkflow, currentAction, bubbleMessage, logEntry } = req.body;
    if (!agentCode) {
      res.status(400).json({ success: false, error: 'agentCode is required' });
      return;
    }

    const state = agentActivityService.updateActivity({
      agentCode,
      status,
      activeWorkflow,
      currentAction,
      bubbleMessage,
      logEntry,
    });

    res.status(200).json({
      success: true,
      message: 'Agent activity updated successfully',
      state,
    });
  } catch (error: any) {
    console.error('[UpdateAgentActivity Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating agent activity: ' + error.message,
    });
  }
};

export const executeAgentAction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const code = req.params.code as string;
    const { actionName } = req.body;
    const userId = req.user?.id;

    if (!code) {
      res.status(400).json({ success: false, error: 'Agent code is required' });
      return;
    }

    const result = await agentActivityService.executeAgentAction(
      code,
      actionName || 'Automated Execution',
      userId
    );

    res.status(200).json({
      message: `Action executed successfully for ${code}`,
      ...result,
    });
  } catch (error: any) {
    console.error('[ExecuteAgentAction Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Error executing agent action: ' + error.message,
    });
  }
};

export const updateAgent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const id = req.params.id as string;
    const { instructions, status, name } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const existingAgent = await prisma.agent.findFirst({
      where: { id, userId },
    });

    if (!existingAgent) {
      res.status(404).json({ success: false, error: 'Agent not found' });
      return;
    }

    const updatedAgent = await prisma.agent.update({
      where: { id },
      data: {
        ...(instructions !== undefined && { instructions }),
        ...(status && { status: status as AgentStatus }),
        ...(name && { name }),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Agent updated successfully',
      agent: updatedAgent,
    });
  } catch (error: any) {
    console.error('[UpdateAgent Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating agent: ' + error.message,
    });
  }
};

export const chatWithPrincipalAgent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message, targetAgentCode } = req.body;
    const userId = req.user?.id;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ success: false, error: 'Message is required' });
      return;
    }

    const result = await agentActivityService.chatWithPrincipalAgent({
      message,
      userId,
      targetAgentCode,
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error('[ChatWithPrincipalAgent Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Error processing message with principal agent: ' + error.message,
    });
  }
};

export const getChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        agent: true,
      },
    });

    const history = tasks.reverse().map((t) => {
      const agentCode = (t.agent?.code || 'CEO') as 'CEO' | 'COWORKER' | 'ASSISTANT' | 'MANAGER';
      const agentName = t.agent?.name || 'Alex Vance';
      const avatar = t.agent?.avatar || 'char_0';

      return {
        id: t.id,
        userMessage: t.title,
        reply: t.result || t.description,
        agentCode,
        agentName,
        avatar,
        status: t.status,
        createdAt: t.createdAt.toISOString(),
      };
    });

    res.status(200).json({
      success: true,
      history,
    });
  } catch (error: any) {
    console.error('[GetChatHistory Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching chat history: ' + error.message,
    });
  }
};

export const getMetaAiStatus = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const status = await metaAiService.testConnection();
    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Error testing Meta AI status: ' + error.message,
    });
  }
};

export const getCoworkerRepositories = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const repositories = agentActivityService.getCoworkerRepositories();
    res.status(200).json({
      success: true,
      repositories,
    });
  } catch (error: any) {
    console.error('[GetCoworkerRepositories Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching GitHub repositories: ' + error.message,
    });
  }
};

export const executeCoworkerRepoAction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { repoName, actionType, customInstruction } = req.body;
    const userId = req.user?.id;

    if (!repoName || !actionType) {
      res.status(400).json({ success: false, error: 'repoName and actionType are required' });
      return;
    }

    const result = await agentActivityService.executeCoworkerRepoAction({
      repoName,
      actionType,
      customInstruction,
      userId,
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error('[ExecuteCoworkerRepoAction Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Error executing GitHub action: ' + error.message,
    });
  }
};

export const getSecretaryDriveFiles = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = agentActivityService.getSecretaryDriveFiles();
    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    console.error('[GetSecretaryDriveFiles Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching Google Drive files: ' + error.message,
    });
  }
};

export const executeSecretaryDriveAction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { docId, actionType, customInstruction } = req.body;
    const userId = req.user?.id;

    if (!actionType) {
      res.status(400).json({ success: false, error: 'actionType is required' });
      return;
    }

    const result = await agentActivityService.executeSecretaryDriveAction({
      docId,
      actionType,
      customInstruction,
      userId,
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error('[ExecuteSecretaryDriveAction Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Error executing Assistant/Drive action: ' + error.message,
    });
  }
};

export const getManagerSystemHealth = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = agentActivityService.getManagerSystemHealth();
    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    console.error('[GetManagerSystemHealth Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching system health: ' + error.message,
    });
  }
};

export const executeManagerAction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { actionType, customInstruction } = req.body;
    const userId = req.user?.id;

    if (!actionType) {
      res.status(400).json({ success: false, error: 'actionType is required' });
      return;
    }

    const result = await agentActivityService.executeManagerAuditAction({
      actionType,
      customInstruction,
      userId,
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error('[ExecuteManagerAction Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Error executing Manager action: ' + error.message,
    });
  }
};

