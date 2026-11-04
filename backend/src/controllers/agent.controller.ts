import { Response } from 'express';
import { prisma } from '../database/prisma';
import { AuthRequest } from '../types';
import { AgentStatus } from '@prisma/client';
import { agentActivityService } from '../services/agentActivity.service';

export const getAgents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'No autorizado' });
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
      error: 'Error al obtener los agentes: ' + error.message,
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
      error: 'Error al obtener la actividad de agentes: ' + error.message,
    });
  }
};

export const updateAgentActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { agentCode, status, activeWorkflow, currentAction, bubbleMessage, logEntry } = req.body;
    if (!agentCode) {
      res.status(400).json({ success: false, error: 'agentCode es requerido' });
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
      message: 'Actividad de agente actualizada',
      state,
    });
  } catch (error: any) {
    console.error('[UpdateAgentActivity Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar actividad de agente: ' + error.message,
    });
  }
};

export const executeAgentAction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const code = req.params.code as string;
    const { actionName } = req.body;
    const userId = req.user?.id;

    if (!code) {
      res.status(400).json({ success: false, error: 'Código de agente es requerido' });
      return;
    }

    const result = await agentActivityService.executeAgentAction(
      code,
      actionName || 'Ejecución Automática',
      userId
    );

    res.status(200).json({
      message: `Acción ejecutada exitosamente para ${code}`,
      ...result,
    });
  } catch (error: any) {
    console.error('[ExecuteAgentAction Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Error al ejecutar acción de agente: ' + error.message,
    });
  }
};

export const updateAgent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const id = req.params.id as string;
    const { instructions, status, name } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, error: 'No autorizado' });
      return;
    }

    const existingAgent = await prisma.agent.findFirst({
      where: { id, userId },
    });

    if (!existingAgent) {
      res.status(404).json({ success: false, error: 'Agente no encontrado' });
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
      message: 'Agente actualizado exitosamente',
      agent: updatedAgent,
    });
  } catch (error: any) {
    console.error('[UpdateAgent Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar el agente: ' + error.message,
    });
  }
};
